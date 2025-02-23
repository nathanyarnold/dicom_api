import dicomParser, { parseDicom, DataSet } from "dicom-parser";
import { PNG } from "pngjs";

// TypeScript
export type DicomHeaderValue = string | number | undefined | null;
export interface DicomHeadersValues {
  [tag: string]: DicomHeaderValue;
}
export interface ExtractPngFromDicomFileReturn {
  success: boolean;
  error?: Error;
  file?: File;
}

/**
 * Sanitizes a DICOM tag by removing whitespace and normalizing the format.
 * @param tag - The DICOM tag to sanitize as a STRING.
 * @returns The sanitized DICOM tag as a STRING, or NULL if the input is invalid.
 */
export function sanitizeDicomTag(tag: string | null): string | null {
  if (!tag) return null; // Handle null or undefined input
  let newTag = tag;

  // Trim whitespace
  newTag = newTag.trim();

  // Check if tag starts with "0x" (hex notation) and normalize
  if (newTag.startsWith("0x")) {
    newTag = newTag.slice(2); // Remove "0x" prefix
  }

  // for now, remove any prefix 'x' chars
  if (newTag.startsWith("x")) {
    newTag = newTag.slice(1); // Remove "0x" prefix
  }

  // Ensure the tag consists only of valid hexadecimal characters
  if (!/^[0-9A-Fa-f]{8}$/.test(newTag)) {
    return null; // Invalid tag format, return null
  }

  // capitalize the tag
  newTag = newTag.toUpperCase();

  // add the beginning 'x' to the tag, and return
  return `x${newTag}`;
}

/**
 * Validates that the file is a valid DICOM file.
 * @param file - The file content as a FILE
 * @returns boolean indicating whether the file is a DICOM file.
 */
export async function validateDicomFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dicomSignature = buffer.toString("hex", 128, 132);
  return dicomSignature === "4449434d";
}

/**
 * Extracts a single DICOM header attribute from a DICOM file stored in a Buffer.
 * @param tag - The DICOM tag to extract as a STRING.
 * @param dataSet - The parsed DICOM file as ANY.
 * @returns boolean indicating whether the file is a DICOM file.
 */
function extractHeaderByTag(tag: string, dataSet: DataSet): DicomHeaderValue {
  return dataSet.string(tag) ?? dataSet.uint16(tag) ?? dataSet.uint32(tag);
}

/**
 * Extracts all DICOM header attributes from a DICOM file stored in a Buffer.
 * @param fileBuffer - The DICOM file content as a Buffer.
 * @returns An object containing all extracted DICOM tags.
 */
export function extractAllDicomHeaders(
  fileBuffer: Buffer | undefined
): DicomHeadersValues {
  // validate file is sent
  if (!fileBuffer) return {};

  try {
    // Parse the DICOM file
    const dataSet = dicomParser.parseDicom(fileBuffer);

    // Extract all DICOM headers
    const tags: DicomHeadersValues = {};
    dataSet.elements &&
      Object.keys(dataSet.elements).forEach((tag) => {
        tags[tag] = extractHeaderByTag(tag, dataSet);
      });

    return tags;
  } catch (error) {
    return {};
  }
}

/**
 * Extracts a single dicom header, using a supplied tag
 * @param tag - the tag desired, in String format
 * @param fileBuffer - The DICOM file content as a Buffer.
 * @returns An object containing the extracted DICOM tag.
 * Note Undefined is returned if the tag exists, but has an undefined value.
 * Note Null is returned if the tag does not exist.
 */
export async function extractDicomHeaderByTag(
  tag: string,
  fileBuffer: Buffer | undefined
): Promise<DicomHeaderValue> {
  // validate file is sent
  if (!fileBuffer) return null;

  // Extract one header using the supplied tag
  try {
    const dataSet = dicomParser.parseDicom(fileBuffer);
    const element = dataSet.elements[tag];
    if (element) {
      return extractHeaderByTag(tag, dataSet);
    } else {
      return null;
    }
  } catch (error) {
    return null;
  }
}

/**
 * Converts a PNG object to a File object.
 * @param png - The PNG object to be converted in Buffer format.
 * @param fileName - The desired name for the output file.
 * @returns A promise that resolves to a File object containing the PNG data.
 */
async function convertPNGToFile(png: PNG, fileName: string): Promise<File> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];

    png
      .pack()
      .on("data", (chunk) => chunks.push(chunk))
      .on("end", () => {
        const buffer = Buffer.concat(chunks);
        const file = new File([buffer], fileName, { type: "image/png" });
        resolve(file);
      })
      .on("error", reject);
  });
}

/**
 * Extracts a PNG image from a DICOM file stored in a Buffer.
 * @param fileBuffer - The DICOM file content as a Buffer.
 * @param fileName - The desired name for the output PNG file.
 * @returns A promise that resolves to an object containing:
 *  - `success`: A boolean indicating whether the PNG was extracted successfully.
 *  - `error`: An error object if the extraction failed.
 *  - `file`: The extracted PNG file as a File object, or `undefined` if the extraction failed.
 */
export async function extractPngFromDicom(
  fileBuffer: Buffer,
  fileName: string
): Promise<ExtractPngFromDicomFileReturn> {
  try {
    // Parse the DICOM file
    const dataSet = dicomParser.parseDicom(fileBuffer);

    // Extract necessary attributes
    const rows = dataSet.uint16("x00280010"); // Number of rows (height)
    const cols = dataSet.uint16("x00280011"); // Number of columns (width)
    const pixelDataElement = dataSet.elements.x7fe00010; // Pixel data tag

    if (!pixelDataElement) {
      return {
        success: false,
        error: new Error("No pixel data found in the DICOM file."),
      };
    }

    // Extract pixel data
    const pixelData = new Uint16Array(
      dataSet.byteArray.buffer,
      pixelDataElement.dataOffset,
      pixelDataElement.length / 2
    );

    // Find max pixel value manually (avoiding stack overflow)
    let maxPixelValue = 0;
    for (let i = 0; i < pixelData.length; i++) {
      if (pixelData[i] > maxPixelValue) {
        maxPixelValue = pixelData[i];
      }
    }

    // Normalize and write to PNG
    const png = new PNG({ width: cols, height: rows, bitDepth: 8 });

    for (let i = 0; i < pixelData.length; i++) {
      const normalizedValue =
        maxPixelValue > 0
          ? Math.floor((pixelData[i] / maxPixelValue) * 255)
          : 0;
      const idx = i * 4;
      png.data[idx] = normalizedValue; // R
      png.data[idx + 1] = normalizedValue; // G
      png.data[idx + 2] = normalizedValue; // B
      png.data[idx + 3] = 255; // Alpha (fully opaque)
    }

    // convert PNG into a Buffer
    const pngBuffer = await convertPNGToFile(png, fileName);
    return { success: true, file: pngBuffer };
  } catch (error) {
    return {
      success: false,
      error: new Error("Error extracting PNG from DICOM"),
    };
  }
}

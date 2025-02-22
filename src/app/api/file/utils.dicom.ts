import dicomParser, { parseDicom } from "dicom-parser";
import { PNG } from "pngjs";

// TypeScript
export type DicomHeaderValue = string | number | null;
export interface DicomHeadersValues {
  [tag: string]: DicomHeaderValue;
}
export interface ExtractPngFromDicomFileReturn {
  success: boolean;
  error?: Error;
  file?: File;
}

/**
 * Validates that the file is in DICOM format.
 * @param buffer - The DICOM file content as a Buffer.
 * @returns bolean TRUE || FALSE depending on whether the file is a DICOM file.
 */
export async function validateDicomFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dicomSignature = buffer.toString("hex", 128, 132);
  return dicomSignature === "4449434d";
}

function extractHeaderByTag(tag: string, dataSet: any) {
  return dataSet.string(tag) ?? dataSet.uint16(tag) ?? dataSet.uint32(tag);
}

/**
 * Extracts all DICOM header attributes from a DICOM file stored in a Buffer.
 * @param buffer - The DICOM file content as a Buffer.
 * @returns An object containing all extracted DICOM tags.
 */
export function extractAllDicomHeaders(
  file: Buffer | undefined
): DicomHeadersValues {
  // validate file is sent
  if (!file) return {};

  try {
    // Parse the DICOM file
    const dataSet = dicomParser.parseDicom(file);

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
 * @param tag
 * @param filePath
 * @returns
 */
export async function extractDicomHeaderByTag(
  tag: string,
  file: Buffer | undefined
): Promise<DicomHeaderValue> {
  // validate file is sent
  if (!file) return null;

  // Extract one header using the supplied tag
  try {
    const dataSet = dicomParser.parseDicom(file);
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

// Function to convert a PNG to a File
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

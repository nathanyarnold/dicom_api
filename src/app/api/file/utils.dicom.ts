import dicomParser, { parseDicom } from "dicom-parser";

// TypeScript definitions
export type DicomHeaderValue = string | number | null;
export interface DicomHeadersValues {
  [tag: string]: DicomHeaderValue;
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
    console.error("Error parsing DICOM file:", error);
    return null;
  }
}

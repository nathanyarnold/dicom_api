import * as path from "path";
import fs from "fs";

// TypeSript
export interface SaveFileLocallyReturn {
  success: boolean;
  fileName: string | undefined;
}
export interface ReadLocalFileReturn {
  success: boolean;
  file: Buffer | undefined;
}

// file paths and names
// NOTE: This is for POC purposes only. Do not hardcode file paths in production.
// For production we would need a more robust storage method, that allows for scaling
// of both users and files.
export const FILE_PATH = process.cwd() + "/public/assets/";
export const TEST_FILENAME_DCM = "test-file.dcm"; // for demo purposes only
export const TEST_FILENAME_PNG = "test-file.png"; // for demo purposes only

/**
 * Sanitizes the file name by replacing spaces with underscores and only allowing alphanumeric characters, hyphens, underscores, and periods.
 *
 * @param fileName - The original file name.
 * @returns The sanitized file name.
 */
export function sanitizeFileName(fileName: string | null): string {
  // handle no filename
  if (!fileName) return "";

  // handle filename
  const saferFileName = fileName
    .replaceAll(" ", "_") // replaces spaces with underscores
    .replace(/[^a-zA-Z0-9-_\.]/g, ""); // remove all unwanted characters
  return saferFileName;
}

/**
 * Takes a filename, with our without an extension, and returns that filename with a `.png` extension.
 *
 * @param filename - The original file name.
 * @returns The file name with the `.png` extension.
 */
export function changeToPngExtension(filename: string): string {
  // Get the base name without extension
  const baseName = path.parse(filename).name;
  // Return the new filename with `.png` extension
  return `${baseName}.png`;
}

/**
 * Saves a file locally to the specified file path.
 *
 * @param file - The file to be saved, represented as a `File` object.
 * @param fileName - The name to save the file as.
 * @returns A promise that resolves to an object containing:
 *  - `success`: A boolean indicating whether the file was saved successfully.
 *  - `fileName`: The name of the saved file, or `undefined` if the save failed.
 */
export async function saveFileLocally(file: File): Promise<Return> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const saferFileName = sanitizeFileName(file.name);

  // craete path
  const filePath = FILE_PATH + saferFileName;

  try {
    fs.writeFileSync(filePath, buffer);
    return { success: true, fileName: saferFileName };
  } catch (error) {
    return { success: false, fileName: undefined };
  }
}

/**
 * Reads a file from the local file system.
 *
 * @param filename - The name of the file to read.
 * @returns A promise that resolves to an object containing:
 *  - `success`: A boolean indicating whether the file was read successfully.
 *  - `file`: The file content as a `Buffer`, or `undefined` if the read failed.
 */
export async function readLocalFile(
  filename: string
): Promise<ReadLocalFileReturn> {
  // assemble filepath
  const filepath = FILE_PATH + filename;

  // try and read file and return it as a Buffer type
  try {
    const file = fs.readFileSync(filepath);
    return { success: true, file };
  } catch (error) {
    return { success: false, file: undefined };
  }
}

/**
 * Validates that the file is in PNG format.
 * @param fileBuffer - The file content as a Buffer.
 * @returns boolean indicating whether the file is a PNG file.
 */
export function validatePNGFileFormat(fileBuffer: Buffer): Boolean {
  // check if the arg is a buffer and is at least 8 bytes long
  if (!Buffer.isBuffer(fileBuffer) || fileBuffer.length < 8) {
    return false;
  }

  // this is something called the "Magic Number" for PNG files
  const pngSignature = Buffer.from([
    0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ]);

  return fileBuffer.slice(0, 8).equals(pngSignature);
}

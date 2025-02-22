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

// write files to filesystem
export async function saveFileLocally(
  file: File,
  fileName: string
): Promise<SaveFileLocallyReturn> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const saferFileName = fileName.replaceAll(" ", "_");
  const filePath = FILE_PATH + saferFileName;

  try {
    fs.writeFileSync(filePath, buffer);
    return { success: true, fileName: saferFileName };
  } catch (error) {
    return { success: false, fileName: undefined };
  }
}

// read a file from the filesystem
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

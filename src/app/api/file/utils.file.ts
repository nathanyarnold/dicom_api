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

// filePath
export const FILE_PATH = process.cwd() + "/public/assets/";
export const TEST_FILENAME_DCM = "test-file.dcm";
export const TEST_FILENAME_PNG = "test-file.png";

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

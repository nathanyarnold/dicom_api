import fs from "fs";

// filePath
const FILE_PATH = process.cwd() + "/public/assets/";

// write files to filesystem
export interface SaveFileLocallyReturn {
  success: boolean;
  fileName: string | undefined;
}
export async function saveFileLocally(
  file: File
): Promise<SaveFileLocallyReturn> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const fileName = file.name.replaceAll(" ", "_");
  const filePath = FILE_PATH + fileName;

  try {
    fs.writeFileSync(filePath, buffer);
    return { success: true, fileName };
  } catch (error) {
    return { success: false, fileName: undefined };
  }
}

// read a file from the filesystem
export interface ReadLocalFileReturn {
  success: boolean;
  file: Buffer | undefined;
}
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

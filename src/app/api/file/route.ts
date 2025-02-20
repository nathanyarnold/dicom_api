import { Request } from "node-fetch";
import fs from "fs";
// import path from "path";
// import { writeFile } from "fs/promises";
// import exp from "constants";

// filePath
const FILE_PATH = process.cwd() + "/public/assets/";

// Disable Next.js body parser (since formidable handles it)
export const config = {
  api: {
    bodyParser: false,
  },
};

export function outputJSONResponse(
  message: string,
  status?: 400 | 500 | undefined
) {
  const responseStatus = status || 200;
  return new Response(JSON.stringify({ message }), {
    status: responseStatus,
    headers: { "Content-Type": "application/json" },
  });
}

// validate file is in DICOM format
export async function isDicomFile(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const dicomSignature = buffer.toString("hex", 128, 132);
  return dicomSignature === "4449434d";
}

// write files to filesystem
export async function saveFileLocally(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  const filename = file.name.replaceAll(" ", "_");
  const filepath = FILE_PATH + filename;

  try {
    fs.writeFileSync(filepath, buffer);
    return { success: true, message: "File saved" };
  } catch (error) {
    return { success: false, message: "Error saving file" };
  }
}

// POST /api/file
export async function POST(request: Request) {
  // Validate: a file needs to be send using "multipart/form-data"
  if (!request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    return outputJSONResponse(
      "Invalid Content-Type, must be multipart/form-data",
      400
    );
  }

  // get "file"
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Validate: file is required
  if (!file || typeof file !== "object" || !file.name) {
    return outputJSONResponse("File is required", 400);
  }

  // Validate: file is in DICOM format
  const validFormat = await isDicomFile(file);
  if (!validFormat) {
    return outputJSONResponse(
      "Invalid file format, must be in DICOM format",
      400
    );
  }

  // save file to disk
  const saveResult = await saveFileLocally(file);
  if (saveResult.success) {
    return outputJSONResponse("File received and saved");
  } else {
    return outputJSONResponse("System error saving file", 500);
  }
}

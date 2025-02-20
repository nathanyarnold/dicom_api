import { Request } from "node-fetch";
import { returnJSONResponse } from "../utils.api";
import { saveFileLocally } from "./utils.file";
import { validateDicomFile } from "./utils.dicom";

// POST /api/file
export async function POST(request: Request) {
  // Validate: a file needs to be send using "multipart/form-data"
  if (!request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    return returnJSONResponse(
      { message: "Invalid Content-Type, must be multipart/form-data" },
      400
    );
  }

  // get "file"
  const formData = await request.formData();
  const file = formData.get("file") as File;

  // Validate: file is required
  if (!file || typeof file !== "object" || !file.name) {
    return returnJSONResponse({ message: "File is required" }, 400);
  }

  // Validate: file is in DICOM format
  const validFormat = await validateDicomFile(file);
  if (!validFormat) {
    return returnJSONResponse(
      { message: "Invalid file format, must be in DICOM format" },
      400
    );
  }

  // save file to disk
  const saveResult = await saveFileLocally(file);
  if (saveResult.success) {
    return returnJSONResponse({
      message: "File received and saved",
      fileName: saveResult.fileName,
    });
  } else {
    return returnJSONResponse({ message: "System error saving file" }, 500);
  }
}

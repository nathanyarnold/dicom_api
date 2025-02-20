import { Request } from "node-fetch";
import { returnJSONResponse } from "../../utils.api";
import { readLocalFile } from "../utils.file";
import { extractAllDicomHeaders } from "../utils.dicom";

export async function GET(request: Request) {
  // Read the file from the filesystem
  const fileResponse = await readLocalFile("ExampleDicomFile.DCM");

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // Extract DICOM tags
  const dicomTags = extractAllDicomHeaders(fileResponse.file);

  // output
  return returnJSONResponse(dicomTags);
}

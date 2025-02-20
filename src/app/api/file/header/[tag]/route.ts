import { Request } from "node-fetch";
import { returnJSONResponse } from "../../../utils.api";
import { readLocalFile } from "../../utils.file";
import { extractDicomHeaderByTag, DicomHeaderValue } from "../../utils.dicom";

export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  // get tag from the query params
  const { tag } = await params;

  // validate tag is present
  if (!tag) return returnJSONResponse({ message: "No tag is present" }, 400);

  // Read the file from the filesystem
  const fileResponse = await readLocalFile("ExampleDicomFile.DCM");

  // Validate: file is present
  if (!fileResponse.success) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // get single DICOM header, corresponding to tag
  const headerValue = (await extractDicomHeaderByTag(
    tag,
    fileResponse.file
  )) as DicomHeaderValue;

  // output
  return returnJSONResponse({ tag, value: headerValue });
}

import { Request } from "node-fetch";
import { returnJSONResponse } from "@/app/api/utils.api";
import {
  extractPngFromDicom,
  ExtractPngFromDicomFileReturn,
} from "@/app/api/file/utils.dicom";
import {
  readLocalFile,
  saveFileLocally,
  TEST_FILENAME_DCM,
  TEST_FILENAME_PNG,
} from "@/app/api/file/utils.file";
import * as dicomParser from "dicom-parser";

// POST /api/file/png
export async function POST(request: Request) {
  // Read the file from the filesystem
  const fileResponse = await readLocalFile(TEST_FILENAME_DCM);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // Validate: file is a DICOMa
  const dicomData = dicomParser.parseDicom(fileResponse.file);
  if (!dicomData.elements.x7fe00010) {
    return returnJSONResponse({ message: "File is not a DICOM" }, 400);
  }

  // Create PNG from DICOM and validate file was created
  const pngResponse = (await extractPngFromDicom(
    fileResponse.file,
    TEST_FILENAME_PNG
  )) as ExtractPngFromDicomFileReturn;

  // Verify there was no error
  if (!pngResponse.success || pngResponse.error || !pngResponse.file) {
    const errorMsg =
      pngResponse.error ||
      "There was an unknown error extracting a PNG from the DICOM file";
    return returnJSONResponse({ message: errorMsg }, 400);
  }

  // save the file to the filesystem
  const saveResult = await saveFileLocally(pngResponse.file, TEST_FILENAME_PNG);

  // output
  return returnJSONResponse({ message: "File created" });
}

/* // stub for now!
// GET /api/file/png
export async function GET(request: Request) {
  // Read the file from the filesystem
  const fileResponse = await readLocalFile(TEST_FILENAME_PNG);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // output
  //  return returnJSONResponse({ message: "File retrieved", file: null });
  const { file } = fileResponse;
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": "image/png", // Change based on file type
      "Content-Length": file.length.toString(),
      "Content-Disposition": "inline; filename=image.png", // Optional: forces browser display
    },
  });
}
*/

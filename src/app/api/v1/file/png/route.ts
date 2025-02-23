/**
 * @swagger
 * /api/v1/file/png:
 *   post:
 *     summary: Create a PNG file from a DICOM file
 *     description: Reads a DICOM file from the filesystem, converts it to a PNG file, and saves it.
 *     responses:
 *       200:
 *         description: File created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: File created
 *                 fileName:
 *                   type: string
 *                   example: test.dcm
 *       400:
 *         description: Bad request, either no DICOM file is present, the file is not in DICOM format, the file could not be converted,
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 fileName:
 *                   type: string
 *             examples:
 *               Example1:
 *                 summary: No file is present
 *                 value:
 *                   success: false
 *                   message: "No file is present"
 *                   fileName: "{fileName}"
 *               Example2:
 *                 summary: File is not a DICOM
 *                 value:
 *                   success: false
 *                   message:  "File is not a DICOM"
 *                   fileName: "{fileName}"
 *               Example3:
 *                 summary: Unknown error
 *                 value:
 *                   success: false
 *                   message: There was an unknown error extracting a PNG from the DICOM file
 *                   fileName: {fileName}
 *   get:
 *     summary: Retrieve the PNG file
 *     description: Reads a PNG file from the filesystem and returns it.
 *     responses:
 *       200:
 *         description: File retrieved successfully
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       400:
 *         description: Bad request, either no PNG file is present or the file is not in PNG format
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *             examples:
 *               Example1:
 *                 summary: Requested file is not in PNG format
 *                 value:
 *                   success: false
 *                   message: "File is not a PNG"
 *                   fileName: "{fileName}"
 *               Example2:
 *                 summary: Requested file is not present
 *                 value:
 *                   success: false
 *                   message:  "No file is present"
 *                   fileName: "{fileName}"
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "@/app/api/v1/utils.api";
import {
  extractPngFromDicom,
  ExtractPngFromDicomFileReturn,
} from "@/app/api/v1/file/utils.dicom";
import {
  readLocalFile,
  saveFileLocally,
  TEST_FILENAME_DCM,
  TEST_FILENAME_PNG,
  ReadLocalFileReturn,
  validatePNGFileFormat,
} from "@/app/api/v1/file/utils.file";
import * as dicomParser from "dicom-parser";

// POST /api/file/png
export async function POST(request: Request) {
  // Read the file from the filesystem
  const fileName = TEST_FILENAME_DCM;
  const outputFileName = TEST_FILENAME_PNG;
  const fileResponse = await readLocalFile(fileName);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse(
      { success: false, message: "No file is present", fileName },
      400
    );
  }

  // Validate: file is a DICOMa
  const dicomData = dicomParser.parseDicom(fileResponse.file);
  if (!dicomData.elements.x7fe00010) {
    return returnJSONResponse(
      {
        success: false,
        message: "File is not a DICOM",
        fileName,
      },
      400
    );
  }

  // Create PNG from DICOM and validate file was created
  const pngResponse = (await extractPngFromDicom(
    fileResponse.file,
    outputFileName
  )) as ExtractPngFromDicomFileReturn;

  // Verify there was no error
  if (!pngResponse.success || pngResponse.error || !pngResponse.file) {
    const errorMsg =
      pngResponse.error ||
      "There was an unknown error extracting a PNG from the DICOM file";
    return returnJSONResponse(
      { success: false, message: errorMsg, fileName },
      400
    );
  }

  // save the file to the filesystem
  const saveResult = await saveFileLocally(pngResponse.file, outputFileName);

  // output
  return returnJSONResponse({
    success: true,
    message: "File created",
    fileName: outputFileName,
  });
}

// GET /api/file/png
export async function GET(request: Request) {
  // Read the file from the filesystem
  const fileResponse = (await readLocalFile(
    TEST_FILENAME_PNG
  )) as ReadLocalFileReturn;

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }
  const { file } = fileResponse;

  // verify file is a PNG
  if (!validatePNGFileFormat(file) as Boolean) {
    return returnJSONResponse({ message: "File is not a PNG" }, 400);
  }

  // output
  return new Response(file, {
    status: 200,
    headers: {
      "Content-Type": "image/png", // Change based on file type
      "Content-Length": file.length.toString(),
      "Content-Disposition": "inline; filename=image.png", // Optional: forces browser display
    },
  });
}

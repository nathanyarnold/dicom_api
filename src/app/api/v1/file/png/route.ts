/**
 * @swagger
 * /api/v1/file/png:
 *   post:
 *     summary: Create a PNG file from a DICOM file
 *     description: Reads a DICOM file from the filesystem, converts it to a PNG file, and saves it.
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the DICOM file to be converted to PNG
 *     responses:
 *       200:
 *         description: File created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File created
 *                 fileName:
 *                   type: string
 *                   example: IM000001.png
 *       400:
 *         description: Bad request, either no DICOM file is present, the file is not in DICOM format, the file could not be converted,
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 fileName:
 *                   type: string
 *             examples:
 *
 *               Example1:
 *                 summary: Filename is required
 *                 value:
 *                   message: "Filename is required"
 *               Example2:
 *                 summary: No file is present
 *                 value:
 *                   message: "No DICOM file is present at that filename"
 *               Example3:
 *                 summary: File is not a DICOM
 *                 value:
 *                   message:  "File is not a DICOM"
 *               Example4:
 *                 summary: Unknown error
 *                 value:
 *                   message: There was an unknown error extracting a PNG from the DICOM file
 *   get:
 *     summary: Retrieve the PNG file
 *     description: Reads a PNG file from the filesystem and returns it.
 *     parameters:
 *       - in: query
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the PNG file to be retrieved. eg IM000001.png (the name generated in the above POST)
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
 *                 summary: Filename is required
 *                 value:
 *                   message: "Filename is required"
 *               Example2:
 *                 summary: Requested file is not in PNG format
 *                 value:
 *                   message: "File is not a PNG"
 *               Example3:
 *                 summary: Requested file is not present
 *                 value:
 *                   message:  "No PNG file is present at that filename"
 */

import { Request } from "node-fetch";
import { returnJSONResponse, getQueryParam } from "@/app/api/v1/utils.api";
import {
  extractPngFromDicom,
  ExtractPngFromDicomFileReturn,
} from "@/app/api/v1/file/utils.dicom";
import {
  readLocalFile,
  changeToPngExtension,
  ReadLocalFileReturn,
  validatePNGFileFormat,
  saveFileLocally,
} from "@/app/api/v1/file/utils.file";
import * as dicomParser from "dicom-parser";

/**
 * POST request to the /api/v1/file/png endpoint.
 * @param request - Request object.
 * @returns A JSON response indicating the success or failure of the PNG file creation process, including a message and the file name.
 */
export async function POST(request: Request) {
  // get the filename from the GET request object "filename"
  const filename = getQueryParam(request, "filename");
  if (!filename) {
    return returnJSONResponse({ message: "Filename is required" }, 400);
  }

  // Read the file from the filesystem
  const outputFileName = changeToPngExtension(filename);
  const fileResponse = await readLocalFile(filename);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse(
      { message: "No DICOM file is present at that filename" },
      400
    );
  }

  // Validate: file is a DICOMa
  const dicomData = dicomParser.parseDicom(fileResponse.file);
  if (!dicomData.elements.x7fe00010) {
    return returnJSONResponse(
      {
        message: "File is not a DICOM",
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
    return returnJSONResponse({ message: errorMsg, filename }, 400);
  }

  // save the file to the filesystem
  const saveResult = await saveFileLocally(pngResponse.file);

  // output
  return returnJSONResponse({
    message: "File created",
    fileName: outputFileName,
  });
}

/**
 * GET request to the /api/v1/file/png endpoint.
 * @param request - Request object.
 * @returns a JSON response indicating the success or failure of the PNG file retrieval process, including a message and the file name.
 */
export async function GET(request: Request) {
  // get the filename from the GET request object "filename"
  const url = new URL(request.url);
  const param = url.searchParams.get("filename");
  const filename = getQueryParam(request, "filename");

  // validate filename is present
  if (!filename) {
    return returnJSONResponse({ message: "Filename is required" }, 400);
  }

  // Read the file from the filesystem
  const fileResponse = (await readLocalFile(filename)) as ReadLocalFileReturn;

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse(
      { message: "No PNG file is present at that filename" },
      400
    );
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

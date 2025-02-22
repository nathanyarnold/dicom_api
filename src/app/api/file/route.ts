/**
 * @swagger
 * /file:
 *   post:
 *     summary: Upload a DICOM file
 *     description: Validates and saves a DICOM file sent using multipart/form-data.
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: header
 *         name: Content-Type
 *         required: true
 *         schema:
 *           type: string
 *           example: multipart/form-data
 *         description: The content type must be multipart/form-data.
 *       - in: formData
 *         name: file
 *         required: true
 *         type: file
 *         description: The DICOM file to upload.
 *     responses:
 *       200:
 *         description: File received and saved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: File received and saved
 *                 fileName:
 *                   type: string
 *                   example: test.dcm
 *       400:
 *         description: Invalid request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Invalid Content-Type, must be multipart/form-data
 *       500:
 *         description: System error saving file
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: System error saving file
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "../utils.api";
import { saveFileLocally, TEST_FILENAME_DCM } from "./utils.file";
import { validateDicomFile } from "./utils.dicom";

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
  const saveResult = await saveFileLocally(file, TEST_FILENAME_DCM);
  if (saveResult.success) {
    return returnJSONResponse({
      message: "File received and saved",
      fileName: saveResult.fileName,
    });
  } else {
    return returnJSONResponse({ message: "System error saving file" }, 500);
  }
}

/**
 * @swagger
 * /file/headers:
 *   get:
 *     summary: Retrievei all DICOM headers from a local file
 *     description: Reads a local DICOM file and extracts all DICOM headers.
 *     responses:
 *       200:
 *         description: Successfully retrieved DICOM headers.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               additionalProperties:
 *                 type: string
 *       400:
 *         description: No file is present.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: No file is present
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "@/app/api/v1/utils.api";
import { readLocalFile, TEST_FILENAME_DCM } from "@/app/api/v1/file/utils.file";
import { extractAllDicomHeaders } from "@/app/api/v1/file/utils.dicom";

export async function GET(request: Request) {
  // Read the file from the filesystem
  const fileResponse = await readLocalFile(TEST_FILENAME_DCM);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // Extract DICOM tags
  const dicomTags = extractAllDicomHeaders(fileResponse.file);
  console.log(dicomTags);

  // output
  return returnJSONResponse(dicomTags);
}

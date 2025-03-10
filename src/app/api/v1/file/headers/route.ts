/**
 * @swagger
 * /api/v1/file/headers:
 *   get:
 *     summary: Retrieve all DICOM headers from a local file
 *     description: Reads a local DICOM file and extracts all DICOM headers.
 *     parameters:
 *       - in: query
 *         name: filename
 *         schema:
 *           type: string
 *         required: true
 *         description: The name of the file to read. eg. "IM000001" from examples provided.
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
 *                   example: Filename is required
 *             examples:
 *               Example1:
 *                 summary: Filename is required
 *                 value:
 *                   message: Filename is required
 *               Example2:
 *                 summary: No file is present
 *                 value:
 *                   message: No file is present at the supplied filename
 */

import { Request } from "node-fetch";
import { returnJSONResponse, getQueryParam } from "@/app/api/v1/utils.api";
import { readLocalFile } from "@/app/api/v1/file/utils.file";
import { extractAllDicomHeaders } from "@/app/api/v1/file/utils.dicom";

/**
 * Handles the GET request to retrieve all DICOM headers from a local file.
 *
 * @param request - The incoming request object.
 * @returns A JSON response containing the DICOM headers or an error message if the file is not present.
 */
export async function GET(request: Request) {
  // get the filename from the GET request object "filename"
  const filename = getQueryParam(request, "filename");

  // validate filename is present
  if (!filename) {
    return returnJSONResponse({ message: "Filename is required" }, 400);
  }

  // Read the file from the filesystem
  const fileResponse = await readLocalFile(filename);

  // Validate: file is present
  if (!fileResponse.success || !fileResponse.file) {
    return returnJSONResponse(
      { message: "No file is present at the supplied filename" },
      400
    );
  }

  // Extract DICOM tags
  const dicomTags = extractAllDicomHeaders(fileResponse.file);

  // output
  return returnJSONResponse(dicomTags);
}

/**
 * @swagger
 * /api/v1/file/header/{tag}:
 *   get:
 *     summary: Retrieve a DICOM header value by tag
 *     description: Fetches the value of a specific DICOM header identified by the provided tag from a local DICOM file.
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         description: The tag of the DICOM header to retrieve. eg "x00080080" (include leading x)
 *         schema:
 *           type: string
 *       - in: query
 *         name: filename
 *         required: true
 *         description: The name of the local DICOM file to read. eg. "IM000001" from examples provided.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Successfully retrieved the DICOM header value.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 tag:
 *                   type: string
 *                   description: The tag of the DICOM header.
 *                 value:
 *                   type: string
 *                   description: The value of the DICOM header.
 *       400:
 *         description: Bad request. The tag or filename supplied does not correspond to an existing header or file.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message describing the issue.
 */
import { Request } from "node-fetch";
import { returnJSONResponse, getQueryParam } from "@/app/api/v1/utils.api";
import { readLocalFile } from "@/app/api/v1/file/utils.file";
import {
  extractDicomHeaderByTag,
  DicomHeaderValue,
  sanitizeDicomTag,
} from "@/app/api/v1/file/utils.dicom";

/**
 * Handles the GET request to retrieve a DICOM header value by tag.
 *
 * @param request - The incoming request object.
 * @param params - The incoming request parameters.
 * @returns A JSON response containing the DICOM header value or an error message if the tag does not correspond to an existing header.
 */
export async function GET(
  request: Request,
  { params }: { params: { tag: string } }
) {
  // get tag and filename from the query params
  const { tag } = await params;
  const filename = getQueryParam(request, "filename");

  //sanitize tag
  const safeTag = sanitizeDicomTag(tag);

  // validate tag and filename are present
  if (!safeTag)
    return returnJSONResponse({ message: "No tag is present" }, 400);
  if (!filename)
    return returnJSONResponse({ message: "No filename is present" }, 400);

  // Read the file from the filesystem
  const fileResponse = await readLocalFile(filename);

  // Validate: file is present
  if (!fileResponse.success) {
    return returnJSONResponse(
      { message: "No file is present at the supplied filename" },
      400
    );
  }

  // get single DICOM header, corresponding to tag
  const headerValue = (await extractDicomHeaderByTag(
    safeTag,
    fileResponse.file
  )) as DicomHeaderValue;

  // if null is returned, it means there is no header in the tag that corresponds to this tag, so return an error
  if (headerValue === null) {
    return returnJSONResponse(
      { message: `No header found for tag: "${safeTag}"` },
      400
    );
  }

  // output
  return returnJSONResponse({ safeTag, value: headerValue });
}

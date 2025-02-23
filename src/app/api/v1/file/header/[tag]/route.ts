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
 *         description: Bad request. The tag supplied does not correspond to an existing header. Note that if no header is supplied, the endpoint /api/v1/file/header fill fire instead.
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
import { returnJSONResponse } from "@/app/api/v1/utils.api";
import { readLocalFile, TEST_FILENAME_DCM } from "@/app/api/v1/file/utils.file";
import {
  extractDicomHeaderByTag,
  DicomHeaderValue,
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
  // get tag from the query params
  const { tag } = await params;

  // validate tag is present
  // note: this shouldn't run, it should be caught be another route
  // but better safe than sorry
  if (!tag) return returnJSONResponse({ message: "No tag is present" }, 400);

  // Read the file from the filesystem
  const fileResponse = await readLocalFile(TEST_FILENAME_DCM);

  // Validate: file is present
  if (!fileResponse.success) {
    return returnJSONResponse({ message: "No file is present" }, 400);
  }

  // get single DICOM header, corresponding to tag
  const headerValue = (await extractDicomHeaderByTag(
    tag,
    fileResponse.file
  )) as DicomHeaderValue;

  // if null is returned, it meanss there is no header in the tag that corresponds to this tag, so return an error
  if (headerValue === null) {
    return returnJSONResponse(
      { message: `No header found for tag: ${tag}` },
      400
    );
  }

  // output
  return returnJSONResponse({ tag, value: headerValue });
}

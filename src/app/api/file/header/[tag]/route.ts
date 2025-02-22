/**
 * @swagger
 * /file/header/{tag}:
 *   get:
 *     summary: Retrieve a DICOM header value by tag
 *     description: Fetches a specific DICOM header value from a local file based on the provided tag.
 *     parameters:
 *       - in: path
 *         name: tag
 *         required: true
 *         schema:
 *           type: string
 *         description: The DICOM tag to retrieve the header value for.
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
 *                   description: The DICOM tag.
 *                 value:
 *                   type: object
 *                   nullable: true
 *                   description: The value of the DICOM header.
 *             examples:
 *               Example1:
 *                 summary: Value exists ("Standard patient name")
 *                 value:
 *                   tag: "x00100010"
 *                   value: "Nathan Arnold"
 *               Example2:
 *                 summary: Missing value ("Scan Options" tag exists but is empty)
 *                 value:
 *                   tag: "x00180022"
 *                   value: null
 *       400:
 *         description: Bad request. Either the tag or the file is not present.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Error message.
 *             examples:
 *               FileNotPresent:
 *                 summary: File is not present
 *                 value:
 *                   message: "No file is present"
 *               TagNotPresent:
 *                 summary: Tag is not present
 *                 value:
 *                   message: "No header found for tag: {tag}"
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "../../../utils.api";
import { readLocalFile, TEST_FILENAME_DCM } from "../../utils.file";
import { extractDicomHeaderByTag, DicomHeaderValue } from "../../utils.dicom";

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

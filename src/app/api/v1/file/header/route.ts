/**
 * @swagger
 * /api/v1/file/header:
 *   get:
 *     summary: Default route for the file header endpoint
 *     description: Handles cases where a file header is requested, but no tag is specified (which is invalid). There is no successful 200 for this endpoint, only a 400, as a tag should always be specified.
 *     responses:
 *       400:
 *         description: No Tag Defined
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "No Tag Defined"
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "@/app/api/v1/utils.api";

/**
 * This function is the default route for the file header endpoint. It handles cases where a file header is requested, but no tag is specified.
 * @param request
 */
export async function GET(request: Request) {
  // output
  return returnJSONResponse({ message: "No Tag Defined" }, 400);
}

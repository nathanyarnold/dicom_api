/**
 * @swagger
 * /api/v1/ping:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns a status message to indicate the API is running.
 *     responses:
 *       200:
 *         description: API is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: "OK"
 */

import { Request } from "node-fetch";
import { returnJSONResponse } from "@/app/api/v1/utils.api";

export async function GET(request: Request) {
  return returnJSONResponse({ status: "OK" });
}

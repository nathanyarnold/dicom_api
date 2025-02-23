/**
 * @swagger
 * /api/v1/health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns the API's health status, version, uptime, and timestamp.
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
 *                   example: "ok"
 *                 version:
 *                   type: string
 *                   example: "1.0.0"
 *                 uptime:
 *                   type: integer
 *                   example: 3600
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                   example: "2024-02-19T12:00:00.000Z"
 */

import { Request } from "node-fetch";
import { readFileSync } from "fs";
import { join } from "path";
import { returnJSONResponse } from "@/app/api/v1/utils.api";

/**
 * Reads the package.json file and returns the version number.
 * @returns {string} The version number from the package.json file.
 */
export function getPackageJSONVsNumber() {
  return JSON.parse(
    readFileSync(join(__dirname, "../../../../../package.json"), "utf-8")
  ).version;
}

/**
 * GET request to the /api/v1/health endpoint.
 * @param {Request} request - The incoming request object.
 * @returns {Response} The response object containing the health check in JSON format.
 */
export async function GET(request: Request) {
  const responseOutput = {
    status: "ok",
    version: getPackageJSONVsNumber(),
    uptime: Math.floor(process.uptime()), // Returns uptime in seconds
    timestamp: new Date().toISOString(),
  };
  return returnJSONResponse(responseOutput);
}

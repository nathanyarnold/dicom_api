/**
 * @swagger
 * /api/v1/openapi:
 *   get:
 *     summary: Retrieve OpenAPI Specification
 *     description: Returns the OpenAPI specification for the API. Click the "Try it out" button to see the full spec here.
 *     responses:
 *       200:
 *         description: Successfully retrieved OpenAPI specification.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               description: The OpenAPI specification document.
 */

import { NextResponse } from "next/server";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "@/config/swaggerConfig";

/**
 * Handles GET requests to retrieve the OpenAPI specification.
 *
 * @returns {Promise<NextResponse>} A promise that resolves to a NextResponse containing the OpenAPI specification.
 */
export async function GET() {
  const openapiSpec = swaggerJsdoc(swaggerConfig);
  return NextResponse.json(openapiSpec);
}

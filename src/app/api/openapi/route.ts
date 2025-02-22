import { NextResponse } from "next/server";
import swaggerJsdoc from "swagger-jsdoc";
import swaggerConfig from "@/config/swaggerConfig";

export async function GET() {
  const openapiSpec = swaggerJsdoc(swaggerConfig);
  return NextResponse.json(openapiSpec);
}

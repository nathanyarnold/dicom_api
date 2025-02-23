import { Request } from "node-fetch";
import { sanitizeFileName } from "@/app/api/v1/file/utils.file";

/**
 * Returns a standardized JSON response with the specified output and status code.
 *
 * @param output - The data to be included in the JSON response. Defaults to an empty object.
 * @param status - The HTTP status code for the response. Can be 400, 500, or undefined. Defaults to 200 if not provided.
 * @returns A Response object with the JSON stringified output and appropriate headers.
 */
export function returnJSONResponse(
  output: any = {},
  status?: 400 | 500 | undefined
) {
  const responseStatus = status || 200;
  return new Response(JSON.stringify(output), {
    status: responseStatus,
    headers: { "Content-Type": "application/json" },
  });
}

/**
 * Retrieves a query parameter from a Request object.
 *
 * @param request - The incoming request object.
 * @param key - The key of the query parameter to retrieve.
 * @returns The value of the query parameter, or undefined if the key is not found.
 */
export function getQueryParam(
  request: Request,
  key: string
): string | undefined | null {
  const url = new URL(request.url);
  const param = url.searchParams.get(key);
  const saferValue = sanitizeFileName(param);
  return saferValue;
}

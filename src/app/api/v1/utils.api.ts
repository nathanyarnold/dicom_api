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

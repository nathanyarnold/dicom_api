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

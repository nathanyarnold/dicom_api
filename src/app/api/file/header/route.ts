import { Request } from "node-fetch";
import { returnJSONResponse } from "../../utils.api";

/**
 * This function is the default route for the file header endpoint. It handles cases where a file header is requested, but no tag is specified.
 * @param request
 */
export async function GET(request: Request) {
  // output
  return returnJSONResponse({ message: "No Tag Defined" }, 400);
}

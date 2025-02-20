import { Request } from "node-fetch";
import { returnJSONResponse } from "../utils.api";

export async function GET(request: Request) {
  return returnJSONResponse({ status: "OK" });
}

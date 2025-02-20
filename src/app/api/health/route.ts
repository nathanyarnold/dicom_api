import { Request } from "node-fetch";
import { readFileSync } from "fs";
import { join } from "path";
import { returnJSONResponse } from "../utils.api";

export async function GET(request: Request) {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../../../../../package.json"), "utf-8")
  );

  const responseOutput = {
    status: "ok",
    version: packageJson.version,
    uptime: Math.floor(process.uptime()), // Returns uptime in seconds
    timestamp: new Date().toISOString(),
  };
  return returnJSONResponse(responseOutput);
}

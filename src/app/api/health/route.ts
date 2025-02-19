import { Request } from "node-fetch";
import { readFileSync } from "fs";
import { join } from "path";

export async function GET(request: Request) {
  const packageJson = JSON.parse(
    readFileSync(join(__dirname, "../../../../../package.json"), "utf-8")
  );
  const version = packageJson.version;

  return new Response(
    JSON.stringify({
      status: "ok",
      version: version,
      uptime: Math.floor(process.uptime()), // Returns uptime in seconds
      timestamp: new Date().toISOString(),
    }),
    {
      status: 200,
      headers: { "Content-Type": "application/json" },
    }
  );
}

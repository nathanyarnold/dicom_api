import { Request } from "node-fetch";

export async function GET(request: Request) {
  return new Response(JSON.stringify({ status: "ok" }), {
    headers: { "Content-Type": "application/json" },
  });
}

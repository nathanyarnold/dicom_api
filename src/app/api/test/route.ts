import { Request } from "node-fetch";

export async function GET(request: Request) {
  return new Response(JSON.stringify({ message: "Hello, world!" }), {
    headers: { "Content-Type": "application/json" },
  });
}

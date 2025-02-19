import { Request } from "node-fetch";

// TS definitions
export type errorTypes = "contentType" | "file";
export type errorMessages = {
  [key in errorTypes]: {
    status: number;
    message: string;
  };
};

// All Possible Error Messages
export const errorMessages: errorMessages = {
  contentType: {
    status: 400,
    message: "Invalid Content-Type",
  },
  file: {
    status: 400,
    message: "File is required",
  },
};

export function outputErrorResponse(errorType: errorTypes) {
  const error = errorMessages[errorType];
  return new Response(JSON.stringify({ error: error.message }), {
    status: error.status,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(request: Request) {
  // Error: a file needs to be send using "multipart/form-data", with the parameter name "file"
  if (!request.headers.get("Content-Type")?.includes("multipart/form-data")) {
    return outputErrorResponse("contentType");
  }

  // get "file"
  const formData = await request.formData();
  const file = formData.get("file");

  if (!file || typeof file !== "object" || !file.name) {
    return outputErrorResponse("file");
  }

  // process file here

  // Export success message
  return new Response(JSON.stringify({ message: "File received" }), {
    headers: { "Content-Type": "application/json" },
  });
}

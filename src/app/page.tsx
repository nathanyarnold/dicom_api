"use client";

import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

/**
 * SwaggerPage component renders the Swagger UI for the API documentation.
 *
 * @returns {JSX.Element} The Swagger UI component with the specified API documentation URL.
 */
export default function SwaggerPage() {
  return <SwaggerUI url="/api/v1/openapi.json" />;
}

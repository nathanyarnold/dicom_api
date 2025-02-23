import { SwaggerDefinition, Options } from "swagger-jsdoc";

const swaggerDefinition: SwaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "My API",
    version: "1.0.0",
    description: "API documentation for my Next.js app",
  },
  servers: [
    {
      url: "http://localhost:3000", // Adjust this based on your actual API path
      description: "Local development server",
    },
  ],
};

const options: Options = {
  swaggerDefinition,
  apis: ["./src/app/api/**/*.ts"], // Adjust path to your API files
};

export default options;

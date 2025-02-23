This is a [Next.js](https://nextjs.org)-based application.

### Why NextJS for an API?

NextJS was used because I (Nathan) am a frontend developer by trade, and this is the API tool I have been most familiar with over the last few years. It can quite work well as a part of a full-stack JS application, typically as a backend-for-frontend api. It's also handy for displaying the corresponding Swagger docs (available at the root application path, see below).

## API Documentation

OpenAPI spec is available at [http://localhost:3000/api/v1/openapi.json](http://localhost:3000/api/v1/openapi.json) once the application is running (see below).

## Postman Collection

To help with development and integration testing, I used a Postman collection. For your convenience, it is available in `public/docs/PocketHealth API.postman_collection.json`

## Running the Application: "Get Started"

First, download the application:

```bash
git clone https://github.com/nathanyarnold/pockethealth.git
cd pockethealth
npm install
```

Second, install the application:

```bash
npm install
```

Third, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

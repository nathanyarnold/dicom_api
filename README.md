This is a [Next.js](https://nextjs.org)-based application.

### Why NextJS for an API?

NextJS was used because I (Nathan) am a frontend developer by trade, and this is the API tool I have been most familiar with over the last few years. It can quite work well as a part of a full-stack JS application, typically as a backend-for-frontend api. It's also handy for displaying the corresponding Swagger docs (available at the root application path, see below).

## Scaling the app

The app takes supplied images, and saves them locally to the filesystem. Secure coding is limited to sanitized query params ("tag" and "filename") and filenames themselves. If this were scaled or used in production, the system would need to have some understanding of users and auth, as well as transporting, storing and retrieving files safely and securely.

## API Documentation

OpenAPI spec is available at [http://localhost:3000/api/v1/openapi.json](http://localhost:3000/api/v1/openapi.json) once the application is running (see below).

Swagger is running at the [web-app root](http://localhost:3000), for your convenience.

## Postman Collection

To help with development and integration testing, I used a Postman collection. For your convenience, it is available in `public/docs/PocketHealth API.postman_collection.json`

## Unit Tests

The test instructions didn't explicitly ask for unit-test, but I do believe they are good practice. At the same time, I didn't want to get bogged-down in writing a ton for this exercise, in the interest of time. Instead, I added Jest (a JS-based test lib), and mocked up two simple tests: one for the util I use to output standardized JSON responses, and the other for the simple `/api/v1/ping` GET endpoint. I did this to demonstrate _how_ I would do it for this application.

To run the tests, install app per the instructions belowm,and then run `npm run test` in the command-line.

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

Fourth (optional), run the unit-test suite

```bash
npm run test
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

import { returnJSONResponse } from "@/app/api/v1/utils.api";

global.Response = class {
  status: number;
  headers: Map<string, string>;
  body: any;

  constructor(
    body: any,
    init: { status: number; headers: { [key: string]: string } }
  ) {
    this.status = init.status;
    this.headers = new Map(Object.entries(init.headers));
    this.body = body;
  }

  json() {
    return Promise.resolve(this.body);
  }

  headers = {
    get: (key: string) => this.headers.get(key),
  };
};

describe("returnJSONResponse", () => {
  it("should return a response with default status 200 and empty object", () => {
    const response = returnJSONResponse();
    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    return response.json().then((data) => {
      expect(data).toEqual("{}");
    });
  });

  it("should return a response with the provided output and default status 200", async () => {
    const output = { message: "success" };
    const checkOutput = JSON.stringify(output);
    const response = returnJSONResponse(output);

    expect(response.status).toBe(200);
    expect(response.headers.get("Content-Type")).toBe("application/json");

    const data = await response.json(); // No need to parse again
    expect(data).toEqual(checkOutput);
  });

  it("should return a response with status 400", () => {
    const response = returnJSONResponse({}, 400);
    expect(response.status).toBe(400);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    return response.json().then((data) => {
      expect(data).toEqual("{}");
    });
  });

  it("should return a response with status 500", () => {
    const response = returnJSONResponse({}, 500);
    expect(response.status).toBe(500);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    return response.json().then((data) => {
      expect(data).toEqual("{}");
    });
  });
});

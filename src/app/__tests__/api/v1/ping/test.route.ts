import { GET } from "@/app/api/v1/ping/route";
import { returnJSONResponse } from "@/app/api/v1/utils.api";

jest.mock("@/app/api/v1/utils.api");

describe("GET /api/v1/ping", () => {
  it("should return a JSON response with status 'OK'", async () => {
    const mockRequest = {} as Request;
    const mockResponse = { status: "OK" };
    (returnJSONResponse as jest.Mock).mockReturnValue(mockResponse);

    const response = await GET(mockRequest);

    expect(returnJSONResponse).toHaveBeenCalledWith({ status: "OK" });
    expect(response).toEqual(mockResponse);
  });
});

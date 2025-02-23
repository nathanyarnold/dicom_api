import { sanitizeDicomTag } from "@/app/api/v1/file/utils.dicom";

describe("sanitizeDicomTag", () => {
  it("should return null for null input", () => {
    expect(sanitizeDicomTag(null)).toBeNull();
  });

  it("should return null for undefined input", () => {
    expect(sanitizeDicomTag(undefined as unknown as string)).toBeNull();
  });

  it("should trim whitespace from the tag", () => {
    expect(sanitizeDicomTag(" 0x00100010 ")).toBe("x00100010");
  });

  it('should remove "0x" prefix from the tag', () => {
    expect(sanitizeDicomTag("0x00100010")).toBe("x00100010");
  });

  it('should keep "x" prefix with the tag', () => {
    expect(sanitizeDicomTag("x00100010")).toBe("x00100010");
  });

  it("should return null for invalid tag format", () => {
    expect(sanitizeDicomTag("0010")).toBeNull();
    expect(sanitizeDicomTag("0x0010")).toBeNull();
    expect(sanitizeDicomTag("x0010")).toBeNull();
    expect(sanitizeDicomTag("invalid")).toBeNull();
  });

  it("should capitalize the tag", () => {
    expect(sanitizeDicomTag("0x00100010")).toBe("x00100010");
    expect(sanitizeDicomTag("0x0010001a")).toBe("x0010001A");
  });
});

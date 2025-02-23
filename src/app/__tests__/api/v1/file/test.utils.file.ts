import { sanitizeFileName } from "@/app/api/v1/file/utils.file";

describe("sanitizeFileName", () => {
  it("should return an empty string if the file name is null", () => {
    expect(sanitizeFileName(null)).toBe("");
  });

  it("should replace spaces with underscores", () => {
    expect(sanitizeFileName("test file name.png")).toBe("test_file_name.png");
  });

  it("should remove non-alphanumeric characters except hyphens, underscores, and periods", () => {
    expect(sanitizeFileName("test@file#name!.png")).toBe("testfilename.png");
  });

  it("should handle file names with only allowed characters", () => {
    expect(sanitizeFileName("test-file_name.png")).toBe("test-file_name.png");
  });

  it("should handle file names with multiple spaces", () => {
    expect(sanitizeFileName("test   file   name.png")).toBe(
      "test___file___name.png"
    );
  });

  it("should handle file names with no spaces or special characters", () => {
    expect(sanitizeFileName("testfilename.png")).toBe("testfilename.png");
  });
});

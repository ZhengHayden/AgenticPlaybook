import { describe, it, expect } from "vitest";
import { previewKind, artifactInlineUrl } from "./artifact-preview";

const file = (mimeType: string, fileName: string) => ({
  mimeType,
  fileName,
  sizeBytes: 1,
  storagePath: "x",
});

describe("previewKind", () => {
  it("detects PDF by MIME type", () => {
    expect(previewKind(file("application/pdf", "guide.pdf"))).toBe("pdf");
  });

  it("detects PDF by extension when MIME is generic", () => {
    expect(previewKind(file("application/octet-stream", "report.pdf"))).toBe("pdf");
  });

  it("detects HTML by MIME type and by extension", () => {
    expect(previewKind(file("text/html", "page.html"))).toBe("html");
    expect(previewKind(file("application/xhtml+xml", "page.xhtml"))).toBe("html");
    expect(previewKind(file("application/octet-stream", "page.htm"))).toBe("html");
  });

  it("detects Markdown by MIME type and by extension", () => {
    expect(previewKind(file("text/markdown", "notes.md"))).toBe("markdown");
    expect(previewKind(file("text/plain", "notes.md"))).toBe("markdown");
    expect(previewKind(file("application/octet-stream", "readme.markdown"))).toBe("markdown");
  });

  it("returns null for non-previewable files", () => {
    expect(previewKind(file("text/plain", "notes.txt"))).toBeNull();
    expect(
      previewKind(
        file(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "deck.pptx",
        ),
      ),
    ).toBeNull();
    expect(previewKind(file("image/png", "diagram.png"))).toBeNull();
    expect(previewKind(file("application/zip", "bundle.zip"))).toBeNull();
  });

  it("is case-insensitive on extension and MIME", () => {
    expect(previewKind(file("APPLICATION/PDF", "GUIDE.PDF"))).toBe("pdf");
  });
});

describe("artifactInlineUrl", () => {
  it("builds the inline download URL for an artifact id", () => {
    expect(artifactInlineUrl("art-1")).toBe(
      "/api/knowledge/artifacts/art-1/download?disposition=inline",
    );
  });

  it("encodes the id", () => {
    expect(artifactInlineUrl("a/b")).toContain("a%2Fb");
  });
});

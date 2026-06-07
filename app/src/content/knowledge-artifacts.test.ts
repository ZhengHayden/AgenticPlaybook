import { describe, it, expect } from "vitest";
import {
  ARTIFACT_KINDS,
  ARTIFACT_TYPES,
  ARTIFACT_STATUSES,
  DEFAULT_ARTIFACT_STATUS,
  isAllowedArtifactFile,
} from "./knowledge-artifacts";

describe("artifact constants", () => {
  it("exposes the two storage kinds", () => {
    expect(ARTIFACT_KINDS).toEqual(["file", "link"]);
  });
  it("includes the eight artifact types", () => {
    expect(ARTIFACT_TYPES).toContain("playbook");
    expect(ARTIFACT_TYPES).toContain("promptSet");
    expect(ARTIFACT_TYPES).toHaveLength(8);
  });
  it("defaults new artifacts to draft", () => {
    expect(DEFAULT_ARTIFACT_STATUS).toBe("draft");
    expect(ARTIFACT_STATUSES).toEqual(["draft", "published", "deprecated"]);
  });
});

describe("isAllowedArtifactFile", () => {
  it("accepts a file whose MIME type is in the allowlist", () => {
    expect(isAllowedArtifactFile("application/pdf", "deck.pdf")).toBe(true);
    expect(isAllowedArtifactFile("text/html", "deck.html")).toBe(true);
  });

  it("accepts HTML reported as application/octet-stream by extension", () => {
    expect(isAllowedArtifactFile("application/octet-stream", "report.html")).toBe(true);
    expect(isAllowedArtifactFile("application/octet-stream", "report.htm")).toBe(true);
  });

  it("accepts HTML with an empty MIME type by extension", () => {
    expect(isAllowedArtifactFile("", "report.html")).toBe(true);
  });

  it("rejects a genuinely unsupported file even with a generic MIME type", () => {
    expect(isAllowedArtifactFile("application/octet-stream", "app.exe")).toBe(false);
    expect(isAllowedArtifactFile("", "app.exe")).toBe(false);
  });

  it("rejects a file with a specific, disallowed MIME type", () => {
    expect(isAllowedArtifactFile("application/x-msdownload", "app.exe")).toBe(false);
    // A specific bad MIME is not rescued by a friendly-looking extension.
    expect(isAllowedArtifactFile("application/x-msdownload", "app.html")).toBe(false);
  });
});

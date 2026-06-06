import { describe, it, expect } from "vitest";
import {
  ARTIFACT_KINDS,
  ARTIFACT_TYPES,
  ARTIFACT_STATUSES,
  DEFAULT_ARTIFACT_STATUS,
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

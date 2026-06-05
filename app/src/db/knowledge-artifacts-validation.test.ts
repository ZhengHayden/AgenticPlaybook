import { describe, it, expect } from "vitest";
import {
  createLinkArtifactSchema,
  createFileMetaSchema,
  updateArtifactSchema,
} from "./knowledge-artifacts-validation";

describe("artifact validation", () => {
  it("accepts a valid link artifact", () => {
    const parsed = createLinkArtifactSchema.safeParse({
      title: "Deck", type: "deck", status: "published",
      owner: "M. Wu", url: "https://example.com/x", changeNote: "init",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a link artifact with a non-URL", () => {
    const parsed = createLinkArtifactSchema.safeParse({
      title: "Deck", type: "deck", status: "published", owner: "x", url: "not-a-url",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown type", () => {
    const parsed = createFileMetaSchema.safeParse({
      title: "P", type: "nope", status: "draft", owner: "x",
    });
    expect(parsed.success).toBe(false);
  });

  it("allows a partial patch", () => {
    expect(updateArtifactSchema.safeParse({ status: "deprecated" }).success).toBe(true);
  });
});

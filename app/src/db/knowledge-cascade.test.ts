import { describe, it, expect } from "vitest";

describe("use-case delete cascades artifacts", () => {
  it("removes artifact rows when the use case is deleted", async () => {
    const { createLinkArtifact, listArtifacts } = await import("./knowledge-artifacts-repo");
    const { deleteUseCase } = await import("./knowledge-repo");
    await createLinkArtifact("uc-cascade", {
      title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com",
    });
    expect(await listArtifacts("uc-cascade")).toHaveLength(1);
    await deleteUseCase("uc-cascade"); // returns false (no such use case) but must still purge artifacts
    expect(await listArtifacts("uc-cascade")).toHaveLength(0);
  });
});

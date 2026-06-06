import { describe, it, expect } from "vitest";

async function repo() {
  return import("./knowledge-artifacts-repo");
}

describe("artifacts repo", () => {
  it("creates and lists a link artifact", async () => {
    const { createLinkArtifact, listArtifacts } = await repo();
    const created = await createLinkArtifact("uc-1", {
      title: "Deck", type: "deck", status: "published", owner: "M. Wu",
      url: "https://example.com", changeNote: "init",
    });
    expect(created.kind).toBe("link");
    expect(created.url).toBe("https://example.com");
    expect(created.changelog).toHaveLength(1);
    const list = await listArtifacts("uc-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it("appends a changelog entry on update", async () => {
    const { createLinkArtifact, updateArtifact } = await repo();
    const a = await createLinkArtifact("uc-1", {
      title: "Deck", type: "deck", status: "draft", owner: "x", url: "https://e.com",
    });
    const updated = await updateArtifact(a.id, { status: "published", changeNote: "shipped" });
    expect(updated?.status).toBe("published");
    expect(updated?.changelog).toHaveLength(2);
    expect(updated?.changelog.at(-1)?.note).toBe("shipped");
  });

  it("records a file artifact and replace overwrites current file", async () => {
    const { createFileArtifact, replaceArtifactFile, getArtifact } = await repo();
    const a = await createFileArtifact("uc-1", { title: "PB", type: "playbook", status: "draft", owner: "x" },
      { fileName: "v1.pdf", mimeType: "application/pdf", bytes: Buffer.from("one") });
    expect(a.file?.fileName).toBe("v1.pdf");
    const r = await replaceArtifactFile(a.id, { fileName: "v2.pdf", mimeType: "application/pdf", bytes: Buffer.from("two") }, "rev2");
    expect(r?.file?.fileName).toBe("v2.pdf");
    expect(r?.changelog.at(-1)?.note).toBe("rev2");
    expect((await getArtifact(a.id))?.file?.fileName).toBe("v2.pdf");
  });

  it("deletes an artifact", async () => {
    const { createLinkArtifact, deleteArtifact, listArtifacts } = await repo();
    const a = await createLinkArtifact("uc-9", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    expect(await deleteArtifact(a.id)).toBe(true);
    expect(await listArtifacts("uc-9")).toHaveLength(0);
  });
});

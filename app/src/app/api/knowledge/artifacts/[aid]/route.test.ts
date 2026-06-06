// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PATCH, DELETE } from "./route";
import { createLinkArtifact, createFileArtifact } from "@/db/knowledge-artifacts-repo";
import { MAX_ARTIFACT_BYTES } from "@/content/knowledge-artifacts";

function ctx(aid: string) {
  return { params: Promise.resolve({ aid }) };
}

async function fileArtifact() {
  return createFileArtifact(
    "uc-file",
    { title: "PB", type: "playbook", status: "draft", owner: "x" },
    { fileName: "v1.pdf", mimeType: "application/pdf", bytes: Buffer.from("v1") },
  );
}

describe("single artifact route", () => {
  it("patches status and appends changelog", async () => {
    const a = await createLinkArtifact("uc-p", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    const res = await PATCH(
      new Request("http://t", {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published", changeNote: "go" }),
      }) as never,
      ctx(a.id),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("published");
    expect(body.data.changelog).toHaveLength(2);
  });

  it("returns 404 patching a missing artifact", async () => {
    const res = await PATCH(
      new Request("http://t", { method: "PATCH", headers: { "content-type": "application/json" }, body: "{}" }) as never,
      ctx("art-missing"),
    );
    expect(res.status).toBe(404);
  });

  it("deletes an artifact", async () => {
    const a = await createLinkArtifact("uc-d", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    const res = await DELETE(new Request("http://t", { method: "DELETE" }) as never, ctx(a.id));
    expect(res.status).toBe(200);
  });

  it("replaces a file via multipart PATCH and appends a changelog entry", async () => {
    const a = await fileArtifact();
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([9, 9, 9])], "v2.pdf", { type: "application/pdf" }));
    fd.set("changeNote", "rev2");
    const res = await PATCH(new Request("http://t", { method: "PATCH", body: fd }) as never, ctx(a.id));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.file.fileName).toBe("v2.pdf");
    expect(body.data.changelog.at(-1).note).toBe("rev2");
  });

  it("rejects a file replace with an unsupported MIME type", async () => {
    const a = await fileArtifact();
    const fd = new FormData();
    fd.set("file", new File([new Uint8Array([1])], "evil.exe", { type: "application/x-msdownload" }));
    const res = await PATCH(new Request("http://t", { method: "PATCH", body: fd }) as never, ctx(a.id));
    expect(res.status).toBe(400);
  });

  it("rejects a file replace that exceeds the size limit", async () => {
    const a = await fileArtifact();
    const fd = new FormData();
    const oversized = new Uint8Array(MAX_ARTIFACT_BYTES + 1);
    fd.set("file", new File([oversized], "big.pdf", { type: "application/pdf" }));
    const res = await PATCH(new Request("http://t", { method: "PATCH", body: fd }) as never, ctx(a.id));
    expect(res.status).toBe(400);
  });

  it("requires a file in a multipart PATCH", async () => {
    const a = await fileArtifact();
    const fd = new FormData();
    fd.set("changeNote", "no file");
    const res = await PATCH(new Request("http://t", { method: "PATCH", body: fd }) as never, ctx(a.id));
    expect(res.status).toBe(400);
  });
});

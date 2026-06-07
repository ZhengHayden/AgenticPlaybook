// @vitest-environment node
import { describe, it, expect } from "vitest";
import { GET } from "./route";
import { createFileArtifact, createLinkArtifact } from "@/db/knowledge-artifacts-repo";

function ctx(aid: string) {
  return { params: Promise.resolve({ aid }) };
}

describe("artifact download route", () => {
  it("streams the current bytes of a file artifact as an attachment by default", async () => {
    const a = await createFileArtifact(
      "uc-dl",
      { title: "PB", type: "playbook", status: "draft", owner: "x" },
      { fileName: "guide.pdf", mimeType: "application/pdf", bytes: Buffer.from("hello") },
    );
    const res = await GET(new Request("http://t") as never, ctx(a.id));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Type")).toBe("application/pdf");
    expect(res.headers.get("Content-Disposition")).toContain("attachment");
    expect(res.headers.get("Content-Disposition")).toContain("guide.pdf");
    expect(await res.text()).toBe("hello");
  });

  it("serves bytes inline when disposition=inline", async () => {
    const a = await createFileArtifact(
      "uc-dl",
      { title: "PB", type: "playbook", status: "draft", owner: "x" },
      { fileName: "guide.pdf", mimeType: "application/pdf", bytes: Buffer.from("hi") },
    );
    const res = await GET(new Request("http://t/?disposition=inline") as never, ctx(a.id));
    expect(res.status).toBe(200);
    expect(res.headers.get("Content-Disposition")).toContain("inline");
    expect(res.headers.get("X-Content-Type-Options")).toBe("nosniff");
  });

  it("sandboxes inline HTML with a Content-Security-Policy header", async () => {
    const a = await createFileArtifact(
      "uc-dl",
      { title: "Page", type: "other", status: "draft", owner: "x" },
      { fileName: "page.html", mimeType: "text/html", bytes: Buffer.from("<b>hi</b>") },
    );
    const res = await GET(new Request("http://t/?disposition=inline") as never, ctx(a.id));
    expect(res.headers.get("Content-Security-Policy")).toBe("sandbox");
    expect(res.headers.get("Content-Disposition")).toContain("inline");
  });

  it("returns 404 when downloading a link artifact (no bytes)", async () => {
    const a = await createLinkArtifact("uc-dl", {
      title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com",
    });
    const res = await GET(new Request("http://t") as never, ctx(a.id));
    expect(res.status).toBe(404);
  });

  it("returns 404 for a missing artifact", async () => {
    const res = await GET(new Request("http://t") as never, ctx("art-missing"));
    expect(res.status).toBe(404);
  });
});

// @vitest-environment node
import { describe, it, expect } from "vitest";
import { PATCH, DELETE } from "./route";
import { createLinkArtifact } from "@/db/knowledge-artifacts-repo";

function ctx(aid: string) {
  return { params: Promise.resolve({ aid }) };
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
});

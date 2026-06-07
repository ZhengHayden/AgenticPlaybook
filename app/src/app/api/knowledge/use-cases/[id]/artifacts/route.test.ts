// @vitest-environment node
// Node env is required because jsdom does not properly serialize FormData
// into multipart bodies when constructing a Request — it emits "[object FormData]"
// instead of a multipart stream, making request.formData() unusable.
import { describe, it, expect } from "vitest";
import { GET, POST } from "./route";

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("artifacts collection route", () => {
  it("creates a link artifact via JSON POST and lists it", async () => {
    const post = await POST(
      new Request("http://t/api", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Deck", type: "deck", status: "published", owner: "M", url: "https://e.com" }),
      }) as never,
      ctx("uc-route-1"),
    );
    expect(post.status).toBe(201);

    const get = await GET(new Request("http://t/api") as never, ctx("uc-route-1"));
    const body = await get.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("rejects a bad link body with 400", async () => {
    const res = await POST(
      new Request("http://t/api", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "", type: "deck", status: "published", owner: "M", url: "nope" }),
      }) as never,
      ctx("uc-route-2"),
    );
    expect(res.status).toBe(400);
  });

  it("creates a file artifact via multipart POST", async () => {
    const fd = new FormData();
    fd.set("title", "PB");
    fd.set("type", "playbook");
    fd.set("status", "draft");
    fd.set("owner", "A");
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "pb.pdf", { type: "application/pdf" }));
    const res = await POST(
      new Request("http://t/api", { method: "POST", body: fd }) as never,
      ctx("uc-route-3"),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.kind).toBe("file");
    expect(body.data.file.fileName).toBe("pb.pdf");
  });

  it("accepts an HTML file upload", async () => {
    const fd = new FormData();
    fd.set("title", "CXO Deck");
    fd.set("type", "deck");
    fd.set("status", "draft");
    fd.set("owner", "A");
    fd.set("file", new File(["<html><body>hi</body></html>"], "deck.html", { type: "text/html" }));
    const res = await POST(
      new Request("http://t/api", { method: "POST", body: fd }) as never,
      ctx("uc-route-html"),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.file.fileName).toBe("deck.html");
    expect(body.data.file.mimeType).toBe("text/html");
  });

  it("accepts an HTML file the browser reports as application/octet-stream", async () => {
    const fd = new FormData();
    fd.set("title", "Octet Deck");
    fd.set("type", "deck");
    fd.set("status", "draft");
    fd.set("owner", "A");
    // Browsers frequently tag .html/.htm files as octet-stream or with no type.
    fd.set("file", new File(["<html></html>"], "deck.html", { type: "application/octet-stream" }));
    const res = await POST(
      new Request("http://t/api", { method: "POST", body: fd }) as never,
      ctx("uc-route-octet-html"),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.file.fileName).toBe("deck.html");
  });

  it("rejects an unsupported file type with 400", async () => {
    const fd = new FormData();
    fd.set("title", "Binary");
    fd.set("type", "other");
    fd.set("status", "draft");
    fd.set("owner", "A");
    fd.set("file", new File([new Uint8Array([0])], "app.exe", { type: "application/x-msdownload" }));
    const res = await POST(
      new Request("http://t/api", { method: "POST", body: fd }) as never,
      ctx("uc-route-bad"),
    );
    expect(res.status).toBe(400);
  });
});

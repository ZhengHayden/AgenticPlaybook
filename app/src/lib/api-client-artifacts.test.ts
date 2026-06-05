import { describe, it, expect, vi, afterEach } from "vitest";
import {
  listArtifacts,
  createLinkArtifact,
  updateArtifact,
  deleteArtifact,
} from "./api-client";

function jsonResponse(data: unknown) {
  return { ok: true, json: async () => ({ success: true, data }) } as Response;
}

afterEach(() => vi.restoreAllMocks());

describe("artifact api-client", () => {
  it("GETs the artifact list for a use case", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse([]));
    await listArtifacts("uc-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/knowledge/use-cases/uc-1/artifacts", { method: "GET" });
  });

  it("POSTs a link artifact as JSON", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await createLinkArtifact("uc-1", { title: "D", type: "deck", status: "draft", owner: "x", url: "https://e.com" });
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("DELETEs an artifact by id", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await deleteArtifact("art-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/knowledge/artifacts/art-1", { method: "DELETE" });
  });

  it("PATCHes artifact metadata as JSON", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await updateArtifact("art-1", { status: "published" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/knowledge/artifacts/art-1");
    expect((init as RequestInit).method).toBe("PATCH");
  });
});

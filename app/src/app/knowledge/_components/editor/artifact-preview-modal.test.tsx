import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { ArtifactPreviewModal } from "./artifact-preview-modal";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";

function fileArtifact(fileName: string, mimeType: string): KnowledgeArtifact {
  return {
    id: "art-1",
    useCaseId: "uc-1",
    title: "My Artifact",
    kind: "file",
    type: "playbook",
    status: "draft",
    owner: "A",
    createdAt: 1,
    updatedAt: 2,
    file: { fileName, mimeType, sizeBytes: 10, storagePath: "p" },
    changelog: [],
  };
}

function renderModal(artifact: KnowledgeArtifact) {
  return render(
    <LocaleProvider>
      <ArtifactPreviewModal artifact={artifact} onClose={() => {}} />
    </LocaleProvider>,
  );
}

afterEach(() => vi.restoreAllMocks());

describe("ArtifactPreviewModal", () => {
  it("renders a PDF in an iframe pointed at the inline URL", () => {
    const { container } = renderModal(fileArtifact("guide.pdf", "application/pdf"));
    const iframe = container.querySelector("iframe");
    expect(iframe).not.toBeNull();
    expect(iframe?.getAttribute("src")).toBe(
      "/api/knowledge/artifacts/art-1/download?disposition=inline",
    );
  });

  it("renders HTML in a sandboxed iframe", () => {
    const { container } = renderModal(fileArtifact("page.html", "text/html"));
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("sandbox")).toBe("");
    expect(iframe?.getAttribute("src")).toContain("disposition=inline");
  });

  it("fetches Markdown and renders it as HTML in a sandboxed srcdoc iframe", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: true, text: () => Promise.resolve("# Hello\n\nWorld") }),
    );
    const { container } = renderModal(fileArtifact("notes.md", "text/markdown"));

    await waitFor(() => {
      const iframe = container.querySelector("iframe");
      expect(iframe?.getAttribute("srcdoc")).toContain("<h1>Hello</h1>");
    });
    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("sandbox")).toBe("");
    expect(global.fetch).toHaveBeenCalledWith(
      "/api/knowledge/artifacts/art-1/download?disposition=inline",
    );
  });

  it("shows an error state when Markdown fails to load", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    renderModal(fileArtifact("notes.md", "text/markdown"));
    await waitFor(() =>
      expect(screen.getByText(/could not load preview/i)).toBeInTheDocument(),
    );
  });
});

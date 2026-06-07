/**
 * Decides whether a Knowledge artifact file can be previewed in-app and, if so,
 * which renderer to use. Detection uses the MIME type AND the filename
 * extension, because `.md`/`.html` files frequently upload with a generic or
 * wrong MIME type depending on the OS and how the file was selected.
 */
import type { ArtifactFile } from "@/content/knowledge-artifacts";

export type PreviewKind = "pdf" | "html" | "markdown";

/** Lowercased extension (without the dot) of a filename, or "" when none. */
function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

/** The preview renderer for a file, or `null` when it is not previewable. */
export function previewKind(file: Pick<ArtifactFile, "mimeType" | "fileName">): PreviewKind | null {
  const mime = file.mimeType.toLowerCase();
  const ext = fileExtension(file.fileName);

  if (mime === "application/pdf" || ext === "pdf") return "pdf";
  if (
    mime === "text/html" ||
    mime === "application/xhtml+xml" ||
    ext === "html" ||
    ext === "htm" ||
    ext === "xhtml"
  ) {
    return "html";
  }
  if (mime === "text/markdown" || ext === "md" || ext === "markdown") return "markdown";

  return null;
}

/** Build the inline (in-browser, non-attachment) URL for a file artifact. */
export function artifactInlineUrl(id: string): string {
  return `/api/knowledge/artifacts/${encodeURIComponent(id)}/download?disposition=inline`;
}

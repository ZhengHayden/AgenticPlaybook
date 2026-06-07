/**
 * Domain model for Knowledge artifacts — the deliverables attached to a use
 * case (playbooks, decks, prompt sets, SOPs, code, diagrams, datasets). Each
 * artifact keeps a single current file or link plus a textual change log; old
 * file bytes are not retained (see the redesign spec).
 */

export type ArtifactKind = "file" | "link";
export type ArtifactType =
  | "playbook" | "deck" | "promptSet" | "sop"
  | "code" | "diagram" | "dataset" | "other";
export type ArtifactStatus = "draft" | "published" | "deprecated";

export const ARTIFACT_KINDS: readonly ArtifactKind[] = ["file", "link"];
export const ARTIFACT_TYPES: readonly ArtifactType[] = [
  "playbook", "deck", "promptSet", "sop", "code", "diagram", "dataset", "other",
];
export const ARTIFACT_STATUSES: readonly ArtifactStatus[] = [
  "draft", "published", "deprecated",
];
export const DEFAULT_ARTIFACT_STATUS: ArtifactStatus = "draft";

/** Upload limits enforced at the API boundary. */
export const MAX_ARTIFACT_BYTES = 25 * 1024 * 1024; // 25 MB
export const ALLOWED_ARTIFACT_MIME: readonly string[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/markdown", "text/csv", "text/html",
  "application/xhtml+xml",
  "image/png", "image/jpeg", "image/svg+xml",
  "application/json", "application/zip",
];

/**
 * File extensions accepted as a fallback when the browser supplies no usable
 * MIME type. Kept in step with {@link ALLOWED_ARTIFACT_MIME}.
 */
export const ALLOWED_ARTIFACT_EXTENSIONS: readonly string[] = [
  "pdf", "pptx", "docx", "xlsx",
  "txt", "md", "markdown", "csv", "html", "htm", "xhtml",
  "png", "jpg", "jpeg", "svg", "json", "zip",
];

/** MIME values browsers emit when they cannot determine a file's type. */
const GENERIC_MIME_TYPES: readonly string[] = [
  "", "application/octet-stream", "binary/octet-stream",
];

/** Lowercased extension (without the dot) of a filename, or "" when none. */
function fileExtension(fileName: string): string {
  const dot = fileName.lastIndexOf(".");
  return dot >= 0 ? fileName.slice(dot + 1).toLowerCase() : "";
}

/**
 * Whether an uploaded file is an accepted artifact.
 *
 * Browser-reported MIME types are unreliable — many `.html`/`.htm` files arrive
 * as `application/octet-stream` or an empty string depending on OS file
 * associations and how the file was selected — so when the MIME type is missing
 * or generic we fall back to the file extension. A file declaring a specific,
 * disallowed MIME type (e.g. an `.exe`) is still rejected outright.
 */
export function isAllowedArtifactFile(mimeType: string, fileName: string): boolean {
  if (ALLOWED_ARTIFACT_MIME.includes(mimeType)) return true;
  if (GENERIC_MIME_TYPES.includes(mimeType)) {
    return ALLOWED_ARTIFACT_EXTENSIONS.includes(fileExtension(fileName));
  }
  return false;
}

export interface ArtifactFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; // server-derived, relative to the artifacts dir
}

export interface ArtifactChangeEntry {
  at: number; // epoch millis
  author: string;
  note: string;
  versionLabel?: string;
}

export interface KnowledgeArtifact {
  id: string;
  useCaseId: string;
  title: string;
  kind: ArtifactKind;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  versionLabel?: string;
  createdAt: number;
  updatedAt: number;
  file?: ArtifactFile; // kind === "file"
  url?: string;        // kind === "link"
  changelog: ArtifactChangeEntry[];
}

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
  "text/plain", "text/markdown", "text/csv",
  "image/png", "image/jpeg", "image/svg+xml",
  "application/json", "application/zip",
];

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

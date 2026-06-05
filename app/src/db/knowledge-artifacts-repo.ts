import { eq } from "drizzle-orm";
import { db } from "./client";
import { knowledgeArtifacts, type KnowledgeArtifactRow } from "./schema";
import {
  DEFAULT_ARTIFACT_STATUS,
  type ArtifactChangeEntry,
  type KnowledgeArtifact,
} from "@/content/knowledge-artifacts";
import {
  writeArtifactFile,
  deleteArtifactDir,
} from "@/lib/artifact-storage";
import type {
  CreateFileMetaInput,
  CreateLinkArtifactInput,
  UpdateArtifactInput,
} from "./knowledge-artifacts-validation";

// Suppress unused-import lint warning for DEFAULT_ARTIFACT_STATUS — it is
// referenced by the domain model and exported constants; kept here for parity
// with the other repo modules that import it.
void DEFAULT_ARTIFACT_STATUS;

/** Current epoch millis. Isolated so tests can reason about timing easily. */
function now(): number {
  return Date.now();
}

// ─── (de)serialization ────────────────────────────────────────

function toRow(a: KnowledgeArtifact): KnowledgeArtifactRow {
  return {
    id: a.id,
    useCaseId: a.useCaseId,
    kind: a.kind,
    type: a.type,
    status: a.status,
    updatedAt: a.updatedAt,
    data: JSON.stringify(a),
  };
}

function fromRow(row: KnowledgeArtifactRow): KnowledgeArtifact {
  return JSON.parse(row.data) as KnowledgeArtifact;
}

// ─── helpers ─────────────────────────────────────────────────

function newId(): string {
  return `art-${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function changeEntry(
  author: string,
  note: string,
  versionLabel?: string,
): ArtifactChangeEntry {
  return { at: now(), author, note, versionLabel };
}

// ─── FileUpload interface (consumed by API routes) ────────────

export interface FileUpload {
  fileName: string;
  mimeType: string;
  bytes: Buffer;
}

// ─── reads ───────────────────────────────────────────────────

/** List all artifacts for a use case, sorted by updatedAt descending. */
export async function listArtifacts(useCaseId: string): Promise<KnowledgeArtifact[]> {
  return db
    .select()
    .from(knowledgeArtifacts)
    .where(eq(knowledgeArtifacts.useCaseId, useCaseId))
    .all()
    .map(fromRow)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getArtifact(id: string): Promise<KnowledgeArtifact | undefined> {
  const row = db
    .select()
    .from(knowledgeArtifacts)
    .where(eq(knowledgeArtifacts.id, id))
    .get();
  return row ? fromRow(row) : undefined;
}

// ─── creates ─────────────────────────────────────────────────

export async function createLinkArtifact(
  useCaseId: string,
  input: CreateLinkArtifactInput,
): Promise<KnowledgeArtifact> {
  const ts = now();
  const artifact: KnowledgeArtifact = {
    id: newId(),
    useCaseId,
    title: input.title,
    kind: "link",
    type: input.type as KnowledgeArtifact["type"],
    status: input.status as KnowledgeArtifact["status"],
    owner: input.owner,
    versionLabel: input.versionLabel,
    url: input.url,
    createdAt: ts,
    updatedAt: ts,
    changelog: [
      changeEntry(input.owner, input.changeNote ?? "Created", input.versionLabel),
    ],
  };
  db.insert(knowledgeArtifacts).values(toRow(artifact)).run();
  return artifact;
}

export async function createFileArtifact(
  useCaseId: string,
  input: CreateFileMetaInput,
  upload: FileUpload,
): Promise<KnowledgeArtifact> {
  const ts = now();
  const id = newId();
  const storagePath = await writeArtifactFile(useCaseId, id, upload.fileName, upload.bytes);
  const artifact: KnowledgeArtifact = {
    id,
    useCaseId,
    title: input.title,
    kind: "file",
    type: input.type as KnowledgeArtifact["type"],
    status: input.status as KnowledgeArtifact["status"],
    owner: input.owner,
    versionLabel: input.versionLabel,
    file: {
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      sizeBytes: upload.bytes.length,
      storagePath,
    },
    createdAt: ts,
    updatedAt: ts,
    changelog: [
      changeEntry(input.owner, input.changeNote ?? "Created", input.versionLabel),
    ],
  };
  db.insert(knowledgeArtifacts).values(toRow(artifact)).run();
  return artifact;
}

// ─── updates ─────────────────────────────────────────────────

/**
 * Patch an artifact's metadata. Immutable fields (id, kind, useCaseId) are
 * always taken from the stored record regardless of what `patch` contains.
 * The changelog is appended — history is never rewritten.
 */
export async function updateArtifact(
  id: string,
  patch: UpdateArtifactInput,
): Promise<KnowledgeArtifact | undefined> {
  const existing = await getArtifact(id);
  if (!existing) return undefined;

  const { changeNote, ...fields } = patch;

  const updated: KnowledgeArtifact = {
    ...existing,
    ...fields,
    // Enforce immutability of structural identity fields.
    id: existing.id,
    kind: existing.kind,
    useCaseId: existing.useCaseId,
    // Cast zod-narrowed strings to the domain union types.
    type: (fields.type ?? existing.type) as KnowledgeArtifact["type"],
    status: (fields.status ?? existing.status) as KnowledgeArtifact["status"],
    updatedAt: now(),
    changelog: [
      ...existing.changelog,
      changeEntry(
        fields.owner ?? existing.owner,
        changeNote ?? "Updated",
        fields.versionLabel ?? existing.versionLabel,
      ),
    ],
  };

  db.update(knowledgeArtifacts)
    .set(toRow(updated))
    .where(eq(knowledgeArtifacts.id, id))
    .run();
  return updated;
}

/**
 * Replace the current file on a file-kind artifact. Returns undefined if the
 * artifact does not exist or is not a file kind (link artifacts are rejected).
 * The prior file bytes are removed; a changelog entry is appended.
 */
export async function replaceArtifactFile(
  id: string,
  upload: FileUpload,
  changeNote?: string,
  versionLabel?: string,
): Promise<KnowledgeArtifact | undefined> {
  const existing = await getArtifact(id);
  if (!existing || existing.kind !== "file") return undefined;

  const storagePath = await writeArtifactFile(
    existing.useCaseId,
    existing.id,
    upload.fileName,
    upload.bytes,
  );

  const updated: KnowledgeArtifact = {
    ...existing,
    file: {
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      sizeBytes: upload.bytes.length,
      storagePath,
    },
    versionLabel: versionLabel ?? existing.versionLabel,
    updatedAt: now(),
    changelog: [
      ...existing.changelog,
      changeEntry(existing.owner, changeNote ?? "Replaced file", versionLabel),
    ],
  };

  db.update(knowledgeArtifacts)
    .set(toRow(updated))
    .where(eq(knowledgeArtifacts.id, id))
    .run();
  return updated;
}

// ─── delete ──────────────────────────────────────────────────

/**
 * Delete an artifact row. For file-kind artifacts the on-disk directory is
 * removed as well. Returns false if the artifact was not found.
 */
export async function deleteArtifact(id: string): Promise<boolean> {
  const existing = await getArtifact(id);
  if (!existing) return false;

  db.delete(knowledgeArtifacts).where(eq(knowledgeArtifacts.id, id)).run();

  if (existing.kind === "file") {
    await deleteArtifactDir(existing.useCaseId, existing.id);
  }

  return true;
}

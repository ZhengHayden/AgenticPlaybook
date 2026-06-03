import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import type { SopFileRef } from "@/content/sample-data";

/**
 * Server-only filesystem storage for uploaded SOP PDFs. Files live under
 * `data/uploads/<projectId>/<uuid>.pdf`. The `data/` directory is git-ignored.
 *
 * Security posture:
 *  - only `application/pdf` and a hard size cap are accepted;
 *  - the storage name is generated server-side (never the client filename);
 *  - both `projectId` and `storedName` are validated against path traversal.
 */

export const UPLOAD_ROOT = path.resolve(process.cwd(), "data/uploads");
export const MAX_SOP_BYTES = 15 * 1024 * 1024; // 15 MB
const PDF_MIME = "application/pdf";

/** A single path segment: letters, digits, dot, underscore, hyphen. No slashes or "..". */
const SAFE_SEGMENT = /^[A-Za-z0-9._-]+$/;

export class SopValidationError extends Error {}

function assertSafeSegment(segment: string, label: string): void {
  if (!SAFE_SEGMENT.test(segment) || segment === "." || segment === "..") {
    throw new SopValidationError(`Invalid ${label}`);
  }
}

/** Resolve a project's upload directory, guarding the project id. */
function projectDir(projectId: string): string {
  assertSafeSegment(projectId, "project id");
  return path.join(UPLOAD_ROOT, projectId);
}

/**
 * Validate and persist an uploaded SOP PDF. Returns a {@link SopFileRef} the
 * caller can merge into the candidate. Throws {@link SopValidationError} on a
 * bad mime type or oversize file.
 */
export async function saveSop(projectId: string, file: File): Promise<SopFileRef> {
  if (file.type !== PDF_MIME) {
    throw new SopValidationError("Only PDF files are accepted");
  }
  if (file.size <= 0) {
    throw new SopValidationError("File is empty");
  }
  if (file.size > MAX_SOP_BYTES) {
    throw new SopValidationError(`File exceeds the ${MAX_SOP_BYTES / (1024 * 1024)} MB limit`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const storedName = `${randomUUID()}.pdf`;
  const dir = projectDir(projectId);
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, storedName), buffer);

  return {
    filename: file.name,
    storedName,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

/** Read a stored SOP PDF as a Buffer, guarding both ids against traversal. */
export async function readSop(projectId: string, storedName: string): Promise<Buffer> {
  assertSafeSegment(storedName, "file name");
  const dir = projectDir(projectId);
  const filePath = path.join(dir, storedName);
  // Defence in depth: ensure the resolved path stays within the project dir.
  if (path.relative(dir, filePath).startsWith("..")) {
    throw new SopValidationError("Invalid file path");
  }
  return readFile(filePath);
}

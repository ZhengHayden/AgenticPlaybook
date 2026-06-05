import path from "node:path";
import fs from "node:fs/promises";

/** Root dir for artifact bytes; overridable in tests via env. */
function artifactsRoot(): string {
  return process.env.PLAYBOOK_ARTIFACTS_DIR ?? path.resolve(process.cwd(), "data/artifacts");
}

/**
 * Strip directory separators and traversal segments from a filename.
 * Replaces `/`, `\` with `_`, then collapses `..` to `_`, then strips
 * leading underscores/dots, leaving a safe non-empty basename.
 */
export function sanitizeFileName(name: string): string {
  const normalized = name
    .replace(/[/\\]/g, "_")   // replace all separators with underscores
    .replace(/\.\.+/g, "_")   // replace .. (traversal) with underscores
    .replace(/^[_.]+/, "")    // strip leading underscores and dots
    .trim();
  return normalized.length > 0 ? normalized : "file";
}

/**
 * Allowlist: IDs may only contain alphanumerics, dots, underscores, hyphens.
 * Additionally rejects pure-dot strings (".", "..") to prevent path traversal.
 * Throws on empty or invalid input so bad IDs never reach the filesystem.
 */
function safeId(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!clean) throw new Error(`Invalid id: "${id}"`);
  if (/^\.+$/.test(clean)) {
    throw new Error(`Invalid id (dot-only ids are not permitted): "${id}"`);
  }
  return clean;
}

/**
 * Resolve a path within the artifacts root, guarding against traversal.
 * Requires the resolved path to be a STRICT CHILD of the root directory —
 * the root itself is not a valid target for any operation.
 */
function resolveWithin(relativePath: string): string {
  const root = path.resolve(artifactsRoot());
  const abs = path.resolve(root, relativePath);
  // abs must be strictly inside root (must start with root + separator)
  if (!abs.startsWith(root + path.sep)) {
    throw new Error(`Path escapes artifacts root: "${relativePath}"`);
  }
  return abs;
}

/**
 * Write bytes to `<root>/<useCaseId>/<artifactId>/<fileName>`, removing any
 * previous file in that artifact directory first (current-only, no history).
 * Returns the relative storage path to persist on the artifact record.
 */
export async function writeArtifactFile(
  useCaseId: string,
  artifactId: string,
  fileName: string,
  bytes: Buffer,
): Promise<string> {
  const safeName = sanitizeFileName(fileName);
  const dirRel = path.join(safeId(useCaseId), safeId(artifactId));
  const dirAbs = resolveWithin(dirRel);
  // Remove any prior file to enforce current-only storage (no history).
  await fs.rm(dirAbs, { recursive: true, force: true });
  await fs.mkdir(dirAbs, { recursive: true });
  await fs.writeFile(path.join(dirAbs, safeName), bytes);
  return path.posix.join(safeId(useCaseId), safeId(artifactId), safeName);
}

/** Read file bytes from a stored relative path, guarding against traversal. */
export async function readArtifactFile(relativePath: string): Promise<Buffer> {
  const abs = resolveWithin(relativePath);
  return fs.readFile(abs) as Promise<Buffer>;
}

/** Remove an artifact's directory and all its contents. */
export async function deleteArtifactDir(useCaseId: string, artifactId: string): Promise<void> {
  const dirAbs = resolveWithin(path.join(safeId(useCaseId), safeId(artifactId)));
  await fs.rm(dirAbs, { recursive: true, force: true });
}

/** Remove all artifacts for a use case (cascade on use-case delete). */
export async function deleteUseCaseArtifactsDir(useCaseId: string): Promise<void> {
  const dirAbs = resolveWithin(safeId(useCaseId));
  await fs.rm(dirAbs, { recursive: true, force: true });
}

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import type { BenchmarkVersion, BenchmarkVersionIndex, BenchmarkVersionMeta } from "./types";

/**
 * Server-only persistence for company-scoped benchmark versions, partitioned by
 * company key under the git-ignored runtime `data/benchmark/` tree. Mirrors
 * `scan/store.ts` conventions (recursive mkdir, `isNotFound`, JSON pretty-print):
 *  - `data/benchmark/<companyKey>/index.json`              — {@link BenchmarkVersionIndex} (metadata only)
 *  - `data/benchmark/<companyKey>/versions/<versionId>.json` — full {@link BenchmarkVersion}
 *
 * Shipped defaults are TS constants (see `content/benchmarks/`) and are NEVER
 * written here — only company versions live under this tree.
 */

export const BENCHMARK_ROOT = path.resolve(process.cwd(), "data/benchmark");

function companyDir(companyKey: string): string {
  return path.join(BENCHMARK_ROOT, companyKey);
}

function indexPath(companyKey: string): string {
  return path.join(companyDir(companyKey), "index.json");
}

function versionPath(companyKey: string, versionId: string): string {
  return path.join(companyDir(companyKey), "versions", `${versionId}.json`);
}

/** Reject version ids that could escape the versions directory (path traversal). */
function isSafeVersionId(versionId: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(versionId);
}

/** List a company's saved versions, newest first; `[]` when none exist. */
export async function listVersions(companyKey: string): Promise<BenchmarkVersionMeta[]> {
  let index: BenchmarkVersionIndex;
  try {
    const raw = await readFile(indexPath(companyKey), "utf8");
    index = JSON.parse(raw) as BenchmarkVersionIndex;
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }
  return [...index.versions].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Read a single full version, or null when absent / id is unsafe. */
export async function readVersion(
  companyKey: string,
  versionId: string,
): Promise<BenchmarkVersion | null> {
  if (!isSafeVersionId(versionId)) return null;
  try {
    const raw = await readFile(versionPath(companyKey, versionId), "utf8");
    return JSON.parse(raw) as BenchmarkVersion;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** Persist a full version and upsert its metadata into the company index. */
export async function writeVersion(companyKey: string, version: BenchmarkVersion): Promise<void> {
  if (!isSafeVersionId(version.versionId)) {
    throw new Error("Invalid version id");
  }
  const dir = companyDir(companyKey);
  await mkdir(path.join(dir, "versions"), { recursive: true });
  await writeFile(versionPath(companyKey, version.versionId), JSON.stringify(version, null, 2), "utf8");

  const meta: BenchmarkVersionMeta = {
    versionId: version.versionId,
    name: version.name,
    companyKey: version.companyKey,
    region: version.region,
    sector: version.sector,
    createdAt: version.createdAt,
    source: version.source,
  };
  const existing = await listVersions(companyKey);
  const next = [...existing.filter((v) => v.versionId !== meta.versionId), meta];
  await writeFile(indexPath(companyKey), JSON.stringify({ versions: next }, null, 2), "utf8");
}

/** Remove a version file and its index entry. Returns false when it didn't exist. */
export async function deleteVersion(companyKey: string, versionId: string): Promise<boolean> {
  if (!isSafeVersionId(versionId)) return false;
  const existing = await listVersions(companyKey);
  if (!existing.some((v) => v.versionId === versionId)) return false;

  await rm(versionPath(companyKey, versionId), { force: true });
  const next = existing.filter((v) => v.versionId !== versionId);
  await writeFile(indexPath(companyKey), JSON.stringify({ versions: next }, null, 2), "utf8");
  return true;
}

function isNotFound(error: unknown): boolean {
  return (
    typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "ENOENT"
  );
}

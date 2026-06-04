import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import type { ScanManifest, ScanModel } from "./types";

/**
 * Server-only persistence for Opportunity Scans, partitioned by company. Each
 * client/company gets its own directory under the git-ignored runtime
 * `data/scan/` tree — no DB schema change:
 *  - `data/scan/<companyKey>/model.json`        — the computed {@link ScanModel}
 *  - `data/scan/<companyKey>/manifest.json`     — lightweight {@link ScanManifest}
 *  - `data/scan/<companyKey>/uploads/<slot>.<ext>` — the last-uploaded raw files
 *
 * A project links to its scan via {@link scanCompanyKey}(project.client), so the
 * key derivation must match the project slug rule exactly.
 */

export const SCAN_ROOT = path.resolve(process.cwd(), "data/scan");

/** Fixed upload slots — the storage name is never derived from the client filename. */
export type UploadSlot = "labor_rate" | "hc" | "automation";

/**
 * Canonical company key (slug) used as the storage partition and the
 * project↔scan join key. Mirrors `slugify` in `src/db/projects-repo.ts` so that
 * `scanCompanyKey(project.client)` always resolves to the same folder a scan
 * launched from that project wrote to.
 */
export function scanCompanyKey(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "company";
}

function companyDir(companyKey: string): string {
  return path.join(SCAN_ROOT, companyKey);
}

/** Persist the computed model + its manifest for a company. */
export async function writeScanModel(companyKey: string, model: ScanModel): Promise<void> {
  const dir = companyDir(companyKey);
  await mkdir(dir, { recursive: true });
  const manifest: ScanManifest = {
    companyKey: model.companyKey,
    company: model.company,
    sector: model.sector,
    generatedAt: model.generatedAt,
  };
  await Promise.all([
    writeFile(path.join(dir, "model.json"), JSON.stringify(model, null, 2), "utf8"),
    writeFile(path.join(dir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf8"),
  ]);
}

/** Read a company's computed model, or null when no scan exists for it yet. */
export async function readScanModel(companyKey: string): Promise<ScanModel | null> {
  try {
    const raw = await readFile(path.join(companyDir(companyKey), "model.json"), "utf8");
    return JSON.parse(raw) as ScanModel;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** List every company that has a scan, newest first; powers the `/scan` index. */
export async function listManifests(): Promise<ScanManifest[]> {
  let entries: string[];
  try {
    entries = (await readdir(SCAN_ROOT, { withFileTypes: true }))
      .filter((e) => e.isDirectory())
      .map((e) => e.name);
  } catch (error) {
    if (isNotFound(error)) return [];
    throw error;
  }

  const manifests = await Promise.all(entries.map(readManifest));
  return manifests
    .filter((m): m is ScanManifest => m !== null)
    .sort((a, b) => b.generatedAt.localeCompare(a.generatedAt));
}

async function readManifest(companyKey: string): Promise<ScanManifest | null> {
  try {
    const raw = await readFile(path.join(companyDir(companyKey), "manifest.json"), "utf8");
    return JSON.parse(raw) as ScanManifest;
  } catch (error) {
    if (isNotFound(error)) return null;
    throw error;
  }
}

/** Persist a raw uploaded source file under a company's fixed slot, preserving extension. */
export async function writeUpload(
  companyKey: string,
  slot: UploadSlot,
  filename: string,
  buffer: Buffer,
): Promise<void> {
  const uploads = path.join(companyDir(companyKey), "uploads");
  await mkdir(uploads, { recursive: true });
  const ext = safeExtension(filename);
  await writeFile(path.join(uploads, `${slot}${ext}`), buffer);
}

/** Lowercased extension limited to known alphanumerics; defaults to empty. */
function safeExtension(filename: string): string {
  const ext = path.extname(filename).toLowerCase();
  return /^\.[a-z0-9]+$/.test(ext) ? ext : "";
}

function isNotFound(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "ENOENT";
}

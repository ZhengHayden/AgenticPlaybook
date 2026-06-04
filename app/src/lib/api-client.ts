import type { Project, SopFileRef } from "@/content/sample-data";
import type { ApiResponse } from "@/lib/api-response";
import type { CreateProjectInput, ProjectPatchInput } from "@/db/validation";
import type { UnderstandingResult } from "@/lib/understanding-agent";
import type { ScanInputs, ScanManifest, ScanModel } from "@/lib/scan/types";
import type { BenchmarkSnapshot, BenchmarkVersion, BenchmarkVersionMeta } from "@/lib/benchmark/types";

/**
 * Everything a scan needs: the company identity plus the source files. HC is
 * required; labor rate and automation are optional — when omitted the server
 * seeds them from the regional benchmark default.
 */
export interface ScanUpload {
  company: string;
  sector: string;
  region: string;
  headcount: File;
  laborRate?: File;
  automation?: File;
}

/**
 * Thin typed fetch wrappers around the /api/projects endpoints, for use from
 * client components. Each throws on a non-success envelope so callers can
 * surface a message.
 */

async function parse<T>(res: Response): Promise<T> {
  const body = (await res.json()) as ApiResponse<T>;
  if (!res.ok || !body.success || body.data === undefined) {
    throw new Error(body.error ?? `Request failed (${res.status})`);
  }
  return body.data;
}

export async function createProject(input: CreateProjectInput): Promise<Project> {
  const res = await fetch("/api/projects", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<Project>(res);
}

export async function updateProject(id: string, patch: ProjectPatchInput): Promise<Project> {
  const res = await fetch(`/api/projects/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parse<Project>(res);
}

export async function deleteProject(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/projects/${id}`, { method: "DELETE" });
  return parse<{ id: string }>(res);
}

/** Upload a SOP PDF for a project; returns the stored file reference. */
export async function uploadSop(projectId: string, file: File): Promise<SopFileRef> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`/api/projects/${projectId}/sop`, { method: "POST", body: form });
  return parse<SopFileRef>(res);
}

/** Fetch a company's computed Opportunity Scan, or null when none has run yet. */
export async function fetchScan(companyKey: string): Promise<ScanModel | null> {
  const res = await fetch(`/api/scan?company=${encodeURIComponent(companyKey)}`, { method: "GET" });
  return parse<ScanModel | null>(res);
}

/** List every company that has an Opportunity Scan (for the `/scan` index). */
export async function fetchScanIndex(): Promise<ScanManifest[]> {
  const res = await fetch("/api/scan", { method: "GET" });
  return parse<ScanManifest[]>(res);
}

/** Upload company identity + source files and compute a fresh scan model. */
export async function computeScan(upload: ScanUpload): Promise<ScanModel> {
  const form = new FormData();
  form.append("company", upload.company);
  form.append("sector", upload.sector);
  form.append("region", upload.region);
  form.append("headcount", upload.headcount);
  if (upload.laborRate) form.append("laborRate", upload.laborRate);
  if (upload.automation) form.append("automation", upload.automation);
  const res = await fetch("/api/scan", { method: "POST", body: form });
  return parse<ScanModel>(res);
}

/** Fetch a company's editable input layer, or null when the scan has no editable data. */
export async function fetchScanInputs(companyKey: string): Promise<ScanInputs | null> {
  const res = await fetch(`/api/scan/${encodeURIComponent(companyKey)}/inputs`, { method: "GET" });
  return parse<ScanInputs | null>(res);
}

/** Persist edited inputs, recompute the model server-side, and return the fresh scan. */
export async function updateScanInputs(companyKey: string, inputs: ScanInputs): Promise<ScanModel> {
  const res = await fetch(`/api/scan/${encodeURIComponent(companyKey)}/inputs`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputs),
  });
  return parse<ScanModel>(res);
}

/** Fetch the shipped read-only benchmark default for a (region, sector) pair. */
export async function fetchDefaultBenchmark(region: string, sector: string): Promise<BenchmarkSnapshot> {
  const params = new URLSearchParams({ region, sector });
  const res = await fetch(`/api/benchmark/default?${params.toString()}`, { method: "GET" });
  return parse<BenchmarkSnapshot>(res);
}

/** List a company's saved benchmark versions (metadata only), newest first. */
export async function fetchBenchmarkVersions(companyKey: string): Promise<BenchmarkVersionMeta[]> {
  const res = await fetch(`/api/benchmark/${encodeURIComponent(companyKey)}/versions`, { method: "GET" });
  return parse<BenchmarkVersionMeta[]>(res);
}

/** Fetch one full saved benchmark version, or null when absent. */
export async function fetchBenchmarkVersion(
  companyKey: string,
  versionId: string,
): Promise<BenchmarkVersion | null> {
  const res = await fetch(
    `/api/benchmark/${encodeURIComponent(companyKey)}/versions/${encodeURIComponent(versionId)}`,
    { method: "GET" },
  );
  return parse<BenchmarkVersion | null>(res);
}

/** Save an edited snapshot as a new named company version. */
export async function saveBenchmarkVersion(
  companyKey: string,
  body: { name: string; region: string; sector: string; snapshot: BenchmarkSnapshot },
): Promise<BenchmarkVersion> {
  const res = await fetch(`/api/benchmark/${encodeURIComponent(companyKey)}/versions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ...body, source: "edited" }),
  });
  return parse<BenchmarkVersion>(res);
}

/** Upload labor and/or automation files as a new company version (multipart). */
export async function uploadBenchmarkVersion(
  companyKey: string,
  fields: { name: string; region: string; sector: string; laborRate?: File; automation?: File },
): Promise<BenchmarkVersion> {
  const form = new FormData();
  form.append("name", fields.name);
  form.append("region", fields.region);
  form.append("sector", fields.sector);
  if (fields.laborRate) form.append("laborRate", fields.laborRate);
  if (fields.automation) form.append("automation", fields.automation);
  const res = await fetch(`/api/benchmark/${encodeURIComponent(companyKey)}/versions`, {
    method: "POST",
    body: form,
  });
  return parse<BenchmarkVersion>(res);
}

/** Delete a saved company benchmark version. */
export async function deleteBenchmarkVersion(
  companyKey: string,
  versionId: string,
): Promise<{ versionId: string }> {
  const res = await fetch(
    `/api/benchmark/${encodeURIComponent(companyKey)}/versions/${encodeURIComponent(versionId)}`,
    { method: "DELETE" },
  );
  return parse<{ versionId: string }>(res);
}

/** Run the Understanding Agent over a candidate's uploaded SOP. */
export async function requestUnderstanding(
  projectId: string,
  candidateId: string,
): Promise<UnderstandingResult> {
  const res = await fetch(`/api/projects/${projectId}/understand`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ candidateId }),
  });
  return parse<UnderstandingResult>(res);
}

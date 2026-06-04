import type { Project, SopFileRef } from "@/content/sample-data";
import type { ApiResponse } from "@/lib/api-response";
import type { CreateProjectInput, ProjectPatchInput } from "@/db/validation";
import type { UnderstandingResult } from "@/lib/understanding-agent";
import type { ScanManifest, ScanModel } from "@/lib/scan/types";

/** Everything a scan needs: the company identity plus the three source files. */
export interface ScanUpload {
  company: string;
  sector: string;
  laborRate: File;
  headcount: File;
  automation: File;
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

/** Upload company identity + the three source files and compute a fresh scan model. */
export async function computeScan(upload: ScanUpload): Promise<ScanModel> {
  const form = new FormData();
  form.append("company", upload.company);
  form.append("sector", upload.sector);
  form.append("laborRate", upload.laborRate);
  form.append("headcount", upload.headcount);
  form.append("automation", upload.automation);
  const res = await fetch("/api/scan", { method: "POST", body: form });
  return parse<ScanModel>(res);
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

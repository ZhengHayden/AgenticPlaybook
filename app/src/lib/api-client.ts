import type { Project, SopFileRef } from "@/content/sample-data";
import type { ApiResponse } from "@/lib/api-response";
import type { CreateProjectInput, ProjectPatchInput } from "@/db/validation";
import type { UnderstandingResult } from "@/lib/understanding-agent";

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

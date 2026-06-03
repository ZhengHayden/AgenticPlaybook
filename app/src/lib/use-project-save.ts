"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { updateProject } from "@/lib/api-client";
import type { ProjectPatchInput } from "@/db/validation";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface UseProjectSave {
  status: SaveStatus;
  error: string | null;
  save: (patch: ProjectPatchInput) => Promise<void>;
}

/**
 * Persists a partial project update via PATCH /api/projects/:id and exposes
 * save status for the UI. Refreshes server components on success so the new
 * values are reflected if the user navigates.
 */
export function useProjectSave(projectId: string): UseProjectSave {
  const router = useRouter();
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(
    async (patch: ProjectPatchInput) => {
      setStatus("saving");
      setError(null);
      try {
        await updateProject(projectId, patch);
        setStatus("saved");
        router.refresh();
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    },
    [projectId, router],
  );

  return { status, error, save };
}

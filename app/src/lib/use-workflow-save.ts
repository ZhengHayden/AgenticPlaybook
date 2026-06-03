"use client";

import { useCallback } from "react";
import { useProjectSave, type SaveStatus } from "@/lib/use-project-save";
import type { Workflow } from "@/content/sample-data";

interface UseWorkflowSave {
  status: SaveStatus;
  error: string | null;
  /** Merge a partial workflow patch into the full workflows array and persist. */
  saveWorkflow: (patch: Partial<Workflow>) => Promise<void>;
}

/**
 * Persists edits to a single workflow without dropping the rest of the
 * project's workflows. The full `workflows` array is rebuilt with the patched
 * workflow merged in, then sent through the project PATCH path.
 */
export function useWorkflowSave(
  projectId: string,
  workflows: ReadonlyArray<Workflow>,
  workflowId: string,
): UseWorkflowSave {
  const { status, error, save } = useProjectSave(projectId);

  const saveWorkflow = useCallback(
    async (patch: Partial<Workflow>) => {
      const next = workflows.map((w) =>
        w.id === workflowId ? { ...w, ...patch, id: w.id } : w,
      );
      await save({ workflows: next });
    },
    [workflows, workflowId, save],
  );

  return { status, error, saveWorkflow };
}

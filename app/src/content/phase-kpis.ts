import type { PhaseId, Project, WorkflowStatus } from "./sample-data";

export interface PhaseKpi {
  /** Count of items attributable to the phase. */
  count: number;
  /** Completion percentage (0–100), derived from `phaseProgress`. */
  pct: number;
}

const MVP_STATUSES: ReadonlyArray<WorkflowStatus> = ["built", "live"];
const PRODUCTION_STATUSES: ReadonlyArray<WorkflowStatus> = ["live"];

function countWorkflowsByStatus(
  project: Pick<Project, "workflows">,
  statuses: ReadonlyArray<WorkflowStatus>,
): number {
  return project.workflows.filter((w) => w.status !== undefined && statuses.includes(w.status))
    .length;
}

/**
 * Per-phase KPIs for a project card: how many items live in each phase and the
 * phase's completion percentage. Counts are derived from the single sources of
 * truth (candidates, workflows, workflow.status); percentages come from
 * `phaseProgress`.
 */
export function projectPhaseKpis(
  project: Pick<Project, "candidates" | "workflows" | "phaseProgress">,
): Record<PhaseId, PhaseKpi> {
  const pct = (phase: PhaseId): number => Math.round((project.phaseProgress[phase] ?? 0) * 100);
  return {
    impactSizing: { count: project.candidates.length, pct: pct("impactSizing") },
    design: { count: project.workflows.length, pct: pct("design") },
    mvp: { count: countWorkflowsByStatus(project, MVP_STATUSES), pct: pct("mvp") },
    production: {
      count: countWorkflowsByStatus(project, PRODUCTION_STATUSES),
      pct: pct("production"),
    },
  };
}

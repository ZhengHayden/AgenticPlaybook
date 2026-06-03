import type { Project, Workflow } from "@/content/sample-data";

/** Resolve the workflow selected by the `?w=` query, falling back to the first. */
export function resolveWorkflow(project: Project, w?: string): Workflow | undefined {
  return project.workflows.find((wf) => wf.id === w) ?? project.workflows[0];
}

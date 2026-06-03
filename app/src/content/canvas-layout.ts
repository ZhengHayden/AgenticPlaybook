import type {
  CanvasNode,
  WorkflowCanvas,
  WorkflowEdge,
  WorkflowStep,
  Workflow,
} from "./sample-data";

/** Fixed node geometry so edge endpoints are computable from (x,y) without DOM measurement. */
export const NODE_W = 168;
export const NODE_H = 64;

/** Seed-layout grid spacing. */
const X_STRIDE = 200;
const Y_STRIDE = 96;
const PER_ROW = 3;
const MARGIN = 16;

/** Place steps left-to-right in a wrapping grid as the default canvas layout. */
function seedNodes(steps: ReadonlyArray<WorkflowStep>): CanvasNode[] {
  return steps.map((step, index) => ({
    stepId: step.id,
    x: MARGIN + (index % PER_ROW) * X_STRIDE,
    y: MARGIN + Math.floor(index / PER_ROW) * Y_STRIDE,
  }));
}

/** Seed a linear chain of edges following step order — a sane default to reshape. */
function seedEdges(steps: ReadonlyArray<WorkflowStep>): WorkflowEdge[] {
  const edges: WorkflowEdge[] = [];
  for (let i = 0; i < steps.length - 1; i += 1) {
    edges.push({ id: `e-seed-${steps[i].id}-${steps[i + 1].id}`, from: steps[i].id, to: steps[i + 1].id });
  }
  return edges;
}

/**
 * Return a clean canvas for the workflow:
 * - If a persisted canvas exists, drop nodes whose step no longer exists and
 *   edges with a missing endpoint (guards stale refs after a step is deleted).
 * - Otherwise seed a grid layout + linear chain of edges from the steps.
 */
export function normalizeCanvas(workflow: Workflow): WorkflowCanvas {
  const ordered = [...workflow.steps].sort((a, b) => a.seq - b.seq);
  if (!workflow.canvas) {
    return { nodes: seedNodes(ordered), edges: seedEdges(ordered) };
  }

  const stepIds = new Set(workflow.steps.map((s) => s.id));
  const nodes = workflow.canvas.nodes.filter((n) => stepIds.has(n.stepId));
  const placedIds = new Set(nodes.map((n) => n.stepId));
  const edges = workflow.canvas.edges.filter(
    (e) => placedIds.has(e.from) && placedIds.has(e.to),
  );
  return { nodes, edges };
}

/** Steps that are not yet placed on the canvas — feeds the "Add to canvas" menu. */
export function unplacedSteps(
  steps: ReadonlyArray<WorkflowStep>,
  canvas: WorkflowCanvas,
): WorkflowStep[] {
  const placed = new Set(canvas.nodes.map((n) => n.stepId));
  return [...steps].filter((s) => !placed.has(s.id)).sort((a, b) => a.seq - b.seq);
}

import type { Candidate, Workflow } from "./sample-data";
import {
  odsIndicators,
  orsIndicators,
  quadrantFromScores,
  type QuadrantId,
} from "./funnel-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "./binary-screen";
import {
  computeVm,
  computeDdiRaw,
  computeRiskPenalty,
  computeRas,
  computePriority,
} from "./scoring-rubric";

/**
 * Cohort-level scoring for Impact-Sizing candidates, reused by both the Impact
 * Sizing portfolio and the Design workflow portfolio. DDI is normalized against
 * the project's candidate cohort, so scoring is always done over the full set.
 */

export interface CandidateScore {
  quadrant: QuadrantId | "failed";
  priorityScore: number;
  vm: number;
}

function screenPassed(c: Candidate): boolean {
  return (
    screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0) >=
    SCREEN_PASS_THRESHOLD
  );
}

/**
 * Score every candidate, normalizing DDI across the cohort. Candidates that
 * fail the Layer-1 screen get a `failed` quadrant and a zero priority score.
 */
export function scoreCandidates(
  candidates: ReadonlyArray<Candidate>,
): Map<string, CandidateScore> {
  interface Working extends CandidateScore {
    id: string;
    ddiRaw: number;
    ras: number;
  }

  const working: Working[] = candidates.map((c) => {
    if (!screenPassed(c)) {
      return { id: c.id, quadrant: "failed", priorityScore: 0, vm: 0, ddiRaw: 0, ras: 0 };
    }
    const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
    const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
    const vm = computeVm(c.vm);
    const ddiRaw = computeDdiRaw(c.ddi, c.totalSteps);
    const ras = computeRas(vm, computeRiskPenalty(c.risk));
    const quadrant = c.quadrantOverride ?? quadrantFromScores(ods, ors);
    return { id: c.id, quadrant, priorityScore: 0, vm, ddiRaw, ras };
  });

  const maxDdiRaw = Math.max(...working.map((w) => w.ddiRaw), 0.0001);

  return new Map(
    working.map((w) => [
      w.id,
      {
        quadrant: w.quadrant,
        vm: w.vm,
        priorityScore:
          w.quadrant === "failed" ? 0 : computePriority(w.ras, w.ddiRaw / maxDdiRaw),
      },
    ]),
  );
}

export interface RankedWorkflow {
  workflow: Workflow;
  rank: number;
  /** Present only when the workflow links to a candidate that passed the screen. */
  score?: CandidateScore;
}

/**
 * Rank workflows by their origin candidate's PriorityScore (desc). Workflows
 * with no linked candidate — or whose candidate failed the screen — sort last,
 * preserving their relative input order.
 */
export function rankWorkflows(
  workflows: ReadonlyArray<Workflow>,
  candidates: ReadonlyArray<Candidate>,
): RankedWorkflow[] {
  const scores = scoreCandidates(candidates);

  const withScore = workflows.map((workflow, index) => {
    const score = workflow.candidateId ? scores.get(workflow.candidateId) : undefined;
    const eligible = score && score.quadrant !== "failed";
    return { workflow, index, score: eligible ? score : undefined };
  });

  // When any workflow carries an explicit priorityRank override, rank by that
  // first; otherwise fall back to candidate priority (today's behavior).
  const hasManual = withScore.some((w) => typeof w.workflow.priorityRank === "number");

  withScore.sort((a, b) => {
    if (hasManual) {
      const ra = a.workflow.priorityRank ?? Number.POSITIVE_INFINITY;
      const rb = b.workflow.priorityRank ?? Number.POSITIVE_INFINITY;
      if (ra !== rb) return ra - rb;
    }
    const sa = a.score?.priorityScore ?? -1;
    const sb = b.score?.priorityScore ?? -1;
    if (sb !== sa) return sb - sa;
    return a.index - b.index; // stable for un-scored / tied
  });

  return withScore.map(({ workflow, score }, idx) => ({ workflow, score, rank: idx + 1 }));
}

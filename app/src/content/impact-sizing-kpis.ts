import type { Candidate } from "./sample-data";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "./binary-screen";
import { cohortMaxDdiRaw, computeUnitPriority } from "./scoring-rubric";

/** Headline metrics for the Impact Sizing phase, shown in the highlights strip. */
export interface ImpactSizingKpis {
  /** Total candidate workflows captured. */
  candidates: number;
  /** Candidates that cleared the readiness check (≥ pass threshold). */
  screened: number;
  /** Candidates still below the readiness threshold. */
  notReady: number;
  /** Highest Priority across screened candidates; 0 when none qualify. */
  topPriority: number;
}

/** Number of "yes" answers on a candidate's readiness check. */
function screenScore(candidate: Candidate): number {
  return screenCriteria.reduce((sum, cr) => sum + (candidate.screen[cr.id].yes ? 1 : 0), 0);
}

/**
 * Derive the Impact Sizing highlights from the candidate list. Top priority is
 * computed only over screened candidates, normalized against their own cohort —
 * matching how the Scoring screen ranks them.
 */
export function impactSizingKpis(candidates: ReadonlyArray<Candidate>): ImpactSizingKpis {
  const screened = candidates.filter((c) => screenScore(c) >= SCREEN_PASS_THRESHOLD);

  const maxDdiRaw = cohortMaxDdiRaw(screened);
  const topPriority = screened.reduce((max, c) => {
    const priority = computeUnitPriority(c, maxDdiRaw);
    return priority > max ? priority : max;
  }, 0);

  return {
    candidates: candidates.length,
    screened: screened.length,
    notReady: candidates.length - screened.length,
    topPriority,
  };
}

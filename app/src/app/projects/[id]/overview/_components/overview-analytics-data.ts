import type { Candidate, Project } from "@/content/sample-data";
import type { RiskLevel } from "@/content/scoring-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";

/** Counts at each roadmap funnel stage (proposal §5.9). */
export interface FunnelCounts {
  candidates: number;
  screened: number;
  design: number;
  mvp: number;
  production: number;
}

/** Per-business-function screened/failed split for the stacked bar. */
export interface FunctionStatusRow {
  fn: string;
  passed: number;
  failed: number;
}

/** A single candidate plotted on the impact/effort scatter (both 0–100). */
export interface ImpactEffortPoint {
  name: string;
  impact: number;
  effort: number;
}

export interface OverviewAnalytics {
  funnel: FunnelCounts;
  byFunction: FunctionStatusRow[];
  scatter: ImpactEffortPoint[];
}

function screenScore(c: Candidate): number {
  return screenCriteria.reduce((sum, cr) => sum + (c.screen[cr.id].yes ? 1 : 0), 0);
}

const RISK_WEIGHT: Record<RiskLevel, number> = { L: 1, M: 2, H: 3 };

/** Mean value-model score (0–4 scale) scaled to 0–100. */
function impactScore(c: Candidate): number {
  const vm = c.vm;
  const mean = (vm.costSavings + vm.qualityImprovement + vm.speedImprovement + vm.strategicAlignment) / 4;
  return Math.round((mean / 4) * 100);
}

/** Mean risk severity (L/M/H → 1/2/3) scaled to 0–100 as an effort proxy. */
function effortScore(c: Candidate): number {
  const r = c.risk;
  const mean =
    (RISK_WEIGHT[r.implementation] + RISK_WEIGHT[r.adoption] + RISK_WEIGHT[r.compliance] + RISK_WEIGHT[r.dependency]) /
    4;
  return Math.round(((mean - 1) / 2) * 100);
}

/**
 * Derive the three overview charts from a project's candidates and workflows.
 * Pure and deterministic so it can be unit-tested without rendering.
 */
export function overviewAnalytics(
  project: Pick<Project, "candidates" | "workflows">,
  unassignedLabel: string,
): OverviewAnalytics {
  const { candidates, workflows } = project;
  const screened = candidates.filter((c) => screenScore(c) >= SCREEN_PASS_THRESHOLD);

  const funnel: FunnelCounts = {
    candidates: candidates.length,
    screened: screened.length,
    design: workflows.length,
    mvp: workflows.filter((w) => w.status === "built" || w.status === "live").length,
    production: workflows.filter((w) => w.status === "live").length,
  };

  const byFnMap = new Map<string, FunctionStatusRow>();
  for (const c of candidates) {
    const fn = c.businessFunction?.trim() || unassignedLabel;
    const row = byFnMap.get(fn) ?? { fn, passed: 0, failed: 0 };
    if (screenScore(c) >= SCREEN_PASS_THRESHOLD) row.passed += 1;
    else row.failed += 1;
    byFnMap.set(fn, row);
  }
  const byFunction = Array.from(byFnMap.values()).sort((a, b) => a.fn.localeCompare(b.fn));

  const scatter = screened.map((c) => ({
    name: c.name,
    impact: impactScore(c),
    effort: effortScore(c),
  }));

  return { funnel, byFunction, scatter };
}

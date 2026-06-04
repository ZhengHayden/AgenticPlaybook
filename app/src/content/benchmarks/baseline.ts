/**
 * The shipped, read-only baseline benchmark — a North-America-indexed reference
 * point for labor rate (per-FTE unit salaries, Function × Job-Grade) and
 * automation potential (per-function work-content detail). Region-specific
 * defaults in `index.ts` derive from this by scaling labor with a regional cost
 * index; automation is treated as region-invariant.
 *
 * These are plain constants seeded from typical consulting reference values —
 * never mutated at runtime. A company tunes them by saving its own versions.
 */

import type { FunctionMeta, LaborRateRow } from "@/lib/scan/types";
import { toFunctionKey } from "@/lib/scan/normalize";
import type { BenchmarkSnapshot } from "@/lib/benchmark/types";

/** Job grades shared across functions, lowest → highest. */
const GRADES = ["L1", "L2", "L3", "L4", "L5"] as const;

/** Base annual unit salary (USD/FTE) per grade at the NA baseline. */
const BASE_SALARY_BY_GRADE: Record<(typeof GRADES)[number], number> = {
  L1: 42_000,
  L2: 62_000,
  L3: 88_000,
  L4: 124_000,
  L5: 176_000,
};

/** Function display label → relative salary multiplier vs. the per-grade base. */
const FUNCTIONS: { label: string; salaryMultiplier: number }[] = [
  { label: "R&D", salaryMultiplier: 1.3 },
  { label: "Finance", salaryMultiplier: 1.1 },
  { label: "HR", salaryMultiplier: 0.9 },
  { label: "Operations", salaryMultiplier: 0.85 },
  { label: "Sales & Marketing", salaryMultiplier: 1.0 },
  { label: "Customer Service", salaryMultiplier: 0.75 },
];

/** Three generic work-content categories shared by every baseline function. */
const CATEGORIES = [
  { key: "A", name: "Routine / transactional" },
  { key: "B", name: "Analytical / judgment" },
  { key: "C", name: "Strategic / relational" },
];

/**
 * Per-grade automation profile: how routine-heavy the role is and how much
 * capacity automation frees. Junior grades are more automatable.
 */
const AUTOMATION_BY_GRADE: Record<
  (typeof GRADES)[number],
  { current: [number, number, number]; target: [number, number, number]; automationRatio: number; releasedRatio: number }
> = {
  L1: { current: [70, 20, 10], target: [35, 45, 20], automationRatio: 0.55, releasedRatio: 0.4 },
  L2: { current: [60, 28, 12], target: [30, 48, 22], automationRatio: 0.48, releasedRatio: 0.34 },
  L3: { current: [45, 38, 17], target: [22, 50, 28], automationRatio: 0.38, releasedRatio: 0.26 },
  L4: { current: [30, 45, 25], target: [15, 50, 35], automationRatio: 0.27, releasedRatio: 0.18 },
  L5: { current: [18, 47, 35], target: [10, 48, 42], automationRatio: 0.16, releasedRatio: 0.1 },
};

/** Build the labor rows (Function × Grade unit salaries) for the baseline. */
function buildBaselineLabor(): LaborRateRow[] {
  const rows: LaborRateRow[] = [];
  for (const fn of FUNCTIONS) {
    for (const grade of GRADES) {
      rows.push({
        functionKey: toFunctionKey(fn.label),
        functionLabel: fn.label,
        levelCode: grade,
        salaryUsd: Math.round(BASE_SALARY_BY_GRADE[grade] * fn.salaryMultiplier),
      });
    }
  }
  return rows;
}

/** Build the per-function automation detail for the baseline. */
function buildBaselineAutomation(): Record<string, FunctionMeta> {
  const automation: Record<string, FunctionMeta> = {};
  for (const fn of FUNCTIONS) {
    const key = toFunctionKey(fn.label);
    automation[key] = {
      functionKey: key,
      functionLabel: fn.label,
      categories: CATEGORIES.map((c) => ({ ...c })),
      levels: GRADES.map((grade) => {
        const p = AUTOMATION_BY_GRADE[grade];
        return {
          levelCode: grade,
          levelLabel: grade,
          currentBreakdown: [...p.current],
          targetBreakdown: [...p.target],
          automationRatio: p.automationRatio,
          releasedRatio: p.releasedRatio,
        };
      }),
    };
  }
  return automation;
}

/** The shipped NA-indexed baseline snapshot (final fallback for any region×sector). */
export const BASELINE_BENCHMARK: BenchmarkSnapshot = {
  labor: buildBaselineLabor(),
  automation: buildBaselineAutomation(),
};

/** Scale a snapshot's labor by a regional cost index; automation is unchanged. */
export function scaleLabor(snapshot: BenchmarkSnapshot, costIndex: number): BenchmarkSnapshot {
  return {
    automation: snapshot.automation,
    labor: snapshot.labor.map((row) => ({ ...row, salaryUsd: Math.round(row.salaryUsd * costIndex) })),
  };
}

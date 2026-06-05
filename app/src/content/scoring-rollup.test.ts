import { describe, it, expect } from "vitest";
import {
  cohortMaxDdiRaw,
  computeUnitPriority,
  rollupWorkflow,
  PRIORITY_FLOOR,
  type ScorableUnit,
} from "./scoring-rubric";

const unit = (vmLevel: 1 | 2 | 3 | 4 | 5, judgment: number): ScorableUnit => ({
  vm: {
    costSavings: vmLevel,
    qualityImprovement: vmLevel,
    speedImprovement: vmLevel,
    strategicAlignment: vmLevel,
  },
  ddi: { binary: 0, multi: 0, judgment },
  totalSteps: 10,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
});

describe("cohortMaxDdiRaw", () => {
  it("stays positive even when every unit has zero DDI (no divide-by-zero)", () => {
    expect(cohortMaxDdiRaw([unit(3, 0)])).toBeGreaterThan(0);
  });
  it("returns the largest raw DDI across the cohort", () => {
    // judgment weight is 3, totalSteps 10 → 5 judgment decisions = 15/10 = 1.5
    expect(cohortMaxDdiRaw([unit(3, 1), unit(3, 5)])).toBeCloseTo((5 * 3) / 10, 5);
  });
});

describe("computeUnitPriority", () => {
  it("rises with value magnitude", () => {
    const max = cohortMaxDdiRaw([unit(5, 2), unit(1, 2)]);
    expect(computeUnitPriority(unit(5, 2), max)).toBeGreaterThan(
      computeUnitPriority(unit(1, 2), max),
    );
  });
  it("yields a finite score when the cohort has no DDI", () => {
    const p = computeUnitPriority(unit(4, 0), cohortMaxDdiRaw([unit(4, 0)]));
    expect(Number.isFinite(p)).toBe(true);
  });
});

describe("rollupWorkflow", () => {
  it("takes the max priority and counts those at/above the floor", () => {
    const r = rollupWorkflow([2.0, 4.5, 3.0]);
    expect(r.priority).toBe(4.5);
    expect(r.total).toBe(3);
    expect(r.aboveFloor).toBe(2); // 4.5 and 3.0 (>= PRIORITY_FLOOR)
  });
  it("is zero/empty when there are no scored use cases", () => {
    expect(rollupWorkflow([])).toEqual({ priority: 0, total: 0, aboveFloor: 0 });
  });
  it("uses PRIORITY_FLOOR as the inclusive threshold", () => {
    expect(rollupWorkflow([PRIORITY_FLOOR - 0.01]).aboveFloor).toBe(0);
    expect(rollupWorkflow([PRIORITY_FLOOR]).aboveFloor).toBe(1);
  });
});

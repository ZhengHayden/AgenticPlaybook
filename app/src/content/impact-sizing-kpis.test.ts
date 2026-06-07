import { describe, it, expect } from "vitest";
import { makeBlankCandidate } from "./candidate-factory";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "./binary-screen";
import { impactSizingKpis } from "./impact-sizing-kpis";
import type { Candidate } from "./sample-data";

/** A candidate whose first `passCount` screen criteria are answered "yes". */
function withScreen(name: string, passCount: number): Candidate {
  const base = makeBlankCandidate({
    name,
    description: "",
    sourceSystem: "",
    volumePerMonth: 0,
    pain: "med",
  });
  const screen = { ...base.screen };
  screenCriteria.forEach((cr, i) => {
    screen[cr.id] = { yes: i < passCount };
  });
  return { ...base, screen };
}

describe("impactSizingKpis", () => {
  it("returns all zeros for an empty candidate list", () => {
    const kpis = impactSizingKpis([]);
    expect(kpis).toEqual({ candidates: 0, screened: 0, notReady: 0, topPriority: 0 });
  });

  it("counts screened candidates as those at or above the pass threshold", () => {
    const candidates = [
      withScreen("passes", SCREEN_PASS_THRESHOLD), // exactly at threshold → screened
      withScreen("also passes", SCREEN_PASS_THRESHOLD + 1),
      withScreen("fails", SCREEN_PASS_THRESHOLD - 1), // below → not ready
    ];

    const kpis = impactSizingKpis(candidates);

    expect(kpis.candidates).toBe(3);
    expect(kpis.screened).toBe(2);
    expect(kpis.notReady).toBe(1);
  });

  it("reports a positive top priority once a screened candidate has scores", () => {
    const screened = withScreen("scored", SCREEN_PASS_THRESHOLD);
    const candidate: Candidate = {
      ...screened,
      vm: { costSavings: 5, qualityImprovement: 5, speedImprovement: 5, strategicAlignment: 5 },
      ddi: { binary: 6, multi: 0, judgment: 0 },
      totalSteps: 6,
      risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
    };

    const kpis = impactSizingKpis([candidate]);

    expect(kpis.topPriority).toBeGreaterThan(0);
  });

  it("ignores candidates that have not passed the readiness check for top priority", () => {
    // A high-scoring but unscreened candidate must not contribute to topPriority.
    const unscreened = withScreen("not ready", SCREEN_PASS_THRESHOLD - 1);
    const candidate: Candidate = {
      ...unscreened,
      vm: { costSavings: 5, qualityImprovement: 5, speedImprovement: 5, strategicAlignment: 5 },
    };

    expect(impactSizingKpis([candidate]).topPriority).toBe(0);
  });
});

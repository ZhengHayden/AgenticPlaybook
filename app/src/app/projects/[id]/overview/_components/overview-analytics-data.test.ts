import { describe, it, expect } from "vitest";
import type { Candidate, Project } from "@/content/sample-data";
import { overviewAnalytics } from "./overview-analytics-data";

const passScreen = {
  documentability: { yes: true },
  dataAccessibility: { yes: true },
  executionVolume: { yes: true },
  processOwner: { yes: true },
  outputQuality: { yes: true },
  processStability: { yes: true },
};
const failScreen = { ...passScreen, documentability: { yes: false }, dataAccessibility: { yes: false } };

function candidate(id: string, businessFunction: string | undefined, pass: boolean): Candidate {
  return {
    id,
    name: id,
    description: "",
    sourceSystem: "SAP",
    volumePerMonth: 100,
    pain: "high",
    screen: (pass ? passScreen : failScreen) as Candidate["screen"],
    ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 2, groundTruth: 2 },
    ors: { sponsorAuthority: 2, teamReceptivity: 2, integrationComplexity: 2, changeHistory: 2 },
    rationale: { ods: {}, ors: {} },
    vm: { costSavings: 4, qualityImprovement: 4, speedImprovement: 4, strategicAlignment: 4 },
    ddi: { binary: 1, multi: 1, judgment: 1 },
    totalSteps: 10,
    risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
    recommendation: "",
    ...(businessFunction ? { businessFunction } : {}),
  };
}

const project = {
  candidates: [
    candidate("a", "Finance", true),
    candidate("b", "Finance", false),
    candidate("c", undefined, true),
  ],
  workflows: [
    { status: "inDesign" },
    { status: "live" },
  ] as Project["workflows"],
} as Pick<Project, "candidates" | "workflows">;

describe("overviewAnalytics", () => {
  it("derives funnel counts from candidates and workflows", () => {
    const { funnel } = overviewAnalytics(project, "Unassigned");
    expect(funnel.candidates).toBe(3);
    expect(funnel.screened).toBe(2);
    expect(funnel.design).toBe(2);
    expect(funnel.mvp).toBe(1); // only the live workflow
    expect(funnel.production).toBe(1);
  });

  it("groups candidates by function with a passed/failed split and an unassigned bucket", () => {
    const { byFunction } = overviewAnalytics(project, "Unassigned");
    const finance = byFunction.find((r) => r.fn === "Finance");
    const unassigned = byFunction.find((r) => r.fn === "Unassigned");
    expect(finance).toEqual({ fn: "Finance", passed: 1, failed: 1 });
    expect(unassigned).toEqual({ fn: "Unassigned", passed: 1, failed: 0 });
  });

  it("plots only screened candidates with 0–100 impact/effort", () => {
    const { scatter } = overviewAnalytics(project, "Unassigned");
    expect(scatter).toHaveLength(2);
    expect(scatter[0].impact).toBe(100); // vm all 4 → 100
    expect(scatter[0].effort).toBe(0); // risk all L → 0
  });
});

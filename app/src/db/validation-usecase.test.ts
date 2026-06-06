import { describe, it, expect } from "vitest";
import { projectPatchSchema } from "./validation";

const baseCandidate = {
  id: "c1",
  name: "Inv",
  description: "",
  sourceSystem: "SAP",
  volumePerMonth: 100,
  pain: "high",
  screen: {
    documentability: { yes: true },
    dataAccessibility: { yes: true },
    executionVolume: { yes: true },
    processOwner: { yes: true },
    outputQuality: { yes: true },
    processStability: { yes: true },
  },
  ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 2, groundTruth: 2 },
  ors: { sponsorAuthority: 2, teamReceptivity: 2, integrationComplexity: 2, changeHistory: 2 },
  rationale: { ods: {}, ors: {} },
  vm: { costSavings: 3, qualityImprovement: 3, speedImprovement: 3, strategicAlignment: 3 },
  ddi: { binary: 1, multi: 1, judgment: 1 },
  totalSteps: 10,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
  recommendation: "",
};

describe("project use-case validation", () => {
  it("accepts scoringMode and nested useCase ideas", () => {
    const parsed = projectPatchSchema.safeParse({
      scoringMode: "useCase",
      candidates: [
        {
          ...baseCandidate,
          useCases: [
            { id: "u1", candidateId: "c1", name: "Auto-match", description: "d", impactRationale: "r" },
          ],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a fully-scored use case", () => {
    const parsed = projectPatchSchema.safeParse({
      candidates: [
        {
          ...baseCandidate,
          useCases: [
            {
              id: "u1",
              candidateId: "c1",
              name: "X",
              description: "d",
              impactRationale: "r",
              vm: baseCandidate.vm,
              ddi: baseCandidate.ddi,
              totalSteps: 10,
              risk: baseCandidate.risk,
            },
          ],
        },
      ],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a workflow with a useCaseId back-reference", () => {
    const parsed = projectPatchSchema.safeParse({
      workflows: [{ id: "w1", name: "W", candidateId: "c1", useCaseId: "u1", steps: [] }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid scoringMode", () => {
    expect(projectPatchSchema.safeParse({ scoringMode: "nope" }).success).toBe(false);
  });

  it("rejects a use case missing required fields", () => {
    const parsed = projectPatchSchema.safeParse({
      candidates: [{ ...baseCandidate, useCases: [{ id: "u1", candidateId: "c1", name: "X" }] }],
    });
    expect(parsed.success).toBe(false);
  });
});

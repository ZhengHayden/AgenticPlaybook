import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import type { Candidate, ProjectUseCase } from "@/content/sample-data";
import { ScoringEditor } from "./scoring-editor";

// The editor persists via useProjectSave → useRouter; stub the router.
vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: () => {}, push: () => {} }),
}));

const wrap = (ui: ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

const passAll = {
  documentability: { yes: true },
  dataAccessibility: { yes: true },
  executionVolume: { yes: true },
  processOwner: { yes: true },
  outputQuality: { yes: true },
  processStability: { yes: true },
};

const candidate = (id: string, useCases?: ProjectUseCase[]): Candidate => ({
  id,
  name: `WF ${id}`,
  description: "",
  sourceSystem: "SAP",
  volumePerMonth: 100,
  pain: "high",
  screen: passAll as Candidate["screen"],
  ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 2, groundTruth: 2 },
  ors: { sponsorAuthority: 2, teamReceptivity: 2, integrationComplexity: 2, changeHistory: 2 },
  rationale: { ods: {}, ors: {} },
  vm: { costSavings: 3, qualityImprovement: 3, speedImprovement: 3, strategicAlignment: 3 },
  ddi: { binary: 1, multi: 1, judgment: 1 },
  totalSteps: 10,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
  recommendation: "",
  ...(useCases ? { useCases } : {}),
});

const scoredUseCase = (id: string, candidateId: string): ProjectUseCase => ({
  id,
  candidateId,
  name: `UC ${id}`,
  description: "d",
  impactRationale: "r",
  vm: { costSavings: 4, qualityImprovement: 4, speedImprovement: 4, strategicAlignment: 4 },
  ddi: { binary: 1, multi: 1, judgment: 2 },
  totalSteps: 8,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
});

describe("ScoringEditor — mode branching", () => {
  it("workflow mode shows the per-candidate score editor", () => {
    const c = candidate("c1");
    wrap(<ScoringEditor projectId="p" scoringMode="workflow" candidates={[c]} allCandidates={[c]} />);
    expect(screen.getByText(/Value Magnitude/i)).toBeInTheDocument();
    expect(screen.getByText(/Layer 3 · Detailed Scoring/i)).toBeInTheDocument();
  });

  it("use-case mode nudges to Readiness when a workflow has no use cases", () => {
    const c = candidate("c1", []);
    wrap(<ScoringEditor projectId="p" scoringMode="useCase" candidates={[c]} allCandidates={[c]} />);
    expect(screen.getByText(/add use-case ideas in readiness/i)).toBeInTheDocument();
  });

  it("use-case mode lists use cases and scores the active one", () => {
    const c = candidate("c1", [scoredUseCase("u1", "c1")]);
    wrap(<ScoringEditor projectId="p" scoringMode="useCase" candidates={[c]} allCandidates={[c]} />);
    // chip for the use case + the shared score editor for the active use case
    expect(screen.getByRole("button", { name: /UC u1/i })).toBeInTheDocument();
    expect(screen.getByText(/Value Magnitude/i)).toBeInTheDocument();
    // workflow rollup badge present
    expect(screen.getByText(/Top/i)).toBeInTheDocument();
  });
});

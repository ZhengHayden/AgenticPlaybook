import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import type { Candidate, ProjectUseCase } from "@/content/sample-data";
import { PortfolioView } from "./portfolio-view";

// The view persists via useProjectSave → useRouter; stub the router.
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

const candidate = (id: string, name: string, useCases?: ProjectUseCase[]): Candidate => ({
  id,
  name,
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

const uc = (
  id: string,
  candidateId: string,
  name: string,
  vmLevel: 1 | 2 | 3 | 4 | 5,
  extra: Partial<ProjectUseCase> = {},
): ProjectUseCase => ({
  id,
  candidateId,
  name,
  description: "d",
  impactRationale: "r",
  vm: {
    costSavings: vmLevel,
    qualityImprovement: vmLevel,
    speedImprovement: vmLevel,
    strategicAlignment: vmLevel,
  },
  ddi: { binary: 1, multi: 1, judgment: 2 },
  totalSteps: 8,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
  ...extra,
});

describe("PortfolioView — use-case mode", () => {
  it("ranks use cases (not workflows) by priority across the whole project", () => {
    const c1 = candidate("c1", "AP Invoicing", [uc("u-low", "c1", "Dup detection", 2)]);
    const c2 = candidate("c2", "Vendor Mgmt", [uc("u-high", "c2", "Auto-match", 5)]);
    const { container } = wrap(
      <PortfolioView projectId="p" scoringMode="useCase" candidates={[c1, c2]} />,
    );

    // Both use cases are listed (in the table and the bars chart).
    expect(screen.getAllByText("Auto-match").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Dup detection").length).toBeGreaterThan(0);
    // Parent workflow shown as context.
    expect(screen.getByText("Vendor Mgmt")).toBeInTheDocument();
    expect(screen.getByText("AP Invoicing")).toBeInTheDocument();

    // Ranked by use-case priority: the higher-VM use case comes first.
    const text = container.textContent ?? "";
    expect(text.indexOf("Auto-match")).toBeLessThan(text.indexOf("Dup detection"));
  });

  it("shows a nudge when no use cases are scored", () => {
    const c = candidate("c1", "AP Invoicing", []);
    wrap(<PortfolioView projectId="p" scoringMode="useCase" candidates={[c]} />);
    expect(screen.getByText(/no scored use cases/i)).toBeInTheDocument();
  });

  it("marks a use case Design-eligible when its disposition is Agent/RPA", () => {
    const c = candidate("c1", "AP Invoicing", [
      uc("u1", "c1", "Auto-match", 4, { solutionProposal: "agent" }),
    ]);
    wrap(<PortfolioView projectId="p" scoringMode="useCase" candidates={[c]} />);
    expect(screen.getByText(/design-eligible/i)).toBeInTheDocument();
  });

  it("still ranks workflows in workflow mode (unchanged behavior)", () => {
    const c = candidate("c1", "AP Invoicing");
    wrap(<PortfolioView projectId="p" scoringMode="workflow" candidates={[c]} />);
    // Workflow-mode header + the workflow appears (table row and/or bars).
    expect(screen.getByText(/Prioritized Workflow Portfolio/i)).toBeInTheDocument();
    expect(screen.getAllByText("AP Invoicing").length).toBeGreaterThan(0);
  });
});

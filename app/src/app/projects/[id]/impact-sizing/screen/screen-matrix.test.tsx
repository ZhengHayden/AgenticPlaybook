import { describe, it, expect, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import type { Candidate, ProjectUseCase } from "@/content/sample-data";
import { ScreenMatrix } from "./screen-matrix";

// Persists via useProjectSave → useRouter; stub the router.
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

const candidate = (
  id: string,
  name: string,
  businessFunction?: string,
  useCases?: ProjectUseCase[],
): Candidate => ({
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
  ...(businessFunction ? { businessFunction } : {}),
  ...(useCases ? { useCases } : {}),
});

const idea = (id: string, candidateId: string, name: string): ProjectUseCase => ({
  id,
  candidateId,
  name,
  description: "",
  impactRationale: "",
});

describe("ScreenMatrix", () => {
  it("shows a Business function column with the candidate's value", () => {
    wrap(<ScreenMatrix projectId="p" candidates={[candidate("c1", "AP Invoicing", "Accounts Payable")]} />);
    expect(screen.getByRole("columnheader", { name: /business function/i })).toBeInTheDocument();
    // Appears in the table cell (and as a filter option).
    expect(screen.getAllByText("Accounts Payable").length).toBeGreaterThan(0);
  });

  it("filters workflows by business function", () => {
    const c1 = candidate("c1", "AP Invoicing", "Finance");
    const c2 = candidate("c2", "Hiring Funnel", "People");
    wrap(<ScreenMatrix projectId="p" candidates={[c1, c2]} />);

    // Both visible initially.
    expect(screen.getByText("AP Invoicing")).toBeInTheDocument();
    expect(screen.getByText("Hiring Funnel")).toBeInTheDocument();

    // Filter to Finance hides the People workflow.
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "Finance" } });
    expect(screen.getByText("AP Invoicing")).toBeInTheDocument();
    expect(screen.queryByText("Hiring Funnel")).not.toBeInTheDocument();
  });

  it("shows use cases inline by default (no expand needed)", () => {
    const c = candidate("c1", "AP Invoicing", "Finance", [idea("u1", "c1", "Auto-match")]);
    wrap(<ScreenMatrix projectId="p" candidates={[c]} />);
    // The inline use-case name is editable and present without expanding the row.
    expect(screen.getByDisplayValue("Auto-match")).toBeInTheDocument();
  });

  it("offers a per-workflow Save and no global page Save", () => {
    wrap(<ScreenMatrix projectId="p" candidates={[candidate("c1", "AP Invoicing", "Finance")]} />);
    // Per-workflow save (disabled until a change is made).
    const save = screen.getByRole("button", { name: /save workflow/i });
    expect(save).toBeInTheDocument();
    expect(save).toBeDisabled();

    // Toggling a criterion enables that workflow's Save.
    fireEvent.click(screen.getAllByText("✓")[0]);
    expect(screen.getByRole("button", { name: /save workflow/i })).toBeEnabled();
  });
});

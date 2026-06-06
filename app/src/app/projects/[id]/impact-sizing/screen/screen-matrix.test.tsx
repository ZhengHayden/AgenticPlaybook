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

  it("shows use cases inline by default as read-only text", () => {
    const c = candidate("c1", "AP Invoicing", "Finance", [idea("u1", "c1", "Auto-match")]);
    wrap(<ScreenMatrix projectId="p" candidates={[c]} />);
    // Visible without expanding, but read-only: name is text, not an input, and there is no add button.
    expect(screen.getByText("Auto-match")).toBeInTheDocument();
    expect(screen.queryByDisplayValue("Auto-match")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /add use case/i })).not.toBeInTheDocument();
  });

  it("is display-only by default and a pen icon enters inline edit mode", () => {
    wrap(<ScreenMatrix projectId="p" candidates={[candidate("c1", "AP Invoicing", "Finance")]} />);
    // Display: an Edit affordance, no Save/Cancel yet.
    const edit = screen.getByRole("button", { name: /edit workflow/i });
    expect(edit).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /save workflow/i })).not.toBeInTheDocument();

    // Enter edit mode: Save + Cancel appear.
    fireEvent.click(edit);
    expect(screen.getByRole("button", { name: /save workflow/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();
  });

  it("makes use cases editable only after entering edit mode", () => {
    const c = candidate("c1", "AP Invoicing", "Finance", [idea("u1", "c1", "Auto-match")]);
    wrap(<ScreenMatrix projectId="p" candidates={[c]} />);
    // Read-only first.
    expect(screen.queryByRole("button", { name: /add use case/i })).not.toBeInTheDocument();
    // Enter edit mode → the use-case name becomes an input and an add button appears.
    fireEvent.click(screen.getByRole("button", { name: /edit workflow/i }));
    expect(screen.getByRole("button", { name: /add use case/i })).toBeInTheDocument();
    expect(screen.getByDisplayValue("Auto-match")).toBeInTheDocument();
  });
});

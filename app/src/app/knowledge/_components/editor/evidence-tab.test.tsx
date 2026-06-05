import { describe, it, expect, vi, beforeAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { EvidenceTab } from "./evidence-tab";
import type { KnowledgeUseCase } from "@/content/knowledge";

beforeAll(() => {
  // jsdom may launch with --localstorage-file which stubs out getItem/setItem.
  // Provide a minimal in-memory implementation so LocaleProvider can boot.
  if (typeof window !== "undefined" && typeof window.localStorage.getItem !== "function") {
    const store: Record<string, string> = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (k: string) => store[k] ?? null,
        setItem: (k: string, v: string) => { store[k] = v; },
        removeItem: (k: string) => { delete store[k]; },
        clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
      },
      writable: true,
    });
  }
});

const useCase = {
  id: "uc-1", workflowId: "wf-1", sectorId: "s", industryId: "i", companyId: "c", functionId: "f",
  name: "X", domain: "D", description: "", kpis: [], techTag: "GenAI", maturity: "pilot",
  businessObjectives: [], archetypes: [], references: [{ name: "Comp A", detail: "did X" }],
  validation: { status: "partial", note: "some evidence" },
} as KnowledgeUseCase;

describe("EvidenceTab", () => {
  it("renders both validation status and references in one tab", () => {
    render(
      <LocaleProvider>
        <EvidenceTab useCase={useCase} onPatch={vi.fn()} onSetValidation={vi.fn()} />
      </LocaleProvider>,
    );
    expect(screen.getByDisplayValue("some evidence")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Comp A")).toBeInTheDocument();
  });
});

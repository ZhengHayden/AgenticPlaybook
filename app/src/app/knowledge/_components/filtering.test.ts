import { describe, it, expect } from "vitest";
import { applyFilters, EMPTY_FILTERS } from "./filtering";
import type { KnowledgeUseCase } from "@/content/knowledge";

const base = (id: string): KnowledgeUseCase => ({
  id, workflowId: "w", sectorId: "s", industryId: "i", companyId: "c", functionId: "f",
  name: id, domain: "", description: "", kpis: [], techTag: "GenAI", maturity: "pilot",
  businessObjectives: [], archetypes: [], references: [], validation: { status: "notYet", note: "" },
});

describe("hasArtifacts filter", () => {
  it("keeps only use cases whose id is in the artifact set when enabled", () => {
    const cases = [base("uc-1"), base("uc-2")];
    const out = applyFilters(cases, { ...EMPTY_FILTERS, hasArtifacts: true }, new Set(["uc-1"]));
    expect(out.map((c) => c.id)).toEqual(["uc-1"]);
  });

  it("ignores the artifact set when the filter is off", () => {
    const cases = [base("uc-1"), base("uc-2")];
    const out = applyFilters(cases, EMPTY_FILTERS, new Set(["uc-1"]));
    expect(out).toHaveLength(2);
  });
});

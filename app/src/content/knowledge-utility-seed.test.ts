import { describe, expect, it } from "vitest";
import { utilityBranch } from "./knowledge-utility-seed";
import { knowledgeSeed } from "./knowledge-seed";
import { MATURITIES, TECH_TAGS } from "./knowledge";
import { archetypes } from "./archetypes";
import { interactionModes } from "./interactions";
import { a2aPatterns } from "./a2a-patterns";

const SECTOR_ID = "energy-utilities";

const archetypeIds = new Set(archetypes.map((a) => a.id));
const interactionIds = new Set(interactionModes.map((m) => m.id));
const a2aIds = new Set(a2aPatterns.map((p) => p.id));
const workflowIds = new Set(utilityBranch.workflows.map((w) => w.id));

describe("utility knowledge branch", () => {
  it("ports all 23 benchmark use cases", () => {
    expect(utilityBranch.useCaseSeeds).toHaveLength(23);
  });

  it("has a single self-contained Energy & Utilities branch", () => {
    expect(utilityBranch.sectors).toHaveLength(1);
    expect(utilityBranch.sectors[0].id).toBe(SECTOR_ID);
    expect(utilityBranch.functions).toHaveLength(5);
    expect(utilityBranch.workflows).toHaveLength(9);
  });

  it("gives every use case a unique id", () => {
    const ids = utilityBranch.useCaseSeeds.map((uc) => uc.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("points every use case at a workflow in this branch", () => {
    for (const uc of utilityBranch.useCaseSeeds) {
      expect(workflowIds.has(uc.workflowId)).toBe(true);
    }
  });

  it("uses only valid taxonomy + design tag ids", () => {
    for (const uc of utilityBranch.useCaseSeeds) {
      expect(TECH_TAGS).toContain(uc.techTag);
      expect(MATURITIES).toContain(uc.maturity);
      for (const a of uc.archetypes) expect(archetypeIds.has(a)).toBe(true);
      if (uc.interactionMode) expect(interactionIds.has(uc.interactionMode)).toBe(true);
      if (uc.a2aPattern) expect(a2aIds.has(uc.a2aPattern)).toBe(true);
      expect(uc.kpis.length).toBeGreaterThan(0);
      expect(uc.references.length).toBeGreaterThan(0);
    }
  });
});

describe("assembled knowledgeSeed", () => {
  it("merges the utility branch with resolved parent ids", () => {
    const utilityUseCases = knowledgeSeed.useCases.filter((uc) => uc.sectorId === SECTOR_ID);
    expect(utilityUseCases).toHaveLength(23);
    for (const uc of utilityUseCases) {
      expect(uc.industryId).toBe("eu-power");
      expect(uc.companyId).toBe("ref-utility");
      expect(uc.functionId).not.toBe("");
    }
  });

  it("keeps all use case ids unique across the full library", () => {
    const ids = knowledgeSeed.useCases.map((uc) => uc.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

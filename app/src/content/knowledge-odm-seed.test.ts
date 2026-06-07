import { describe, expect, it } from "vitest";
import { odmBranch } from "./knowledge-odm-seed";
import { MATURITIES, TECH_TAGS } from "./knowledge";
import { archetypes } from "./archetypes";
import { interactionModes } from "./interactions";
import { a2aPatterns } from "./a2a-patterns";

const archetypeIds = new Set(archetypes.map((a) => a.id));
const interactionIds = new Set(interactionModes.map((m) => m.id));
const a2aIds = new Set(a2aPatterns.map((p) => p.id));
const workflowIds = new Set(odmBranch.workflows.map((w) => w.id));
const functionIds = new Set(odmBranch.functions.map((f) => f.id));

describe("ODM knowledge branch", () => {
  it("declares the tmt-odm industry under the existing TMT sector and no new sector", () => {
    expect(odmBranch.sectors).toEqual([]);

    expect(odmBranch.industries).toHaveLength(1);
    expect(odmBranch.industries[0]).toMatchObject({ id: "tmt-odm", sectorId: "tmt" });

    expect(odmBranch.companies).toEqual([
      expect.objectContaining({ id: "apex-odm", industryId: "tmt-odm" }),
    ]);
  });

  it("has 5 functions and 5 workflows all parented to apex-odm", () => {
    expect(odmBranch.functions).toHaveLength(5);
    expect(odmBranch.workflows).toHaveLength(5);

    for (const fn of odmBranch.functions) {
      expect(fn.companyId).toBe("apex-odm");
    }

    for (const wf of odmBranch.workflows) {
      expect(functionIds.has(wf.functionId)).toBe(true);
    }
  });

  it("has exactly 10 use cases with unique odm-uc-NN ids", () => {
    expect(odmBranch.useCaseSeeds).toHaveLength(10);

    const ids = odmBranch.useCaseSeeds.map((uc) => uc.id);
    expect(new Set(ids).size).toBe(ids.length);

    for (const id of ids) {
      expect(id).toMatch(/^odm-uc-\d{2}$/);
    }
  });

  it("every use case points at a real ODM workflow and uses valid enum values", () => {
    for (const uc of odmBranch.useCaseSeeds) {
      expect(workflowIds.has(uc.workflowId)).toBe(true);
      expect(TECH_TAGS).toContain(uc.techTag);
      expect(MATURITIES).toContain(uc.maturity);

      for (const archetype of uc.archetypes) {
        expect(archetypeIds.has(archetype)).toBe(true);
      }

      if (uc.interactionMode) {
        expect(interactionIds.has(uc.interactionMode)).toBe(true);
      }

      if (uc.a2aPattern) {
        expect(a2aIds.has(uc.a2aPattern)).toBe(true);
      }

      expect(uc.kpis.length).toBeGreaterThanOrEqual(2);
      expect(uc.references.length).toBeGreaterThanOrEqual(3);
      expect(uc.businessObjectives.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("is fully sanitized (no Compal references)", () => {
    expect(JSON.stringify(odmBranch).toLowerCase()).not.toContain("compal");
  });
});

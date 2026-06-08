import { describe, it, expect } from "vitest";
import {
  portfolioStats,
  stageState,
  distinctDomains,
  filterProjects,
} from "./portfolio";

type TestProject = {
  name: string;
  client: string;
  domain: string;
  currentPhase: "impactSizing" | "design" | "mvp" | "production";
  candidates: ReadonlyArray<unknown>;
};

const projects: TestProject[] = [
  { name: "NEXT ELT", client: "Acme", domain: "Supply Chain", currentPhase: "impactSizing", candidates: [1, 2, 3] },
  { name: "ODM Transform", client: "Globex", domain: "Other", currentPhase: "design", candidates: [1] },
  { name: "NEXT-MFG-P4", client: "Initech", domain: "Manufacturing", currentPhase: "production", candidates: [] },
];

describe("portfolioStats", () => {
  it("counts projects, summed candidates, and phase membership", () => {
    const stats = portfolioStats(projects);
    expect(stats).toEqual({ projects: 3, candidates: 4, inDesign: 1, inProduction: 1 });
  });

  it("returns zeroes for an empty portfolio", () => {
    expect(portfolioStats([])).toEqual({ projects: 0, candidates: 0, inDesign: 0, inProduction: 0 });
  });
});

describe("stageState", () => {
  it("treats not-started phases as neutral", () => {
    expect(stageState("impactSizing", 0)).toBe("neutral");
  });

  it("treats in-flight progress as info", () => {
    expect(stageState("design", 31)).toBe("info");
  });

  it("treats fully complete phases as ready", () => {
    expect(stageState("design", 100)).toBe("ready");
  });

  it("always treats production as ready", () => {
    expect(stageState("production", 5)).toBe("ready");
  });
});

describe("distinctDomains", () => {
  it("returns unique sorted domains", () => {
    expect(distinctDomains(projects)).toEqual(["Manufacturing", "Other", "Supply Chain"]);
  });
});

describe("filterProjects", () => {
  it("returns all projects when filters are neutral", () => {
    expect(filterProjects(projects, { stage: "all", domain: "all", query: "" })).toHaveLength(3);
  });

  it("filters by stage", () => {
    const result = filterProjects(projects, { stage: "design", domain: "all", query: "" });
    expect(result.map((p) => p.name)).toEqual(["ODM Transform"]);
  });

  it("filters by domain", () => {
    const result = filterProjects(projects, { stage: "all", domain: "Supply Chain", query: "" });
    expect(result.map((p) => p.name)).toEqual(["NEXT ELT"]);
  });

  it("matches the query against name, client, and domain case-insensitively", () => {
    expect(filterProjects(projects, { stage: "all", domain: "all", query: "globex" })).toHaveLength(1);
    expect(filterProjects(projects, { stage: "all", domain: "all", query: "MFG" })).toHaveLength(1);
    expect(filterProjects(projects, { stage: "all", domain: "all", query: "manufacturing" })).toHaveLength(1);
  });

  it("combines filters with AND semantics", () => {
    expect(
      filterProjects(projects, { stage: "production", domain: "Other", query: "" }),
    ).toHaveLength(0);
  });
});

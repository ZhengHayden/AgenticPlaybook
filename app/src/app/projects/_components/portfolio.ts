import type { PhaseId, Project } from "@/content/sample-data";
import type { ChipState } from "@/components/ui/status-chip";

/** Aggregate counters for the portfolio KPI strip (proposal §5.2). */
export interface PortfolioStats {
  projects: number;
  candidates: number;
  inDesign: number;
  inProduction: number;
}

interface ProjectStatsInput {
  candidates: ReadonlyArray<unknown>;
  currentPhase: PhaseId;
}

export function portfolioStats(projects: ReadonlyArray<ProjectStatsInput>): PortfolioStats {
  return projects.reduce<PortfolioStats>(
    (acc, p) => ({
      projects: acc.projects + 1,
      candidates: acc.candidates + p.candidates.length,
      inDesign: acc.inDesign + (p.currentPhase === "design" ? 1 : 0),
      inProduction: acc.inProduction + (p.currentPhase === "production" ? 1 : 0),
    }),
    { projects: 0, candidates: 0, inDesign: 0, inProduction: 0 },
  );
}

/**
 * Semantic state for a project's leading dot. Per proposal §4.1, stage color
 * derives from *progress*, not from the phase identity: not-started is
 * neutral, anything shipped to production or fully complete is ready, and
 * work-in-flight is info. Color is never the only signal — it pairs with the
 * stage label in the table.
 */
export function stageState(currentPhase: PhaseId, pct: number): ChipState {
  if (currentPhase === "production") return "ready";
  if (pct <= 0) return "neutral";
  if (pct >= 100) return "ready";
  return "info";
}

export type StageFilter = PhaseId | "all";
export type DomainFilter = string | "all";

export interface ProjectFilter {
  stage: StageFilter;
  domain: DomainFilter;
  query: string;
}

type ProjectFilterInput = Pick<Project, "name" | "client" | "domain" | "currentPhase">;

/** Unique, sorted domains present in the portfolio — drives the Domain filter. */
export function distinctDomains(
  projects: ReadonlyArray<Pick<Project, "domain">>,
): string[] {
  return Array.from(new Set(projects.map((p) => p.domain).filter(Boolean))).sort();
}

/** Filter projects by stage, domain, and a free-text query (name/client/domain). */
export function filterProjects<T extends ProjectFilterInput>(
  projects: ReadonlyArray<T>,
  filter: ProjectFilter,
): T[] {
  const q = filter.query.trim().toLowerCase();
  return projects.filter((p) => {
    if (filter.stage !== "all" && p.currentPhase !== filter.stage) return false;
    if (filter.domain !== "all" && p.domain !== filter.domain) return false;
    if (q.length > 0) {
      const haystack = `${p.name} ${p.client} ${p.domain}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

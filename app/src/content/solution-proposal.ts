import type { Candidate, SolutionProposal } from "./sample-data";

/** Bilingual label pair, matching the inline `locale` idiom used across the UI. */
interface Bilingual {
  en: string;
  zh: string;
}

export const SOLUTION_LABELS: Record<SolutionProposal, Bilingual> = {
  rpa: { en: "RPA", zh: "RPA" },
  agent: { en: "Agent", zh: "智能体" },
  legacy: { en: "Legacy Enhancement", zh: "传统系统增强" },
  defer: { en: "Defer", zh: "暂缓" },
};

/** Static Tailwind classes per proposal (kept static so Tailwind purge keeps them). */
export const SOLUTION_BADGE: Record<SolutionProposal, string> = {
  rpa: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
  agent: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  legacy: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  defer: "bg-zinc-200 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

/** Ordered list for rendering selects. */
export const SOLUTION_OPTIONS: ReadonlyArray<SolutionProposal> = [
  "rpa",
  "agent",
  "legacy",
  "defer",
];

/**
 * A candidate becomes eligible for the Design phase only when its disposition is
 * RPA or Agent. Legacy enhancements and deferrals are explicitly out of scope.
 */
export function isDesignEligible(candidate: Pick<Candidate, "solutionProposal">): boolean {
  return candidate.solutionProposal === "rpa" || candidate.solutionProposal === "agent";
}

"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import type { Project, PhaseId } from "@/content/sample-data";
import { ProjectHeader } from "./_components/project-header";
import { WorkflowPortfolio } from "./_components/workflow-portfolio";

interface OverviewClientProps {
  project: Project;
}

const phaseOrder: PhaseId[] = ["impactSizing", "design", "mvp", "production"];

export function OverviewClient({ project }: OverviewClientProps) {
  const { t } = useLocale();

  const phaseHref = (phase: PhaseId): string | null => {
    if (phase === "impactSizing") return `/projects/${project.id}/impact-sizing/candidates`;
    if (phase === "design") return `/projects/${project.id}/design/workflow`;
    return null;
  };

  return (
    <div className="space-y-6">
      <ProjectHeader project={project} />

      <WorkflowPortfolio project={project} />

      <section>
        <h2 className="text-lg font-semibold tracking-tight">{t.project.progress}</h2>
        <div className="mt-3 space-y-2 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          {phaseOrder.map((phase, idx) => {
            const progress = Math.round(project.phaseProgress[phase] * 100);
            const isLocked = idx > 1; // V0: only first two phases unlocked
            const href = phaseHref(phase);
            return (
              <div key={phase} className="flex items-center gap-4 text-sm">
                <span className="w-6 shrink-0 text-zinc-400">{idx + 1}.</span>
                <span className="w-32 shrink-0">{t.phases[phase]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={isLocked ? "h-full bg-zinc-300 dark:bg-zinc-700" : "h-full bg-indigo-500"}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right tabular-nums text-zinc-500">{progress}%</span>
                {isLocked ? (
                  <span className="w-32 shrink-0 text-right text-xs text-zinc-400">{t.phases.deferred}</span>
                ) : href ? (
                  <Link
                    href={href}
                    className="w-32 shrink-0 text-right text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                  >
                    {t.common.continue} →
                  </Link>
                ) : (
                  <span className="w-32 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.project.team}
          </h3>
          <ul className="mt-2 space-y-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <li>Hayden — Functional Consultant</li>
            <li className="text-zinc-400">(unassigned) — Agentic Architect</li>
          </ul>
        </section>
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">
            {t.project.activity}
          </h3>
          <ul className="mt-2 space-y-1 rounded-xl border border-zinc-200 bg-white p-4 text-sm dark:border-zinc-800 dark:bg-zinc-900">
            <li>Scored AP Invoice Match — 8.21</li>
            <li>Funnel: 3 in Q1, 1 in Q2</li>
            <li>AI suggestion accepted on Step 3 archetype</li>
          </ul>
        </section>
      </div>
    </div>
  );
}

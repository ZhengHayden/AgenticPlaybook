"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import type { Project, PhaseId } from "@/content/sample-data";
import { ProjectHeader } from "./_components/project-header";
import { WorkflowPortfolio } from "./_components/workflow-portfolio";
import { TeamEditor } from "./_components/team-editor";

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
        <div className="mt-3 space-y-2 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {phaseOrder.map((phase, idx) => {
            const progress = Math.round(project.phaseProgress[phase] * 100);
            const isLocked = idx > 1; // V0: only first two phases unlocked
            const href = phaseHref(phase);
            return (
              <div key={phase} className="flex items-center gap-4 text-sm">
                <span className="w-6 shrink-0 text-slate-400">{idx + 1}.</span>
                <span className="w-32 shrink-0">{t.phases[phase]}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={isLocked ? "h-full bg-slate-300 dark:bg-slate-700" : "h-full bg-indigo-500"}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <span className="w-12 shrink-0 text-right tabular-nums text-slate-500">{progress}%</span>
                {isLocked ? (
                  <span className="w-32 shrink-0 text-right text-xs text-slate-400">{t.phases.deferred}</span>
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

      <TeamEditor project={project} />
    </div>
  );
}

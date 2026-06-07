"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { formatRelativeTime } from "@/lib/utils";
import type { PhaseId, Project } from "@/content/sample-data";
import { projectPhaseKpis } from "@/content/phase-kpis";
import { PageHeader } from "@/components/ui/page-header";
import { Plus } from "lucide-react";

interface ProjectListClientProps {
  projects: ReadonlyArray<Project>;
}

const PHASE_ORDER: ReadonlyArray<PhaseId> = ["impactSizing", "design", "mvp", "production"];

const phaseChipColor: Record<PhaseId, string> = {
  impactSizing: "border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-900/50 dark:bg-sky-950/30 dark:text-sky-300",
  design: "border-indigo-200 bg-indigo-50 text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950/30 dark:text-indigo-300",
  mvp: "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/30 dark:text-amber-300",
  production: "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300",
};

const variantLabels: Record<Project["p1Variant"], { en: string; zh: string }> = {
  A: { en: "Sequential", zh: "精确顺序" },
  B: { en: "Funnel-First", zh: "漏斗优先" },
  C: { en: "Adaptive", zh: "自适应" },
};

const designLabels: Record<Project["p2Variant"], { en: string; zh: string }> = {
  A: { en: "Taxonomy", zh: "分类法" },
  B: { en: "Decision-Tree", zh: "决策树" },
  C: { en: "Dual-Track", zh: "双轨" },
};

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const { t, locale } = useLocale();

  return (
    <section>
      <PageHeader
        title={t.nav.projects}
        subtitle={t.app.tagline}
        actions={
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded bg-brand-600 px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-brand-700"
          >
            <Plus className="h-4 w-4" /> {t.project.createNew}
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const phaseKey = project.currentPhase;
          const phaseLabel = t.phases[phaseKey];
          const progress = Math.round(project.phaseProgress[phaseKey] * 100);
          const kpis = projectPhaseKpis(project);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="card-lift group rounded-md border border-slate-200 bg-white p-5 shadow-sm transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium tracking-tight">{project.name}</h2>
                <span className="text-xs text-slate-400 group-hover:text-slate-500">→</span>
              </div>
              <div className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>{t.project.domain}</span>
                  <span className="font-medium text-slate-900 dark:text-slate-100">{project.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0">{phaseLabel}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className="h-full bg-brand-600"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums">{progress}%</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5 pt-0.5">
                  {PHASE_ORDER.map((phase) => (
                    <div
                      key={phase}
                      className={`rounded-md border px-1.5 py-1 text-center ${phaseChipColor[phase]}`}
                      title={`${t.phases[phase]}: ${kpis[phase].count} · ${kpis[phase].pct}%`}
                    >
                      <div className="truncate text-[10px] font-medium leading-tight">{t.phases[phase]}</div>
                      <div className="text-xs font-semibold tabular-nums leading-tight">
                        {kpis[phase].count}
                        <span className="ml-1 font-normal opacity-70">{kpis[phase].pct}%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between text-xs">
                  <span>
                    {t.project.variant}: {variantLabels[project.p1Variant][locale]} /{" "}
                    {designLabels[project.p2Variant][locale]}
                  </span>
                  <span className="text-slate-400">{formatRelativeTime(project.updatedAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

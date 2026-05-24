"use client";

import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { formatRelativeTime } from "@/lib/utils";
import type { Project } from "@/content/sample-data";
import { Plus } from "lucide-react";

interface ProjectListClientProps {
  projects: ReadonlyArray<Project>;
}

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
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.nav.projects}</h1>
          <p className="mt-1 text-sm text-zinc-500">{t.app.tagline}</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> {t.project.createNew}
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const phaseKey = project.currentPhase;
          const phaseLabel = t.phases[phaseKey];
          const progress = Math.round(project.phaseProgress[phaseKey] * 100);
          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}/overview`}
              className="group rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:shadow-sm dark:border-zinc-800 dark:bg-zinc-900 dark:hover:border-zinc-700"
            >
              <div className="mb-2 flex items-center justify-between">
                <h2 className="font-medium tracking-tight">{project.name}</h2>
                <span className="text-xs text-zinc-400 group-hover:text-zinc-500">→</span>
              </div>
              <div className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <div className="flex justify-between">
                  <span>{t.project.domain}</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">{project.domain}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="shrink-0">{phaseLabel}</span>
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className="h-full bg-indigo-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <span className="w-10 shrink-0 text-right text-xs tabular-nums">{progress}%</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>
                    {t.project.variant}: {variantLabels[project.p1Variant][locale]} /{" "}
                    {designLabels[project.p2Variant][locale]}
                  </span>
                  <span className="text-zinc-400">{formatRelativeTime(project.updatedAt)}</span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

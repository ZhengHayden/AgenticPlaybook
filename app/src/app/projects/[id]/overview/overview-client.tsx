"use client";

import Link from "next/link";
import { ChevronRight, Activity } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { Project, PhaseId } from "@/content/sample-data";
import { Card, SectionHeader } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ProjectHeader } from "./_components/project-header";
import { WorkflowPortfolio } from "./_components/workflow-portfolio";
import { OverviewAnalytics } from "./_components/overview-analytics";
import { TeamEditor } from "./_components/team-editor";

interface OverviewClientProps {
  project: Project;
}

const phaseOrder: PhaseId[] = ["impactSizing", "design", "mvp", "production"];

export function OverviewClient({ project }: OverviewClientProps) {
  const { t, locale } = useLocale();
  const en = locale === "en";

  const currentIndex = phaseOrder.indexOf(project.currentPhase);

  const phaseHref = (phase: PhaseId): string | null => {
    if (phase === "impactSizing") return `/projects/${project.id}/impact-sizing/candidates`;
    if (phase === "design") return `/projects/${project.id}/design/workflow`;
    return null;
  };

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Left column */}
      <div className="col-span-12 space-y-6 xl:col-span-8">
        <ProjectHeader project={project} />
        <WorkflowPortfolio project={project} />
        <OverviewAnalytics project={project} />
      </div>

      {/* Right rail */}
      <div className="col-span-12 space-y-6 xl:col-span-4">
        <Card className="p-5">
          <SectionHeader title={t.project.progress} />
          <ol className="space-y-1">
            {phaseOrder.map((phase, idx) => {
              const progress = Math.round(project.phaseProgress[phase] * 100);
              const isCurrent = idx === currentIndex;
              const isDone = idx < currentIndex || progress >= 100;
              const isLocked = idx > 1; // V0: only first two phases unlocked
              const href = phaseHref(phase);
              const statusText = isDone
                ? en
                  ? "Completed"
                  : "已完成"
                : isCurrent
                  ? `${en ? "In progress" : "进行中"} · ${progress}%`
                  : en
                    ? "Locked"
                    : "未解锁";
              return (
                <li
                  key={phase}
                  className={`relative border-l-2 py-2.5 pl-4 ${isCurrent ? "border-primary" : "border-border"}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium">{t.phases[phase]}</span>
                    {isCurrent && !isLocked && href && (
                      <Link
                        href={href}
                        className="inline-flex items-center text-xs font-medium text-primary hover:text-primary-deep"
                      >
                        {t.common.continue} <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </div>
                  <div className="mt-0.5 text-xs text-ink-faint">{statusText}</div>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card className="p-5">
          <SectionHeader title={en ? "Recent activity" : "近期动态"} />
          <EmptyState
            icon={<Activity className="h-4 w-4" />}
            title={en ? "No recent activity yet." : "暂无近期动态。"}
            className="border-0 bg-transparent py-6 dark:bg-transparent"
          />
        </Card>

        <TeamEditor project={project} />
      </div>
    </div>
  );
}

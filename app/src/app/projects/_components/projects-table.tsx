"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { formatRelativeTime } from "@/lib/utils";
import type { PhaseId, Project, TeamMember } from "@/content/sample-data";
import type { ChipState } from "@/components/ui/status-chip";
import { Pill } from "@/components/ui/pill";
import { MiniPipeline } from "@/components/ui/mini-pipeline";
import { stageState } from "./portfolio";

const PHASE_ORDER: ReadonlyArray<PhaseId> = ["impactSizing", "design", "mvp", "production"];

/** Two-letter initials from a member name, for the owner avatar stack. */
function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function OwnerAvatars({ team }: { team: ReadonlyArray<TeamMember> }) {
  const shown = team.slice(0, 3);
  const extra = team.length - shown.length;
  return (
    <div className="flex items-center -space-x-1.5">
      {shown.map((m, i) => (
        <span
          key={i}
          title={`${m.name} · ${m.role}`}
          className="grid h-6 w-6 place-items-center rounded-full bg-gradient-to-br from-primary to-accent-violet text-[10px] font-semibold text-white ring-2 ring-surface"
        >
          {initials(m.name)}
        </span>
      ))}
      {extra > 0 && (
        <span className="grid h-6 w-6 place-items-center rounded-full bg-surface-muted text-[10px] font-semibold text-ink-muted ring-2 ring-surface">
          +{extra}
        </span>
      )}
    </div>
  );
}

interface ProjectsTableProps {
  projects: ReadonlyArray<Project>;
}

/** Solid dot color per semantic state — the at-a-glance attention signal. */
const DOT_CLASS: Record<ChipState, string> = {
  ready: "bg-state-ready",
  warn: "bg-state-warn",
  block: "bg-state-block",
  info: "bg-state-info",
  neutral: "bg-state-neutral",
};

const DOT_TITLE: Record<ChipState, { en: string; zh: string }> = {
  ready: { en: "Complete", zh: "已完成" },
  warn: { en: "Needs attention", zh: "需关注" },
  block: { en: "Blocked", zh: "受阻" },
  info: { en: "In progress", zh: "进行中" },
  neutral: { en: "Not started", zh: "未开始" },
};

export function ProjectsTable({ projects }: ProjectsTableProps) {
  const { t, locale } = useLocale();
  const en = locale === "en";
  const router = useRouter();

  return (
    <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full min-w-[720px] text-sm">
        <caption className="sr-only">
          {en
            ? "Project portfolio: stage, domain, and progress per project."
            : "项目组合:每个项目的阶段、领域与进度。"}
        </caption>
        <thead className="border-b border-slate-200 bg-slate-50 text-left text-[11px] uppercase tracking-[0.04em] text-ink-faint dark:border-slate-800 dark:bg-slate-950 dark:text-slate-500">
          <tr>
            <th scope="col" className="w-6 py-2 pl-4 pr-0">
              <span className="sr-only">{en ? "State" : "状态"}</span>
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              {t.portfolio.statProjects}
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              {t.project.domain}
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              {t.portfolio.stage}
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              {t.portfolio.progress}
            </th>
            <th scope="col" className="px-3 py-2 font-semibold">
              {t.portfolio.owners}
            </th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">
              {t.portfolio.updated}
            </th>
            <th scope="col" className="w-8 py-2 pl-0 pr-4">
              <span className="sr-only">{en ? "Open" : "打开"}</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {projects.map((project) => {
            const phase = project.currentPhase;
            const pct = Math.round((project.phaseProgress[phase] ?? 0) * 100);
            const state = stageState(phase, pct);
            const href = `/projects/${project.id}/overview`;
            return (
              <tr
                key={project.id}
                onClick={() => router.push(href)}
                className="group cursor-pointer transition-colors hover:bg-subtle dark:hover:bg-slate-800/40"
              >
                <td className="py-3 pl-4 pr-0 align-middle">
                  <span
                    className={`block h-2 w-2 rounded-full ${DOT_CLASS[state]}`}
                    title={DOT_TITLE[state][locale]}
                    aria-label={DOT_TITLE[state][locale]}
                  />
                </td>
                <td className="px-3 py-3 align-middle">
                  <Link
                    href={href}
                    onClick={(e) => e.stopPropagation()}
                    className="font-medium text-slate-900 hover:text-brand-700 focus:outline-none focus-visible:underline dark:text-slate-100 dark:hover:text-brand-300"
                  >
                    {project.name}
                  </Link>
                  <div className="text-xs text-ink-faint dark:text-slate-500">{project.client}</div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <Pill tone="info">{project.domain}</Pill>
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-xs text-ink-muted">{t.phases[phase as PhaseId]}</span>
                    <MiniPipeline
                      stage={PHASE_ORDER.indexOf(phase)}
                      total={PHASE_ORDER.length}
                      label={t.phases[phase as PhaseId]}
                    />
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  <div className="flex items-center gap-2">
                    <ProgressBar pct={pct} />
                    <span className="w-9 shrink-0 text-right text-xs tabular-nums text-ink-muted dark:text-slate-400">
                      {pct}%
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 align-middle">
                  {project.team && project.team.length > 0 ? (
                    <OwnerAvatars team={project.team} />
                  ) : (
                    <span className="text-xs text-ink-faint">—</span>
                  )}
                </td>
                <td className="px-3 py-3 text-right align-middle text-xs tabular-nums text-ink-faint dark:text-slate-500">
                  {formatRelativeTime(project.updatedAt)}
                </td>
                <td className="py-3 pl-0 pr-4 align-middle">
                  <ChevronRight className="h-4 w-4 text-slate-300 transition-colors group-hover:text-slate-500 dark:text-slate-600" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Thin current-phase progress bar with a vertical tick marking the next gate
 * (proposal §5.2). The tick sits just inside the right edge so it reads as the
 * threshold the bar is filling toward.
 */
function ProgressBar({ pct }: { pct: number }) {
  return (
    <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
      <div
        className="h-full rounded-full bg-brand-600 transition-[width] duration-[180ms] ease-out"
        style={{ width: `${pct}%` }}
      />
      <span className="absolute inset-y-0 right-px w-px bg-slate-300 dark:bg-slate-600" aria-hidden />
    </div>
  );
}

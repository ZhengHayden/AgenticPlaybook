"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Plus, Search, Upload } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import { formatRelativeTime } from "@/lib/utils";
import type { PhaseId, Project } from "@/content/sample-data";
import { projectPhaseKpis } from "@/content/phase-kpis";
import { StatTile } from "@/components/ui/stat-tile";
import { SegTabs } from "@/components/ui/seg-tabs";
import { ProjectsTable } from "./projects-table";
import {
  distinctDomains,
  filterProjects,
  portfolioStats,
  type StageFilter,
  type DomainFilter,
} from "./portfolio";

interface ProjectListClientProps {
  projects: ReadonlyArray<Project>;
}

type ViewMode = "table" | "cards" | "kanban";

const PHASE_ORDER: ReadonlyArray<PhaseId> = ["impactSizing", "design", "mvp", "production"];

export function ProjectListClient({ projects }: ProjectListClientProps) {
  const { t } = useLocale();

  const [view, setView] = useState<ViewMode>("table");
  const [stage, setStage] = useState<StageFilter>("all");
  const [domain, setDomain] = useState<DomainFilter>("all");
  const [query, setQuery] = useState("");

  const stats = useMemo(() => portfolioStats(projects), [projects]);
  const domains = useMemo(() => distinctDomains(projects), [projects]);
  const visible = useMemo(
    () => filterProjects(projects, { stage, domain, query }),
    [projects, stage, domain, query],
  );

  const selectClass =
    "rounded-md border border-border bg-surface px-2.5 py-1.5 text-sm text-ink-muted focus:outline-none focus-visible:ring-2 focus-visible:ring-ring";

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-[28px] font-semibold leading-9 tracking-tight">
            {t.nav.projects}
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {stats.projects} {t.portfolio.statProjects} · {domains.length} {t.portfolio.domainsLabel}{" "}
            · {stats.candidates} {t.portfolio.statCandidates}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            aria-hidden
            className="inline-flex cursor-default items-center gap-1.5 rounded-md border border-border px-3 py-2 text-sm font-medium text-ink-faint"
          >
            <Upload className="h-4 w-4" /> {t.portfolio.importLabel}
          </span>
          <Link
            href="/projects/new"
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3.5 py-2 text-sm font-semibold text-white transition hover:bg-primary-deep focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <Plus className="h-4 w-4" /> {t.project.createNew}
          </Link>
        </div>
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatTile label={t.portfolio.statProjects} value={stats.projects} accent="primary" />
        <StatTile label={t.portfolio.statCandidates} value={stats.candidates} accent="violet" />
        <StatTile label={t.portfolio.statInDesign} value={stats.inDesign} accent="success" />
        <StatTile label={t.portfolio.statInProduction} value={stats.inProduction} accent="warning" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        <select
          aria-label={t.portfolio.stage}
          value={stage}
          onChange={(e) => setStage(e.target.value as StageFilter)}
          className={selectClass}
        >
          <option value="all">{t.portfolio.allStages}</option>
          {PHASE_ORDER.map((p) => (
            <option key={p} value={p}>
              {t.phases[p]}
            </option>
          ))}
        </select>

        <select
          aria-label={t.project.domain}
          value={domain}
          onChange={(e) => setDomain(e.target.value as DomainFilter)}
          className={selectClass}
        >
          <option value="all">{t.portfolio.allDomains}</option>
          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>

        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.portfolio.search}
            className="w-48 rounded-md border border-border bg-surface py-1.5 pl-8 pr-2.5 text-sm text-ink placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>

        <div className="ml-auto">
          <SegTabs<ViewMode>
            value={view}
            onChange={setView}
            tabs={[
              { value: "table", label: t.portfolio.viewTable },
              { value: "cards", label: t.portfolio.viewCards },
              { value: "kanban", label: t.portfolio.viewKanban },
            ]}
          />
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border bg-surface px-4 py-10 text-center text-sm text-ink-faint">
          {t.portfolio.noResults}
        </p>
      ) : view === "table" ? (
        <ProjectsTable projects={visible} />
      ) : view === "cards" ? (
        <ProjectCards projects={visible} />
      ) : (
        <ProjectKanban projects={visible} />
      )}
    </section>
  );
}

/* ---- Kanban view: projects grouped into stage columns ---- */

function ProjectKanban({ projects }: { projects: ReadonlyArray<Project> }) {
  const { t } = useLocale();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {PHASE_ORDER.map((phase) => {
        const column = projects.filter((p) => p.currentPhase === phase);
        return (
          <div key={phase} className="rounded-xl border border-border bg-surface-muted/40 p-3">
            <div className="mb-2 flex items-center justify-between px-1">
              <span className="eyebrow">{t.phases[phase]}</span>
              <span className="font-mono-num text-xs text-ink-faint">{column.length}</span>
            </div>
            <div className="space-y-2">
              {column.length > 0 ? (
                column.map((project) => {
                  const pct = Math.round((project.phaseProgress[phase] ?? 0) * 100);
                  return (
                    <Link
                      key={project.id}
                      href={`/projects/${project.id}/overview`}
                      className="block rounded-lg border border-border bg-surface p-3 transition-colors hover:border-primary/40"
                    >
                      <div className="text-sm font-medium leading-tight text-foreground">
                        {project.name}
                      </div>
                      <div className="mt-0.5 truncate text-xs text-ink-faint">{project.client}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
                        </div>
                        <span className="font-mono-num text-[11px] text-ink-muted">{pct}%</span>
                      </div>
                    </Link>
                  );
                })
              ) : (
                <div className="grid h-16 place-items-center rounded-lg border border-dashed border-border text-[11px] text-ink-faint">
                  —
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ---- Cards view: the original executive-presentation layout, preserved ---- */

const phaseChipColor: Record<PhaseId, string> = {
  impactSizing: "border-info/30 bg-info-soft text-info",
  design: "border-accent-violet/30 bg-accent-violet-soft text-accent-violet",
  mvp: "border-warning/30 bg-warning-soft text-warning",
  production: "border-success/30 bg-success-soft text-success",
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

function ProjectCards({ projects }: { projects: ReadonlyArray<Project> }) {
  const { t, locale } = useLocale();
  const cardLocale = locale === "en" ? "en" : "zh";
  return (
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
            className="card-lift group rounded-xl border border-border bg-surface p-5 transition-colors hover:border-hairline-strong"
          >
            <div className="mb-2 flex items-center justify-between">
              <h2 className="font-display font-medium tracking-tight">{project.name}</h2>
              <span className="text-xs text-ink-faint group-hover:text-ink-muted">→</span>
            </div>
            <div className="space-y-2 text-sm text-ink-muted">
              <div className="flex justify-between">
                <span>{t.project.domain}</span>
                <span className="font-medium text-foreground">{project.domain}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="shrink-0">{phaseLabel}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                  <div className="h-full bg-primary" style={{ width: `${progress}%` }} />
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
                  {t.project.variant}: {variantLabels[project.p1Variant][cardLocale]} /{" "}
                  {designLabels[project.p2Variant][cardLocale]}
                </span>
                <span className="text-ink-faint">{formatRelativeTime(project.updatedAt)}</span>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

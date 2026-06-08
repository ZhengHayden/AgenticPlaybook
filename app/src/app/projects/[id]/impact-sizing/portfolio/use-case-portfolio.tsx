"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, ProjectUseCase, SolutionProposal } from "@/content/sample-data";
import {
  odsIndicators,
  orsIndicators,
  quadrants,
  quadrantFromScores,
  type QuadrantId,
} from "@/content/funnel-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import {
  cohortMaxDdiRaw,
  computeUnitPriority,
  computeVm,
  computeDdiRaw,
  PRIORITY_FLOOR,
} from "@/content/scoring-rubric";
import {
  SOLUTION_BADGE,
  SOLUTION_LABELS,
  SOLUTION_OPTIONS,
  isDesignEligible,
} from "@/content/solution-proposal";
import { ChevronDown, ChevronRight, Download } from "lucide-react";
import { Card, SectionHeader } from "@/components/ui/card";
import { QuadrantMatrix, type QuadrantKey, type QuadrantPoint } from "@/components/charts/quadrant-matrix";

/** Map the rubric quadrant ids to the q1–q4 priority tokens. */
const QUADRANT_KEY: Record<QuadrantId, QuadrantKey> = {
  quickWin: "q1",
  sponsorAlign: "q2",
  investProve: "q3",
  deferMature: "q4",
};

interface UseCasePortfolioProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

/** Quadrant the use case inherits from its parent workflow (funnel stays workflow-level). */
type InheritedQuadrant = QuadrantId | "failed";

interface UseCaseRow {
  useCase: ProjectUseCase;
  parent: Candidate;
  /** Parent workflow's quadrant — read-only context here. */
  parentQuadrant: InheritedQuadrant;
  priority: number;
  scored: boolean;
}

const quadrantBadge: Record<InheritedQuadrant, string> = {
  quickWin: "bg-success-soft text-success",
  sponsorAlign: "bg-warning-soft text-warning",
  investProve: "bg-info-soft text-info",
  deferMature: "bg-surface-muted text-ink-muted",
  failed: "bg-danger-soft text-danger",
};

const inputClass =
  "mt-0.5 w-full rounded border border-border bg-surface px-2 py-1 text-sm";

const isScored = (u: ProjectUseCase): boolean =>
  Boolean(u.vm && u.ddi && u.risk && u.totalSteps);

/** A scorable unit projected from a fully-scored use case. */
function unit(u: ProjectUseCase) {
  return { vm: u.vm!, ddi: u.ddi!, totalSteps: u.totalSteps!, risk: u.risk! };
}

/** Parent workflow's quadrant: FAIL if it missed the Readiness screen, else override ?? computed. */
function workflowQuadrant(c: Candidate): InheritedQuadrant {
  const passed =
    screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0) >=
    SCREEN_PASS_THRESHOLD;
  if (!passed) return "failed";
  const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
  const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
  return c.quadrantOverride ?? quadrantFromScores(ods, ors);
}

/**
 * Use-case-grain portfolio. Ranks a flat list of use cases by Priority across the
 * whole project (the active grain in use-case mode), showing the parent workflow as
 * context and keeping the Solution / Design hand-off per use case.
 */
export function UseCasePortfolio({ projectId, candidates }: UseCasePortfolioProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const { status, error, save } = useProjectSave(projectId);
  const [dirty, setDirty] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, SolutionProposal | undefined>>(() => {
    const out: Record<string, SolutionProposal | undefined> = {};
    candidates.forEach((c) => (c.useCases ?? []).forEach((u) => (out[u.id] = u.solutionProposal)));
    return out;
  });

  const [wfFilter, setWfFilter] = useState<string>("all");

  // DDI cohort spans every scored use case project-wide (matches the scoring page).
  const maxDdiRaw = cohortMaxDdiRaw(
    candidates.flatMap((c) => (c.useCases ?? []).filter(isScored).map(unit)),
  );

  const rows: UseCaseRow[] = candidates.flatMap((c) => {
    const parentQuadrant = workflowQuadrant(c);
    return (c.useCases ?? []).map((u) => {
      const scored = isScored(u);
      return {
        useCase: u,
        parent: c,
        parentQuadrant,
        priority: scored ? computeUnitPriority(unit(u), maxDdiRaw) : 0,
        scored,
      };
    });
  });

  // Workflow is a filter: narrow the flat use-case list to one parent workflow.
  const workflowOptions = candidates.filter((c) => (c.useCases ?? []).length > 0);
  const visibleRows = wfFilter === "all" ? rows : rows.filter((r) => r.parent.id === wfFilter);
  const ranked = visibleRows.filter((r) => r.scored).sort((a, b) => b.priority - a.priority);
  const unscored = visibleRows.filter((r) => !r.scored);

  // Matrix points for scored use cases that inherit a real (non-failed) quadrant.
  const points: QuadrantPoint[] = ranked
    .filter((r) => r.parentQuadrant !== "failed")
    .map((r) => {
      const vm = computeVm(r.useCase.vm!);
      const ddiRaw = computeDdiRaw(r.useCase.ddi!, r.useCase.totalSteps!);
      return {
        key: r.useCase.id,
        label: r.useCase.name || (en ? "Untitled" : "未命名"),
        impact: Math.min(100, (vm / 5) * 100),
        effort: Math.min(100, (1 - (maxDdiRaw > 0 ? ddiRaw / maxDdiRaw : 0)) * 100),
        priority: r.priority,
        quadrant: QUADRANT_KEY[r.parentQuadrant as QuadrantId],
      };
    });

  const avgPriority = ranked.length
    ? ranked.reduce((s, r) => s + r.priority, 0) / ranked.length
    : 0;
  const quadDistribution = quadrants.map((q) => ({
    id: q.id,
    label: q.shortName[locale],
    count: ranked.filter((r) => r.parentQuadrant === q.id).length,
  }));

  const setDisposition = (useCaseId: string, value: SolutionProposal | undefined) => {
    setEdits((prev) => ({ ...prev, [useCaseId]: value }));
    setDirty(true);
  };

  const onSave = async () => {
    const merged = candidates.map((c) => {
      if (!c.useCases || c.useCases.length === 0) return c;
      return {
        ...c,
        useCases: c.useCases.map((u) => ({ ...u, solutionProposal: edits[u.id] })),
      };
    });
    await save({ candidates: merged });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? en ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? en ? "Saved ✓" : "已保存 ✓"
        : en ? "Save" : "保存";

  const COLSPAN = 7;

  const renderRow = (r: UseCaseRow, index: number | null) => {
    const u = r.useCase;
    const proposal = edits[u.id];
    const eligible = isDesignEligible({ solutionProposal: proposal });
    const passesFloor = r.priority >= PRIORITY_FLOOR;
    const expanded = expandedRow === u.id;
    const quadrantLabel =
      r.parentQuadrant === "failed"
        ? "FAIL L1"
        : quadrants.find((q) => q.id === r.parentQuadrant)?.shortName[locale];
    return (
      <Fragment key={u.id}>
        <tr className="hover:bg-surface-muted/40">
          <td className="px-3 py-3">
            <button
              type="button"
              onClick={() => setExpandedRow(expanded ? null : u.id)}
              className="text-ink-faint hover:text-ink-muted"
              aria-label={en ? "Toggle editor" : "切换编辑"}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </td>
          <td className="px-3 py-3 text-ink-faint">{index === null ? "—" : index + 1}</td>
          <td className="px-3 py-3 font-medium">{u.name || (en ? "Untitled" : "未命名")}</td>
          <td className="px-3 py-3 text-ink-muted">{r.parent.name}</td>
          <td className="px-3 py-3">
            <span
              className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge[r.parentQuadrant]}`}
            >
              {quadrantLabel}
            </span>
          </td>
          <td className="px-3 py-3 text-right">
            {r.scored ? (
              <span
                className={
                  passesFloor
                    ? "font-mono text-success"
                    : "font-mono text-danger"
                }
              >
                {r.priority.toFixed(2)}
              </span>
            ) : (
              <span className="text-ink-faint">—</span>
            )}
          </td>
          <td className="px-3 py-3">
            {proposal ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${SOLUTION_BADGE[proposal]}`}>
                  {SOLUTION_LABELS[proposal][locale]}
                </span>
                {eligible && (
                  <span className="text-[10px] font-semibold text-success">
                    {en ? "Design-eligible" : "可进入 Design"}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-ink-faint">{en ? "Not decided" : "未决定"}</span>
            )}
          </td>
        </tr>
        {expanded && (
          <tr className="bg-surface-muted/40">
            <td></td>
            <td colSpan={COLSPAN - 1} className="px-3 py-4">
              {u.description && (
                <p className="mb-3 text-xs text-ink-muted">{u.description}</p>
              )}
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                <label className="block text-xs">
                  <span className="text-ink-muted">{en ? "Solution proposal" : "方案决策"}</span>
                  <select
                    value={proposal ?? ""}
                    onChange={(e) =>
                      setDisposition(u.id, (e.target.value || undefined) as SolutionProposal | undefined)
                    }
                    className={inputClass}
                  >
                    <option value="">{en ? "— not decided —" : "— 未决定 —"}</option>
                    {SOLUTION_OPTIONS.map((id) => (
                      <option key={id} value={id}>
                        {SOLUTION_LABELS[id][locale]}
                      </option>
                    ))}
                  </select>
                </label>
                {u.expectedKpis && u.expectedKpis.length > 0 && (
                  <div className="text-xs md:col-span-2 lg:col-span-2">
                    <span className="text-ink-muted">{en ? "Expected KPIs" : "预期 KPI"}</span>
                    <p className="mt-0.5 text-ink-muted">
                      {u.expectedKpis.join(" · ")}
                    </p>
                  </div>
                )}
              </div>
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold">
          {en ? "Prioritized Use-Case Portfolio" : "优先级排序的用例组合"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted/40"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-surface px-3 py-1.5 text-sm hover:bg-surface-muted/40"
          >
            <Download className="h-4 w-4" /> XLSX
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-border bg-surface p-4 text-sm text-ink-muted">
          {en
            ? "No scored use cases yet. Add use-case ideas in the Readiness Check, then score them under Impact Sizing."
            : "暂无已评分的用例。请先在准备度检查中添加用例想法,再到影响评估中评分。"}
        </p>
      ) : (
        <>
          {points.length > 0 && (
            <div className="grid grid-cols-12 gap-5">
              <Card className="col-span-12 p-5 xl:col-span-8">
                <SectionHeader
                  title={en ? "Prioritization Matrix" : "优先级矩阵"}
                  sub={
                    en
                      ? "Impact (VM) vs implementation effort · bubble = Priority"
                      : "影响力(VM)对实施难度 · 气泡 = 优先级"
                  }
                />
                <QuadrantMatrix
                  points={points}
                  xLabel={en ? "Implementation effort →" : "实施难度 →"}
                />
              </Card>
              <aside className="col-span-12 space-y-4 xl:col-span-4">
                <Card className="p-5">
                  <div className="eyebrow">{en ? "Portfolio Priority" : "组合优先级"}</div>
                  <div className="mt-2 font-display text-[40px] font-semibold leading-none tabular-nums">
                    {avgPriority.toFixed(2)}
                  </div>
                  <div className="mt-1 text-[11px] text-ink-faint">
                    {en
                      ? `avg over ${ranked.length} prioritized use cases`
                      : `${ranked.length} 个已排序用例的均值`}
                  </div>
                  <div className="mt-4 flex justify-between rounded-lg border border-border bg-surface-muted/40 p-3 font-mono-num text-xs">
                    <span className="text-ink-muted">{en ? "Floor" : "门槛"}</span>
                    <span className="font-semibold">{PRIORITY_FLOOR.toFixed(2)}</span>
                  </div>
                </Card>
                <Card className="p-5">
                  <div className="eyebrow mb-2">{en ? "Quadrant distribution" : "象限分布"}</div>
                  <div className="space-y-2">
                    {quadDistribution.map((d) => (
                      <div key={d.id} className="flex items-center gap-3">
                        <span
                          className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${quadrantBadge[d.id]}`}
                        >
                          {d.label}
                        </span>
                        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full"
                            style={{
                              width: `${ranked.length ? (d.count / ranked.length) * 100 : 0}%`,
                              background: `hsl(var(--${QUADRANT_KEY[d.id]}))`,
                            }}
                          />
                        </div>
                        <span className="w-6 text-right font-mono-num text-xs">{d.count}</span>
                      </div>
                    ))}
                  </div>
                </Card>
              </aside>
            </div>
          )}

          <div className="flex flex-wrap items-center gap-2">
            <label className="text-xs font-medium text-ink-muted">
              {en ? "Workflow" : "工作流"}
            </label>
            <select
              value={wfFilter}
              onChange={(e) => setWfFilter(e.target.value)}
              aria-label={en ? "Filter by workflow" : "按工作流筛选"}
              className="max-w-[18rem] rounded-md border border-border bg-surface px-2 py-1 text-sm"
            >
              <option value="all">{en ? "All workflows" : "全部工作流"}</option>
              {workflowOptions.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {wfFilter !== "all" && (
              <span className="text-xs text-ink-faint">
                {en ? `${visibleRows.length} shown` : `显示 ${visibleRows.length} 个`}
              </span>
            )}
          </div>

          <div className="overflow-x-auto rounded-xl border border-border bg-surface">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-surface-muted text-left text-xs uppercase tracking-wide text-ink-muted">
                <tr>
                  <th className="w-8 px-3 py-2">
                    <span className="sr-only">{en ? "Expand" : "展开"}</span>
                  </th>
                  <th className="px-3 py-2 font-medium">#</th>
                  <th className="px-3 py-2 font-medium">{en ? "Use case" : "用例"}</th>
                  <th className="px-3 py-2 font-medium">{en ? "Workflow" : "工作流"}</th>
                  <th className="px-3 py-2 font-medium">{en ? "Quadrant" : "象限"}</th>
                  <th className="px-3 py-2 text-right font-medium">Priority</th>
                  <th className="px-3 py-2 font-medium">{en ? "Solution" : "方案决策"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {ranked.map((r, idx) => renderRow(r, idx))}
                {unscored.map((r) => renderRow(r, null))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

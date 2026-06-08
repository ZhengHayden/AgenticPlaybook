"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, SolutionProposal, ScoringMode } from "@/content/sample-data";
import {
  odsIndicators,
  orsIndicators,
  quadrants,
  quadrantFromScores,
  type QuadrantId,
} from "@/content/funnel-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import {
  computeVm,
  computeDdiRaw,
  computeRiskPenalty,
  computeRas,
  computePriority,
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
import { UseCasePortfolio } from "./use-case-portfolio";

/** Map the rubric quadrant ids to the q1–q4 priority tokens. */
const QUADRANT_KEY: Record<QuadrantId, QuadrantKey> = {
  quickWin: "q1",
  sponsorAlign: "q2",
  investProve: "q3",
  deferMature: "q4",
};

interface PortfolioViewProps {
  projectId: string;
  scoringMode: ScoringMode;
  candidates: ReadonlyArray<Candidate>;
}

/**
 * Mode dispatcher. Renders the active prioritization grain. Each branch is a
 * self-contained component owning its own hooks, so toggling the project's
 * `scoringMode` swaps the whole subtree rather than changing a hook count.
 */
export function PortfolioView({ projectId, scoringMode, candidates }: PortfolioViewProps) {
  if (scoringMode === "useCase") {
    return <UseCasePortfolio projectId={projectId} candidates={candidates} />;
  }
  return <WorkflowPortfolio projectId={projectId} candidates={candidates} />;
}

interface WorkflowPortfolioProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

interface RankedCandidate {
  candidate: Candidate;
  /** Effective quadrant: manual override if set, else computed from scores. */
  quadrant: QuadrantId | "failed";
  /** The ODS/ORS-computed quadrant, shown as the "Auto" choice (absent if failed). */
  computedQuadrant?: QuadrantId;
  priorityScore: number;
  vm: number;
}

/** The subset of candidate fields editable from the portfolio. */
type CandidateEdit = Pick<
  Candidate,
  | "businessFunction"
  | "agentOwner"
  | "processOwner"
  | "targetCompletionDate"
  | "solutionProposal"
  | "quadrantOverride"
>;

const quadrantBadge: Record<QuadrantId | "failed", string> = {
  quickWin: "bg-q1-soft text-q1",
  sponsorAlign: "bg-q2-soft text-q2",
  investProve: "bg-q3-soft text-q3",
  deferMature: "bg-q4-soft text-q4",
  failed: "bg-danger-soft text-danger",
};

const inputClass =
  "mt-0.5 w-full rounded border border-border bg-surface px-2 py-1 text-sm";

function pickEdit(c: Candidate): CandidateEdit {
  return {
    businessFunction: c.businessFunction,
    agentOwner: c.agentOwner,
    processOwner: c.processOwner,
    targetCompletionDate: c.targetCompletionDate,
    solutionProposal: c.solutionProposal,
    quadrantOverride: c.quadrantOverride,
  };
}

/** Workflow-grain portfolio: ranks candidates by their Priority score. */
function WorkflowPortfolio({ projectId, candidates }: WorkflowPortfolioProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const { status, error, save } = useProjectSave(projectId);
  const [dirty, setDirty] = useState(false);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [edits, setEdits] = useState<Record<string, CandidateEdit>>(() => {
    const out: Record<string, CandidateEdit> = {};
    candidates.forEach((c) => {
      out[c.id] = pickEdit(c);
    });
    return out;
  });

  const updateEdit = (candidateId: string, patch: Partial<CandidateEdit>) => {
    setEdits((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], ...patch } }));
    setDirty(true);
  };

  const onSave = async () => {
    const merged = candidates.map((c) => ({ ...c, ...edits[c.id] }));
    await save({ candidates: merged });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? en ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? en ? "Saved ✓" : "已保存 ✓"
        : en ? "Save" : "保存";

  const screenPassed = (c: Candidate): boolean =>
    screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0) >= SCREEN_PASS_THRESHOLD;

  const all = candidates.map<RankedCandidate & { _ddiRaw?: number; _ras?: number }>((c) => {
    if (!screenPassed(c)) {
      return { candidate: c, quadrant: "failed", priorityScore: 0, vm: 0 };
    }
    const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
    const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
    const computedQuadrant = quadrantFromScores(ods, ors);
    const vm = computeVm(c.vm);

    const ddiRaw = computeDdiRaw(c.ddi, c.totalSteps);
    const ras = computeRas(vm, computeRiskPenalty(c.risk));
    return {
      candidate: c,
      quadrant: c.quadrantOverride ?? computedQuadrant,
      computedQuadrant,
      priorityScore: 0,
      vm,
      _ddiRaw: ddiRaw,
      _ras: ras,
    };
  });

  const maxDdiRaw = Math.max(...all.map((r) => r._ddiRaw ?? 0), 0.0001);
  all.forEach((r) => {
    if (r._ras !== undefined && r._ddiRaw !== undefined) {
      r.priorityScore = computePriority(r._ras, r._ddiRaw / maxDdiRaw);
    }
  });

  const ranked = all
    .filter((r) => r.quadrant !== "failed")
    .sort((a, b) => b.priorityScore - a.priorityScore);
  const failed = all.filter((r) => r.quadrant === "failed");

  // Matrix points: impact from VM (0–5 → 0–100), effort from normalized DDI
  // (higher determinism = lower effort), bubble size from Priority.
  const points: QuadrantPoint[] = ranked
    .filter((r) => r.quadrant !== "failed")
    .map((r) => ({
      key: r.candidate.id,
      label: r.candidate.name,
      impact: Math.min(100, (r.vm / 5) * 100),
      effort: Math.min(100, (1 - (r._ddiRaw ?? 0) / maxDdiRaw) * 100),
      priority: r.priorityScore,
      quadrant: QUADRANT_KEY[r.quadrant as QuadrantId],
    }));

  const avgPriority = ranked.length
    ? ranked.reduce((s, r) => s + r.priorityScore, 0) / ranked.length
    : 0;
  const avgVm = ranked.length ? ranked.reduce((s, r) => s + r.vm, 0) / ranked.length : 0;
  const quadDistribution = quadrants.map((q) => ({
    id: q.id,
    label: q.shortName[locale],
    count: ranked.filter((r) => r.quadrant === q.id).length,
  }));

  const COLSPAN = 7;

  const renderRow = (r: RankedCandidate, index: number | null) => {
    const c = r.candidate;
    const edit = edits[c.id];
    const effectiveQuadrant = edit.quadrantOverride ?? r.computedQuadrant;
    const autoLabel = quadrants.find((x) => x.id === r.computedQuadrant)?.shortName[locale];
    const passesFloor = r.priorityScore >= PRIORITY_FLOOR;
    const expanded = expandedRow === c.id;
    const proposal = edit.solutionProposal;
    const eligible = isDesignEligible(edit);
    return (
      <Fragment key={c.id}>
        <tr className="hover:bg-surface-muted/40">
          <td className="px-3 py-3">
            <button
              type="button"
              onClick={() => setExpandedRow(expanded ? null : c.id)}
              className="text-ink-faint hover:text-foreground"
              aria-label={en ? "Toggle editor" : "切换编辑"}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </td>
          <td className="px-3 py-3 font-mono-num text-xs text-ink-faint">{index === null ? "—" : index + 1}</td>
          <td className="px-3 py-3 font-medium">{c.name}</td>
          <td className="px-3 py-3">
            {r.quadrant === "failed" || !effectiveQuadrant ? (
              <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge.failed}`}>
                FAIL L1
              </span>
            ) : (
              <select
                value={edit.quadrantOverride ?? ""}
                onChange={(e) =>
                  updateEdit(c.id, {
                    quadrantOverride: (e.target.value || undefined) as QuadrantId | undefined,
                  })
                }
                aria-label={en ? "Quadrant" : "象限"}
                className={`cursor-pointer rounded-md border-0 px-2 py-0.5 text-xs font-semibold ${quadrantBadge[effectiveQuadrant]}`}
              >
                <option value="">
                  {(en ? "Auto" : "自动") + (autoLabel ? ` · ${autoLabel}` : "")}
                </option>
                {quadrants.map((qd) => (
                  <option key={qd.id} value={qd.id}>
                    {qd.shortName[locale]}
                  </option>
                ))}
              </select>
            )}
          </td>
          <td className="px-3 py-3 text-right">
            {r.quadrant === "failed" ? (
              <span className="text-ink-faint">—</span>
            ) : (
              <span
                className={
                  passesFloor
                    ? "rounded bg-success-soft px-2 py-0.5 font-mono-num font-semibold text-success"
                    : "font-mono-num text-ink-muted"
                }
              >
                {r.priorityScore.toFixed(2)}
              </span>
            )}
          </td>
          <td className="px-3 py-3">
            {proposal ? (
              <span className="inline-flex items-center gap-1.5">
                <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${SOLUTION_BADGE[proposal]}`}>
                  {SOLUTION_LABELS[proposal][locale]}
                </span>
                {eligible && (
                  <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                    {en ? "Design-eligible" : "可进入 Design"}
                  </span>
                )}
              </span>
            ) : (
              <span className="text-xs text-ink-faint">{en ? "Not decided" : "未决定"}</span>
            )}
          </td>
          <td className="px-3 py-3 text-xs text-ink-muted">{c.recommendation || "—"}</td>
        </tr>
        {expanded && (
          <tr className="bg-surface-muted/30">
            <td></td>
            <td colSpan={COLSPAN - 1} className="px-3 py-4">
              <CandidateEditor
                edit={edit}
                onUpdate={(patch) => updateEdit(c.id, patch)}
              />
            </td>
          </tr>
        )}
      </Fragment>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {en ? "Prioritized Workflow Portfolio" : "优先级排序的工作流组合"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
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

      {ranked.length > 0 && (
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
                  ? `avg over ${ranked.length} prioritized workflows`
                  : `${ranked.length} 个已排序工作流的均值`}
              </div>
              <div className="mt-4 space-y-1.5 rounded-lg border border-border bg-surface-muted/40 p-3 font-mono-num text-xs">
                <div className="flex justify-between">
                  <span className="text-ink-muted">VM avg</span>
                  <span>{avgVm.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-1.5 font-semibold">
                  <span>{en ? "Floor" : "门槛"}</span>
                  <span>{PRIORITY_FLOOR.toFixed(2)}</span>
                </div>
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

      <Card className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-left eyebrow">
            <tr>
              <th className="w-8 px-3 py-2">
                <span className="sr-only">{en ? "Expand" : "展开"}</span>
              </th>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">{en ? "Workflow" : "工作流"}</th>
              <th className="px-3 py-2 font-medium">{en ? "Quadrant" : "象限"}</th>
              <th className="px-3 py-2 text-right font-medium">Priority</th>
              <th className="px-3 py-2 font-medium">{en ? "Solution" : "方案决策"}</th>
              <th className="px-3 py-2 font-medium">{en ? "Recommendation" : "建议"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ranked.map((r, idx) => renderRow(r, idx))}
            {failed.map((r) => renderRow(r, null))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

interface CandidateEditorProps {
  edit: CandidateEdit;
  onUpdate: (patch: Partial<CandidateEdit>) => void;
}

function CandidateEditor({ edit, onUpdate }: CandidateEditorProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
      <label className="block text-xs">
        <span className="text-ink-muted">{en ? "Solution proposal" : "方案决策"}</span>
        <select
          value={edit.solutionProposal ?? ""}
          onChange={(e) =>
            onUpdate({ solutionProposal: (e.target.value || undefined) as SolutionProposal | undefined })
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
      <label className="block text-xs">
        <span className="text-ink-muted">{en ? "Business function" : "业务职能"}</span>
        <input
          value={edit.businessFunction ?? ""}
          onChange={(e) => onUpdate({ businessFunction: e.target.value || undefined })}
          placeholder={en ? "e.g. Accounts Payable" : "例如:应付账款"}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-ink-muted">{en ? "Target completion" : "目标完成日期"}</span>
        <input
          type="date"
          value={edit.targetCompletionDate ?? ""}
          onChange={(e) => onUpdate({ targetCompletionDate: e.target.value || undefined })}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-ink-muted">{en ? "Agent owner" : "智能体负责人"}</span>
        <input
          value={edit.agentOwner ?? ""}
          onChange={(e) => onUpdate({ agentOwner: e.target.value || undefined })}
          placeholder={en ? "e.g. Jane Doe" : "例如:张三"}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-ink-muted">{en ? "Process owner" : "流程负责人"}</span>
        <input
          value={edit.processOwner ?? ""}
          onChange={(e) => onUpdate({ processOwner: e.target.value || undefined })}
          placeholder={en ? "e.g. Mike Chen" : "例如:李四"}
          className={inputClass}
        />
      </label>
    </div>
  );
}

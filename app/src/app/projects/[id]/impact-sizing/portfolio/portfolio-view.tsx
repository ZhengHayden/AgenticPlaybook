"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, SolutionProposal, ScoringMode, ProjectUseCase } from "@/content/sample-data";
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
  cohortMaxDdiRaw,
  computeUnitPriority,
  rollupWorkflow,
  type WorkflowRollup,
  PRIORITY_FLOOR,
} from "@/content/scoring-rubric";
import {
  SOLUTION_BADGE,
  SOLUTION_LABELS,
  SOLUTION_OPTIONS,
  isDesignEligible,
} from "@/content/solution-proposal";
import { ChevronDown, ChevronRight, Download } from "lucide-react";

interface PortfolioViewProps {
  projectId: string;
  scoringMode: ScoringMode;
  candidates: ReadonlyArray<Candidate>;
}

interface RankedUseCase {
  name: string;
  priority: number;
}

interface RankedCandidate {
  candidate: Candidate;
  /** Effective quadrant: manual override if set, else computed from scores. */
  quadrant: QuadrantId | "failed";
  /** The ODS/ORS-computed quadrant, shown as the "Auto" choice (absent if failed). */
  computedQuadrant?: QuadrantId;
  priorityScore: number;
  vm: number;
  /** Use-case mode only: rollup over the workflow's scored use cases. */
  rollup?: WorkflowRollup;
  /** Use-case mode only: the workflow's use cases ranked by priority. */
  rankedUseCases?: RankedUseCase[];
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
  quickWin: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  sponsorAlign: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  investProve: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  deferMature: "bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

const inputClass =
  "mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950";

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

export function PortfolioView({ projectId, scoringMode, candidates }: PortfolioViewProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const useCaseMode = scoringMode === "useCase";
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

  // Use-case mode: rank workflows by their rollup over scored use cases, with the
  // DDI cohort spanning all scored use cases project-wide (matches the scoring page).
  const isScored = (u: ProjectUseCase) => Boolean(u.vm && u.ddi && u.risk && u.totalSteps);
  const ucMaxDdiRaw = useCaseMode
    ? cohortMaxDdiRaw(
        candidates
          .flatMap((c) => c.useCases ?? [])
          .filter(isScored)
          .map((u) => ({ vm: u.vm!, ddi: u.ddi!, totalSteps: u.totalSteps!, risk: u.risk! })),
      )
    : 0;
  const rollupFor = (c: Candidate): { rollup: WorkflowRollup; ranked: RankedUseCase[] } => {
    const withPriority = (c.useCases ?? [])
      .filter(isScored)
      .map((u) => ({
        name: u.name,
        priority: computeUnitPriority(
          { vm: u.vm!, ddi: u.ddi!, totalSteps: u.totalSteps!, risk: u.risk! },
          ucMaxDdiRaw,
        ),
      }));
    return {
      rollup: rollupWorkflow(withPriority.map((x) => x.priority)),
      ranked: [...withPriority].sort((a, b) => b.priority - a.priority),
    };
  };

  const all = candidates.map<RankedCandidate>((c) => {
    if (!screenPassed(c)) {
      return { candidate: c, quadrant: "failed", priorityScore: 0, vm: 0 };
    }
    const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
    const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
    const computedQuadrant = quadrantFromScores(ods, ors);
    const vm = computeVm(c.vm);

    if (useCaseMode) {
      const { rollup, ranked } = rollupFor(c);
      return {
        candidate: c,
        quadrant: c.quadrantOverride ?? computedQuadrant,
        computedQuadrant,
        priorityScore: rollup.priority,
        vm,
        rollup,
        rankedUseCases: ranked,
      };
    }

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
    } as RankedCandidate & { _ddiRaw: number; _ras: number };
  }) as Array<RankedCandidate & { _ddiRaw?: number; _ras?: number }>;

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

  const maxScore = Math.max(...ranked.map((r) => r.priorityScore), 5);
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
        <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
          <td className="px-3 py-3">
            <button
              type="button"
              onClick={() => setExpandedRow(expanded ? null : c.id)}
              className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
              aria-label={en ? "Toggle editor" : "切换编辑"}
            >
              {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </button>
          </td>
          <td className="px-3 py-3 text-slate-400">{index === null ? "—" : index + 1}</td>
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
              <span className="text-slate-400">—</span>
            ) : (
              <div className="flex flex-col items-end">
                <span className={passesFloor ? "font-mono text-emerald-700 dark:text-emerald-300" : "font-mono text-rose-700 dark:text-rose-300"}>
                  {r.priorityScore.toFixed(2)}
                </span>
                {useCaseMode && r.rollup && (
                  <span className="text-[10px] text-slate-500">
                    {en
                      ? `${r.rollup.aboveFloor} of ${r.rollup.total} ≥ ${PRIORITY_FLOOR}`
                      : `${r.rollup.total} 个中 ${r.rollup.aboveFloor} 个 ≥ ${PRIORITY_FLOOR}`}
                  </span>
                )}
              </div>
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
              <span className="text-xs text-slate-400">{en ? "Not decided" : "未决定"}</span>
            )}
          </td>
          <td className="px-3 py-3 text-xs">{c.recommendation || "—"}</td>
        </tr>
        {expanded && (
          <tr className="bg-slate-50/60 dark:bg-slate-950/40">
            <td></td>
            <td colSpan={COLSPAN - 1} className="px-3 py-4">
              {useCaseMode && r.rankedUseCases && r.rankedUseCases.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    {en ? "Use cases by priority" : "用例(按优先级)"}
                  </h4>
                  <ul className="mt-1 space-y-1">
                    {r.rankedUseCases.map((uc, i) => {
                      const floor = uc.priority >= PRIORITY_FLOOR;
                      return (
                        <li key={`${uc.name}-${i}`} className="flex items-center justify-between text-sm">
                          <span className="truncate">
                            {i + 1}. {uc.name || (en ? "Untitled" : "未命名")}
                          </span>
                          <span
                            className={
                              "font-mono text-xs " +
                              (floor
                                ? "text-emerald-700 dark:text-emerald-300"
                                : "text-rose-700 dark:text-rose-300")
                            }
                          >
                            {uc.priority.toFixed(2)}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {en ? "Prioritized Workflow Portfolio" : "优先级排序的工作流组合"}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            <Download className="h-4 w-4" /> XLSX
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[760px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
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
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {ranked.map((r, idx) => renderRow(r, idx))}
            {failed.map((r) => renderRow(r, null))}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
        <h3 className="mb-3 text-sm font-semibold">{en ? "Priority bars" : "优先级条形图"}</h3>
        <div className="space-y-2">
          {ranked.map((r) => {
            const pct = (r.priorityScore / maxScore) * 100;
            const passesFloor = r.priorityScore >= PRIORITY_FLOOR;
            const barStyle: React.CSSProperties = { width: `${pct}%` };
            return (
              <div key={r.candidate.id} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 truncate">{r.candidate.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className={passesFloor ? "h-full bg-emerald-500" : "h-full bg-rose-500"}
                    style={barStyle}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-xs">{r.priorityScore.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-slate-500">
          {en
            ? `Bars in green clear the ${PRIORITY_FLOOR} Design-entry floor; bars in red do not.`
            : `绿色条形通过 ${PRIORITY_FLOOR} Design 进入门槛;红色未通过。`}
        </p>
      </section>
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
        <span className="text-slate-500">{en ? "Solution proposal" : "方案决策"}</span>
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
        <span className="text-slate-500">{en ? "Business function" : "业务职能"}</span>
        <input
          value={edit.businessFunction ?? ""}
          onChange={(e) => onUpdate({ businessFunction: e.target.value || undefined })}
          placeholder={en ? "e.g. Accounts Payable" : "例如:应付账款"}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-slate-500">{en ? "Target completion" : "目标完成日期"}</span>
        <input
          type="date"
          value={edit.targetCompletionDate ?? ""}
          onChange={(e) => onUpdate({ targetCompletionDate: e.target.value || undefined })}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-slate-500">{en ? "Agent owner" : "智能体负责人"}</span>
        <input
          value={edit.agentOwner ?? ""}
          onChange={(e) => onUpdate({ agentOwner: e.target.value || undefined })}
          placeholder={en ? "e.g. Jane Doe" : "例如:张三"}
          className={inputClass}
        />
      </label>
      <label className="block text-xs">
        <span className="text-slate-500">{en ? "Process owner" : "流程负责人"}</span>
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

"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, ProjectUseCase } from "@/content/sample-data";
import { cohortMaxDdiRaw, computeUnitPriority, rollupWorkflow } from "@/content/scoring-rubric";
import { ToolDrawer } from "@/components/tool-drawer";
import { ScoreUnitEditor, ScoringToolReference, type ScoreUnitValue } from "./score-unit-editor";

interface UseCaseScoringProps {
  projectId: string;
  /** Eligible workflows (passed the Readiness Check). */
  candidates: ReadonlyArray<Candidate>;
  /** Full candidate list — edits are merged into this on save. */
  allCandidates: ReadonlyArray<Candidate>;
}

/** Sensible starting point for an as-yet-unscored use case. */
const DEFAULT_UNIT: ScoreUnitValue = {
  vm: { costSavings: 3, qualityImprovement: 3, speedImprovement: 3, strategicAlignment: 3 },
  ddi: { binary: 0, multi: 0, judgment: 0 },
  totalSteps: 5,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" },
  notes: "",
};

function initialUnit(uc: ProjectUseCase): ScoreUnitValue {
  if (uc.vm && uc.ddi && uc.risk && uc.totalSteps) {
    return {
      vm: { ...uc.vm },
      ddi: { ...uc.ddi },
      totalSteps: uc.totalSteps,
      risk: { ...uc.risk },
      notes: uc.scoringNotes ?? "",
    };
  }
  return {
    vm: { ...DEFAULT_UNIT.vm },
    ddi: { ...DEFAULT_UNIT.ddi },
    totalSteps: DEFAULT_UNIT.totalSteps,
    risk: { ...DEFAULT_UNIT.risk },
    notes: uc.scoringNotes ?? "",
  };
}

export function UseCaseScoring({ projectId, candidates, allCandidates }: UseCaseScoringProps) {
  const { locale } = useLocale();
  const { status, error, save } = useProjectSave(projectId);
  const [dirty, setDirty] = useState(false);

  const [scoreState, setScoreState] = useState<Record<string, ScoreUnitValue>>(() => {
    const out: Record<string, ScoreUnitValue> = {};
    candidates.forEach((c) => (c.useCases ?? []).forEach((uc) => (out[uc.id] = initialUnit(uc))));
    return out;
  });
  const [scoredIds, setScoredIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    candidates.forEach((c) => (c.useCases ?? []).forEach((uc) => uc.vm && s.add(uc.id)));
    return s;
  });
  const [activeId, setActiveId] = useState<string | null>(() => {
    for (const c of candidates) {
      const first = (c.useCases ?? [])[0];
      if (first) return first.id;
    }
    return null;
  });

  const update = (useCaseId: string, patch: Partial<ScoreUnitValue>) => {
    setScoreState((prev) => ({ ...prev, [useCaseId]: { ...prev[useCaseId], ...patch } }));
    setScoredIds((prev) => (prev.has(useCaseId) ? prev : new Set(prev).add(useCaseId)));
    setDirty(true);
  };

  const onSave = async () => {
    const merged = allCandidates.map((c) => {
      const ucs = c.useCases;
      if (!ucs || ucs.length === 0) return c;
      return {
        ...c,
        useCases: ucs.map((uc) => {
          if (!scoredIds.has(uc.id)) return uc;
          const sv = scoreState[uc.id];
          return {
            ...uc,
            vm: sv.vm,
            ddi: sv.ddi,
            totalSteps: sv.totalSteps,
            risk: sv.risk,
            scoringNotes: sv.notes,
          };
        }),
      };
    });
    await save({ candidates: merged });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? locale === "en"
        ? "Saving…"
        : "保存中…"
      : status === "saved" && !dirty
        ? locale === "en"
          ? "Saved ✓"
          : "已保存 ✓"
        : locale === "en"
          ? "Save"
          : "保存";

  if (candidates.length === 0) {
    return (
      <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        {locale === "en"
          ? "No workflows have passed the Readiness Check yet. Complete a workflow's Readiness Check (≥5 of 6) first."
          : "尚无通过准备度检查的工作流。请先完成工作流的准备度检查(6 项中 ≥5 项)。"}
      </p>
    );
  }

  // DDI normalized against all scored use cases across the project.
  const maxDdiRaw = cohortMaxDdiRaw([...scoredIds].map((id) => scoreState[id]));

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Layer 3 · Detailed Scoring (by use case)" : "Layer 3 · 详细评分(按用例)"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "en"
              ? "Score each use case; a workflow ranks by its best use case."
              : "对每个用例评分;工作流按其最佳用例排序。"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <ToolDrawer
            buttonLabel={locale === "en" ? "Tool Reference" : "工具参考"}
            title={locale === "en" ? "Detailed Scoring Guide" : "详细评分指南"}
            subtitle={
              locale === "en"
                ? "VM anchors, DDI calculation, risk categories, formula reference."
                : "VM 锚点、DDI 计算、风险分类、公式参考。"
            }
          >
            <ScoringToolReference />
          </ToolDrawer>
        </div>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      {candidates.map((c) => {
        const ucs = c.useCases ?? [];
        const priorities = ucs
          .filter((uc) => scoredIds.has(uc.id))
          .map((uc) => computeUnitPriority(scoreState[uc.id], maxDdiRaw));
        const roll = rollupWorkflow(priorities);
        return (
          <section
            key={c.id}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
          >
            <header className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold">{c.name}</h3>
              <span className="inline-flex items-center gap-2 text-xs">
                <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono dark:bg-slate-800">
                  {locale === "en" ? "Top" : "最高"} {roll.priority.toFixed(2)}
                </span>
                <span className="text-slate-500">
                  {locale === "en"
                    ? `${roll.aboveFloor} of ${roll.total} ≥ 3.0`
                    : `${roll.total} 个中 ${roll.aboveFloor} 个 ≥ 3.0`}
                </span>
              </span>
            </header>

            {ucs.length === 0 ? (
              <p className="mt-2 text-sm text-slate-400">
                {locale === "en"
                  ? "Add use-case ideas in Readiness first."
                  : "请先在准备度检查中添加用例想法。"}
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="flex flex-wrap gap-1">
                  {ucs.map((uc) => {
                    const active = uc.id === activeId;
                    const scored = scoredIds.has(uc.id);
                    return (
                      <button
                        key={uc.id}
                        type="button"
                        onClick={() => setActiveId(uc.id)}
                        className={
                          active
                            ? "rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                            : "rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                        }
                      >
                        {uc.name || (locale === "en" ? "Untitled" : "未命名")}
                        {!scored && <span className="ml-1 text-amber-400">•</span>}
                      </button>
                    );
                  })}
                </div>
                {ucs.some((uc) => uc.id === activeId) && activeId && (
                  <ScoreUnitEditor
                    value={scoreState[activeId]}
                    maxDdiRaw={maxDdiRaw}
                    onChange={(patch) => update(activeId, patch)}
                  />
                )}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}

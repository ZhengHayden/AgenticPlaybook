"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, VmScores, DdiCounts, RiskAssessment, ScoringMode } from "@/content/sample-data";
import { cohortMaxDdiRaw } from "@/content/scoring-rubric";
import { ToolDrawer } from "@/components/tool-drawer";
import { ScoreUnitEditor, ScoringToolReference, type ScoreUnitValue } from "./score-unit-editor";
import { UseCaseScoring } from "./use-case-scoring";

interface ScoringEditorProps {
  projectId: string;
  /** The project's active prioritization grain. */
  scoringMode: ScoringMode;
  /** Eligible candidates shown in the editor — those that passed the Readiness Check (≥ threshold). */
  candidates: ReadonlyArray<Candidate>;
  /** The project's full candidate list — edits are merged into this on save. */
  allCandidates: ReadonlyArray<Candidate>;
}

interface CandidateScoringState {
  vm: VmScores;
  ddi: DdiCounts;
  totalSteps: number;
  risk: RiskAssessment;
  notes: string;
}

export function ScoringEditor({ projectId, scoringMode, candidates, allCandidates }: ScoringEditorProps) {
  if (scoringMode === "useCase") {
    return (
      <UseCaseScoring projectId={projectId} candidates={candidates} allCandidates={allCandidates} />
    );
  }
  return (
    <WorkflowScoring projectId={projectId} candidates={candidates} allCandidates={allCandidates} />
  );
}

/** Workflow-grain scoring — one Priority per candidate (the original behavior). */
function WorkflowScoring({
  projectId,
  candidates,
  allCandidates,
}: Omit<ScoringEditorProps, "scoringMode">) {
  const { locale } = useLocale();
  const { status, error, save } = useProjectSave(projectId);
  const [activeIdx, setActiveIdx] = useState(0);
  const [dirty, setDirty] = useState(false);
  const [state, setState] = useState<Record<string, CandidateScoringState>>(() => {
    const out: Record<string, CandidateScoringState> = {};
    candidates.forEach((c) => {
      out[c.id] = {
        vm: { ...c.vm },
        ddi: { ...c.ddi },
        totalSteps: c.totalSteps,
        risk: { ...c.risk },
        notes: c.scoringNotes ?? "",
      };
    });
    return out;
  });

  if (candidates.length === 0) {
    return (
      <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
        {locale === "en"
          ? "No candidates have passed the Readiness Check yet. Complete a candidate's Readiness Check (≥5 of 6) first."
          : "尚无通过准备度检查的候选。请先在准备度检查页完成候选评估(6 项中 ≥5 项)。"}
      </p>
    );
  }

  const candidate = candidates[activeIdx];
  const s = state[candidate.id];

  const update = (patch: Partial<ScoreUnitValue>) => {
    setState((prev) => ({ ...prev, [candidate.id]: { ...prev[candidate.id], ...patch } }));
    setDirty(true);
  };

  const onSave = async () => {
    const merged = allCandidates.map((c) => {
      const edited = state[c.id];
      if (!edited) return c;
      return {
        ...c,
        vm: edited.vm,
        ddi: edited.ddi,
        totalSteps: edited.totalSteps,
        risk: edited.risk,
        scoringNotes: edited.notes,
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

  // Normalize DDI against the max raw DDI in the candidate cohort.
  const maxDdiRaw = cohortMaxDdiRaw(candidates.map((c) => state[c.id]));

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Layer 3 · Detailed Scoring" : "Layer 3 · 详细评分"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "en"
              ? "Quick Win / Sponsor & Align / Invest & Prove candidates only."
              : "仅 Quick Win / Sponsor & Align / Invest & Prove 候选。"}
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

      {/* candidate switcher */}
      <div className="flex flex-wrap gap-1">
        {candidates.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={
              idx === activeIdx
                ? "rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      <ScoreUnitEditor value={s} maxDdiRaw={maxDdiRaw} onChange={update} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, Workflow } from "@/content/sample-data";
import { scoreCandidates } from "@/content/workflow-priority";
import { quadrants } from "@/content/funnel-rubric";
import { isDesignEligible } from "@/content/solution-proposal";

interface AddWorkflowModalProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  candidates: ReadonlyArray<Candidate>;
  onClose: () => void;
  /** Called with the new workflow id after a successful save (for navigation). */
  onAdded?: (workflowId: string) => void;
}

type Mode = "promote" | "blank";

/**
 * Creates a new workflow on the project, either by promoting an eligible
 * Impact-Sizing candidate (inheriting its priority via `candidateId`) or as a
 * blank workflow with just a name. Persists the full workflows array.
 */
export function AddWorkflowModal({
  projectId,
  workflows,
  candidates,
  onClose,
  onAdded,
}: AddWorkflowModalProps) {
  const { locale } = useLocale();
  const { status, error, save } = useProjectSave(projectId);
  const [mode, setMode] = useState<Mode>("promote");
  const [candidateId, setCandidateId] = useState<string>("");
  const [blankName, setBlankName] = useState<string>("");

  const saving = status === "saving";
  const linkedIds = useMemo(
    () => new Set(workflows.map((w) => w.candidateId).filter(Boolean)),
    [workflows],
  );

  // Eligible = decided RPA or Agent in Impact-Sizing and not already promoted.
  const eligible = useMemo(() => {
    const scores = scoreCandidates(candidates);
    return candidates
      .map((c) => ({ candidate: c, score: scores.get(c.id) }))
      .filter(({ candidate }) => isDesignEligible(candidate) && !linkedIds.has(candidate.id));
  }, [candidates, linkedIds]);

  const canSubmit =
    mode === "promote" ? candidateId !== "" && !saving : blankName.trim() !== "" && !saving;

  const submit = async () => {
    const id = `wf-${crypto.randomUUID()}`;
    let workflow: Workflow;
    if (mode === "promote") {
      const candidate = candidates.find((c) => c.id === candidateId);
      if (!candidate) return;
      workflow = { id, name: candidate.name, candidateId: candidate.id, steps: [] };
    } else {
      workflow = { id, name: blankName.trim(), steps: [] };
    }
    await save({ workflows: [...workflows, workflow] });
    onAdded?.(id);
    onClose();
  };

  const labelCls = "block text-xs text-slate-500";
  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950";
  const tabCls = (active: boolean): string =>
    `flex-1 rounded-md px-3 py-1.5 text-sm font-medium ${
      active
        ? "bg-indigo-600 text-white"
        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">
          {locale === "en" ? "Add Workflow" : "添加工作流"}
        </h2>

        <div className="flex gap-2">
          <button type="button" className={tabCls(mode === "promote")} onClick={() => setMode("promote")}>
            {locale === "en" ? "Promote candidate" : "提升候选"}
          </button>
          <button type="button" className={tabCls(mode === "blank")} onClick={() => setMode("blank")}>
            {locale === "en" ? "Blank" : "空白"}
          </button>
        </div>

        {mode === "promote" ? (
          <label className={labelCls}>
            {locale === "en" ? "Eligible candidate" : "可提升候选"}
            <select
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className={inputCls}
              disabled={eligible.length === 0}
            >
              <option value="">{locale === "en" ? "Select a candidate…" : "选择候选…"}</option>
              {eligible.map(({ candidate, score }) => {
                const q = quadrants.find((x) => x.id === score?.quadrant);
                return (
                  <option key={candidate.id} value={candidate.id}>
                    {candidate.name}
                    {q ? ` · ${q.shortName[locale]} · ${score?.priorityScore.toFixed(2)}` : ""}
                  </option>
                );
              })}
            </select>
            {eligible.length === 0 && (
              <span className="mt-1 block text-xs text-amber-600 dark:text-amber-400">
                {locale === "en"
                  ? "No eligible candidates — promote requires a candidate decided RPA or Agent and not already added. Use Blank instead."
                  : "无可提升候选 — 需为决策为 RPA 或 Agent 且未添加的候选。请改用空白。"}
              </span>
            )}
          </label>
        ) : (
          <label className={labelCls}>
            {locale === "en" ? "Workflow name *" : "工作流名称 *"}
            <input
              autoFocus
              value={blankName}
              onChange={(e) => setBlankName(e.target.value)}
              placeholder={locale === "en" ? "e.g. Returns Triage" : "例如:退货分流"}
              className={inputCls}
            />
          </label>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? (locale === "en" ? "Adding…" : "添加中…") : locale === "en" ? "Add" : "添加"}
          </button>
        </div>
      </div>
    </div>
  );
}

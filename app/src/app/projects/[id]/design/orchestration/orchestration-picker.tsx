"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { Workflow, WorkflowCanvas } from "@/content/sample-data";
import { a2aPatterns, type A2APatternId } from "@/content/a2a-patterns";
import {
  adviseOrchestration,
  COORDINATION_CONCERNS,
  type Fit,
} from "@/content/orchestration-advisor";
import { normalizeCanvas } from "@/content/canvas-layout";
import { Lightbulb } from "lucide-react";
import { FlowCanvas } from "./flow-canvas";

interface OrchestrationPickerProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

const fitBadge: Record<Fit, string> = {
  recommended: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  good: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  poor: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

const fitLabel: Record<Fit, { en: string; zh: string }> = {
  recommended: { en: "Recommended", zh: "推荐" },
  good: { en: "Good fit", zh: "适合" },
  poor: { en: "Weak fit", zh: "欠佳" },
};

export function OrchestrationPicker({ projectId, workflows, workflow }: OrchestrationPickerProps) {
  const { locale } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [pattern, setPattern] = useState<A2APatternId | undefined>(workflow.a2aPattern);
  const [canvas, setCanvas] = useState<WorkflowCanvas>(() => normalizeCanvas(workflow));
  const [dirty, setDirty] = useState(false);

  const advice = adviseOrchestration(workflow.steps);
  const fitOf = (id: A2APatternId): Fit =>
    advice.fits.find((f) => f.pattern === id)?.fit ?? "poor";

  const choose = (id: A2APatternId) => {
    setPattern(id);
    setDirty(true);
  };

  const onCanvasChange = (next: WorkflowCanvas) => {
    setCanvas(next);
    setDirty(true);
  };

  const onSave = async () => {
    await saveWorkflow({ a2aPattern: pattern, canvas });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? locale === "en" ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? locale === "en" ? "Saved ✓" : "已保存 ✓"
        : locale === "en" ? "Save" : "保存";

  const selected = pattern ? a2aPatterns.find((p) => p.id === pattern) : undefined;
  const concerns = pattern ? COORDINATION_CONCERNS[pattern] : [];
  const en = locale === "en";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {en ? "Agent-to-Agent Orchestration Pattern" : "智能体之间编排模式"}
        </h2>
        <button
          type="button"
          onClick={onSave}
          disabled={status === "saving" || !dirty}
          className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
        >
          {saveLabel}
        </button>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      {advice.recommended && (
        <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <div className="flex-1">
            <p className="text-sm">
              <span className="font-semibold">{en ? "Suggested: " : "建议:"}</span>
              {a2aPatterns.find((p) => p.id === advice.recommended)?.[locale].name}
              {advice.recommendedReason && (
                <span className="text-slate-600 dark:text-slate-400"> — {advice.recommendedReason[locale]}</span>
              )}
            </p>
            {advice.recommended !== pattern && (
              <button
                type="button"
                onClick={() => choose(advice.recommended as A2APatternId)}
                className="mt-1.5 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
              >
                {en ? "Apply suggestion" : "采用建议"}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {a2aPatterns.map((p) => {
          const fit = fitOf(p.id);
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => choose(p.id)}
              className={
                p.id === pattern
                  ? "rounded-xl border border-indigo-300 bg-indigo-50 p-3 text-left ring-2 ring-indigo-200 dark:border-indigo-700 dark:bg-indigo-950/30 dark:ring-indigo-900"
                  : "rounded-xl border border-slate-200 bg-white p-3 text-left hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900"
              }
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold">{p[locale].name}</span>
                <span className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold ${fitBadge[fit]}`}>
                  {fitLabel[fit][locale]}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500">{p[locale].description}</p>
            </button>
          );
        })}
      </div>

      {selected && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="text-sm font-semibold">
            {en ? "Why" : "为什么"} {selected[locale].name}?
          </h3>
          <p className="mt-1 text-xs text-slate-500">{selected[locale].useWhen}</p>

          <div className="mt-4 flex items-center justify-between">
            <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {en ? "Orchestration canvas" : "编排画布"}
            </h4>
          </div>
          <div className="mt-2">
            <FlowCanvas
              steps={workflow.steps}
              canvas={canvas}
              locale={locale}
              onChange={onCanvasChange}
            />
          </div>

          <h4 className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
            {en ? "Coordination considerations" : "编排注意事项"}
          </h4>
          <ul className="mt-2 space-y-1">
            {concerns.map((c, i) => (
              <li key={i} className="flex gap-2 text-xs text-slate-600 dark:text-slate-400">
                <span className="text-slate-400">•</span>
                {c[locale]}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

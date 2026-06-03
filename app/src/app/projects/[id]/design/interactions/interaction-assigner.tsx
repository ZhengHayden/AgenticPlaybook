"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { Workflow, WorkflowStep } from "@/content/sample-data";
import { interactionModes, type InteractionId } from "@/content/interactions";

interface InteractionAssignerProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

type FailureCost = "low" | "med" | "high";

const severityOptions: ReadonlyArray<{ value: FailureCost; en: string; zh: string }> = [
  { value: "low", en: "Low", zh: "低" },
  { value: "med", en: "Med", zh: "中" },
  { value: "high", en: "High", zh: "高" },
];

export function InteractionAssigner({ projectId, workflows, workflow }: InteractionAssignerProps) {
  const { locale, t } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps.map((s) => ({ ...s })));
  const [dirty, setDirty] = useState(false);

  const update = (stepId: string, patch: Partial<WorkflowStep>) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...patch } : s)));
    setDirty(true);
  };

  const onSave = async () => {
    await saveWorkflow({ steps });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? locale === "en" ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? locale === "en" ? "Saved ✓" : "已保存 ✓"
        : locale === "en" ? "Save" : "保存";

  const modeColor = (id?: InteractionId): string => {
    if (id === "autopilot") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (id === "copilot") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    if (id === "guardian") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t.design.interactions}</h2>
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

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2 font-medium">{t.design.step}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Failure cost" : "失败代价"}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Reversible?" : "可逆?"}</th>
              <th className="px-4 py-2 font-medium">{t.design.mode}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {steps.map((step) => {
              const mode = step.interactionMode;
              const stepLabel = step.name || `${locale === "en" ? "step" : "步骤"} ${step.seq}`;
              return (
                <tr key={step.id}>
                  <td className="px-4 py-3 font-medium">
                    {step.seq}. {step.name || (locale === "en" ? "Untitled" : "未命名")}
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={step.failureCost ?? "low"}
                      onChange={(e) => update(step.id, { failureCost: e.target.value as FailureCost })}
                      aria-label={locale === "en" ? `Failure cost for ${stepLabel}` : `${stepLabel} 的失败代价`}
                      className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {severityOptions.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o[locale]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={step.reversible ?? false}
                      onChange={(e) => update(step.id, { reversible: e.target.checked })}
                      aria-label={locale === "en" ? `Reversible: ${stepLabel}` : `${stepLabel} 可逆`}
                      className="h-4 w-4 accent-indigo-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mode ?? ""}
                      onChange={(e) => update(step.id, { interactionMode: e.target.value as InteractionId })}
                      aria-label={locale === "en" ? `Interaction mode for ${stepLabel}` : `${stepLabel} 的交互模式`}
                      className={`rounded-md border border-zinc-200 px-2 py-1 text-xs font-medium dark:border-zinc-700 ${modeColor(mode)}`}
                    >
                      <option value="">—</option>
                      {interactionModes.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m[locale].name}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              );
            })}
            {steps.length === 0 && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center text-sm text-zinc-500">
                  {locale === "en" ? "No steps. Add steps on the Workflow tab." : "无步骤。请在工作流 Tab 添加。"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold">
          {locale === "en" ? "Risk → Mode guidance" : "风险 → 模式指引"}
        </h3>
        <p className="text-xs text-zinc-500">
          {locale === "en"
            ? "High failure cost + irreversible → Guardian. Medium → Co-Pilot. Low + reversible → Autopilot."
            : "高失败代价 + 不可逆 → Guardian;中等 → Co-Pilot;低 + 可逆 → Autopilot。"}
        </p>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>● {t.modes.guardian}</span>
          <span>◉ {t.modes.copilot}</span>
          <span>○ {t.modes.autopilot}</span>
        </div>
      </section>
    </div>
  );
}

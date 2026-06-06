"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { Workflow, WorkflowStep } from "@/content/sample-data";
import { archetypes, type ArchetypeId } from "@/content/archetypes";

interface ArchetypeAssignerProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

export function ArchetypeAssigner({ projectId, workflows, workflow }: ArchetypeAssignerProps) {
  const { locale, t } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps.map((s) => ({ ...s })));
  const [selectedId, setSelectedId] = useState<string | null>(workflow.steps[0]?.id ?? null);
  const [dirty, setDirty] = useState(false);

  const setArchetype = (stepId: string, archetype: ArchetypeId) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, archetype } : s)));
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

  const selected = steps.find((s) => s.id === selectedId);
  const selectedArchetype = selected?.archetype ? archetypes.find((a) => a.id === selected.archetype) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">{t.design.archetypes}</h2>
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

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_320px]">
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
              <tr>
                <th className="px-4 py-2 font-medium">{t.design.step}</th>
                <th className="px-4 py-2 font-medium">{t.design.archetype}</th>
                <th className="px-4 py-2 font-medium">{locale === "en" ? "Status" : "状态"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {steps.map((step) => {
                const archetype = step.archetype ? archetypes.find((a) => a.id === step.archetype) : undefined;
                return (
                  <tr
                    key={step.id}
                    className={
                      "cursor-pointer " +
                      (step.id === selectedId
                        ? "bg-indigo-50 dark:bg-indigo-950/30"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/50")
                    }
                    onClick={() => setSelectedId(step.id)}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">
                        {step.seq}. {step.name || (locale === "en" ? "Untitled" : "未命名")}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={step.archetype ?? ""}
                        onChange={(e) => setArchetype(step.id, e.target.value as ArchetypeId)}
                        onClick={(e) => e.stopPropagation()}
                        aria-label={locale === "en" ? `Archetype for ${step.name || "step " + step.seq}` : `步骤 ${step.seq} 的原型`}
                        className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                      >
                        <option value="">—</option>
                        {archetypes.map((a) => (
                          <option key={a.id} value={a.id}>
                            {a[locale].name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">
                      {archetype ? (
                        <span>
                          ⬤ {archetype[locale].name} ·{" "}
                          <span className="text-emerald-600 dark:text-emerald-400">✓ {t.common.accepted}</span>
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                  </tr>
                );
              })}
              {steps.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-6 text-center text-sm text-slate-500">
                    {locale === "en" ? "No steps. Add steps on the Workflow tab." : "无步骤。请在工作流 Tab 添加。"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <aside className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
          {selected && selectedArchetype ? (
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-wide text-slate-500">{t.common.selected}</div>
                <div className="mt-0.5 font-semibold">
                  {selected.seq}. {selected.name}
                </div>
              </div>
              <div className="rounded-md bg-slate-50 p-3 dark:bg-slate-950">
                <div className="flex items-center gap-2 font-semibold">
                  <span className="text-lg">{selectedArchetype.icon}</span>
                  {selectedArchetype[locale].name}
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{selectedArchetype[locale].function}</p>
              </div>
              {selected.archetypeRationale && (
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">{t.common.rationale}</div>
                  <p className="mt-1 text-xs text-slate-700 dark:text-slate-300">{selected.archetypeRationale}</p>
                </div>
              )}
              <p className="text-xs text-slate-500">
                <strong className="text-slate-700 dark:text-slate-300">
                  {locale === "en" ? "Why this archetype?" : "为什么选这个原型?"}
                </strong>{" "}
                {selectedArchetype[locale].trigger}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              {locale === "en" ? "Select a step and assign an archetype." : "选择一个步骤并分配原型。"}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

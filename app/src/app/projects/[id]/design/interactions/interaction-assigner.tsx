"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { WorkflowStep } from "@/content/sample-data";
import { interactionModes, type InteractionId } from "@/content/interactions";

interface InteractionAssignerProps {
  steps: ReadonlyArray<WorkflowStep>;
}

const severityOptions: ReadonlyArray<{ value: "low" | "med" | "high"; en: string; zh: string }> = [
  { value: "low", en: "Low", zh: "低" },
  { value: "med", en: "Med", zh: "中" },
  { value: "high", en: "High", zh: "高" },
];

export function InteractionAssigner({ steps: initialSteps }: InteractionAssignerProps) {
  const { locale, t } = useLocale();
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps.map((s) => ({ ...s })));

  const setMode = (stepId: string, mode: InteractionId) => {
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, interactionMode: mode } : s)));
  };

  const modeColor = (id?: InteractionId): string => {
    if (id === "autopilot") return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
    if (id === "copilot") return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
    if (id === "guardian") return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
    return "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300";
  };

  return (
    <div className="space-y-4">
      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2 font-medium">{t.design.step}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Failure cost" : "失败代价"}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Reversible?" : "可逆?"}</th>
              <th className="px-4 py-2 font-medium">{t.design.mode}</th>
              <th className="px-4 py-2 font-medium">{t.common.rationale}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {steps.map((step) => {
              const mode = step.interactionMode;
              return (
                <tr key={step.id}>
                  <td className="px-4 py-3 font-medium">
                    {step.seq}. {step.name}
                  </td>
                  <td className="px-4 py-3">
                    <select className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs dark:border-zinc-700 dark:bg-zinc-950">
                      {severityOptions.map((o) => (
                        <option key={o.value}>{o[locale]}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <input type="checkbox" defaultChecked={step.seq !== 4} className="h-4 w-4 accent-indigo-600" />
                  </td>
                  <td className="px-4 py-3">
                    <select
                      value={mode ?? ""}
                      onChange={(e) => setMode(step.id, e.target.value as InteractionId)}
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
                  <td className="px-4 py-3 text-xs text-zinc-500">{step.interactionRationale}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold">
          {locale === "en" ? "Risk → Mode Heatmap" : "风险 → 模式热力图"}
        </h3>
        <div className="grid w-fit grid-cols-3 gap-2 text-xs">
          {[
            ["○", "◉", "●"],
            ["○", "●", "●"],
            ["●", "●", "●"],
          ].map((row, ri) =>
            row.map((cell, ci) => (
              <div
                key={`${ri}-${ci}`}
                className={
                  "flex h-12 w-16 items-center justify-center rounded-md font-semibold " +
                  (cell === "●"
                    ? "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : cell === "◉"
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                    : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300")
                }
              >
                {cell}
              </div>
            )),
          )}
        </div>
        <div className="mt-3 flex flex-wrap gap-3 text-xs text-zinc-500">
          <span>● {t.modes.guardian}</span>
          <span>◉ {t.modes.copilot}</span>
          <span>○ {t.modes.autopilot}</span>
        </div>
      </section>
    </div>
  );
}

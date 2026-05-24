"use client";

import { useLocale } from "@/lib/locale-context";
import type { WorkflowStep } from "@/content/sample-data";

interface HitlEditorProps {
  steps: ReadonlyArray<WorkflowStep>;
}

export function HitlEditor({ steps }: HitlEditorProps) {
  const { locale } = useLocale();
  const hitlSteps = steps.filter((s) => s.interactionMode === "copilot" || s.interactionMode === "guardian");

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">
          {locale === "en" ? "Human-in-the-Loop Integration" : "人工介入 (HITL) 集成"}
        </h2>
        <p className="mt-1 text-xs text-zinc-500">
          {locale === "en"
            ? "Define checkpoints, SLAs, and escalation paths for steps that require human oversight."
            : "为需要人工监督的步骤定义检查点、SLA 和升级路径。"}
        </p>
      </div>

      <div className="space-y-3">
        {hitlSteps.map((step) => (
          <div key={step.id} className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <div className="flex items-center justify-between">
              <div className="font-medium">
                {step.seq}. {step.name}
              </div>
              <span
                className={
                  step.interactionMode === "guardian"
                    ? "rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    : "rounded-md bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300"
                }
              >
                {step.interactionMode === "guardian" ? "Guardian" : "Co-Pilot"}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
              <label className="text-xs">
                <span className="block text-zinc-500">{locale === "en" ? "Trigger" : "触发条件"}</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  defaultValue={step.seq === 4 ? "Any GL post over $50k" : "Variance > $1k"}
                />
              </label>
              <label className="text-xs">
                <span className="block text-zinc-500">SLA</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  defaultValue={step.seq === 4 ? "4h business" : "8h business"}
                />
              </label>
              <label className="text-xs">
                <span className="block text-zinc-500">{locale === "en" ? "Escalation" : "升级路径"}</span>
                <input
                  className="mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  defaultValue={step.seq === 4 ? "Controller → CFO" : "Senior AP analyst"}
                />
              </label>
            </div>
          </div>
        ))}
        {hitlSteps.length === 0 && (
          <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
            {locale === "en"
              ? "No HITL steps yet. Assign Co-Pilot or Guardian modes on the Interactions tab."
              : "尚无 HITL 步骤。请在交互模式 Tab 分配 Co-Pilot 或 Guardian。"}
          </p>
        )}
      </div>
    </div>
  );
}

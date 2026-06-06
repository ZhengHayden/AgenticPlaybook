"use client";

import type { Locale } from "@/lib/i18n";
import type { WorkflowStep } from "@/content/sample-data";

interface StepCardProps {
  step: WorkflowStep;
  locale: Locale;
}

const dash = "—";

/** Read-only presentation of a workflow step (shown when not editing). */
export function StepCard({ step, locale }: StepCardProps) {
  const en = locale === "en";
  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded bg-slate-100 text-xs font-semibold dark:bg-slate-800">
          {step.seq}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium">
            {step.name || <span className="text-slate-400">{en ? "Untitled step" : "未命名步骤"}</span>}
          </div>
          {step.description && (
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{step.description}</p>
          )}
          <div className="mt-2 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-2">
            <div>
              <span className="text-slate-400">{en ? "Inputs" : "输入"}: </span>
              <span className="text-slate-700 dark:text-slate-300">{step.inputs || dash}</span>
            </div>
            <div>
              <span className="text-slate-400">{en ? "Outputs" : "输出"}: </span>
              <span className="text-slate-700 dark:text-slate-300">{step.outputs || dash}</span>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

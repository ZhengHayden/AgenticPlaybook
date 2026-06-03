"use client";

import type { Locale } from "@/lib/i18n";
import type { HitlConfig, WorkflowStep } from "@/content/sample-data";
import { recommendHitl, RISK_LABEL, stepRisk, type RiskLevel } from "@/content/hitl-advisor";
import { Wand2 } from "lucide-react";

interface HitlStepCardProps {
  step: WorkflowStep;
  locale: Locale;
  onChange: (patch: Partial<HitlConfig>) => void;
  onApplyRecommendation: () => void;
}

const riskBadge: Record<RiskLevel, string> = {
  critical: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  elevated: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  moderate: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  minimal: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400",
};

const inputCls =
  "mt-1 w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export function HitlStepCard({ step, locale, onChange, onApplyRecommendation }: HitlStepCardProps) {
  const en = locale === "en";
  const risk = stepRisk(step);
  const rec = recommendHitl(step);
  const hitl = step.hitl ?? {};
  const checkpointLabel = (c: "pre" | "post"): string =>
    c === "pre"
      ? en ? "Approve before execution" : "执行前批准"
      : en ? "Review after execution" : "执行后复核";

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <div className="flex items-center justify-between gap-2">
        <div className="font-medium">
          {step.seq}. {step.name || (en ? "Untitled" : "未命名")}
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-md px-2 py-0.5 text-xs font-semibold ${riskBadge[risk]}`}>
            {en ? "Risk" : "风险"}: {RISK_LABEL[risk][locale]}
          </span>
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
      </div>

      <div className="mt-3 flex items-start gap-2 rounded-md border border-indigo-100 bg-indigo-50/60 p-2 dark:border-indigo-900/40 dark:bg-indigo-950/20">
        <Wand2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-indigo-600 dark:text-indigo-400" />
        <p className="flex-1 text-xs text-zinc-600 dark:text-zinc-400">
          <span className="font-semibold text-zinc-700 dark:text-zinc-300">
            {en ? "Suggested: " : "建议:"}
          </span>
          {checkpointLabel(rec.checkpoint)} · {en ? "escalate < " : "低于 "}
          {rec.confidenceThreshold}% {en ? "confidence" : "置信度时升级"} — {rec.note[locale]}
        </p>
        <button
          type="button"
          onClick={onApplyRecommendation}
          className="shrink-0 rounded-md border border-indigo-300 bg-white px-2 py-0.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-zinc-900 dark:text-indigo-300"
        >
          {en ? "Apply" : "采用"}
        </button>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="text-xs">
          <span className="block text-zinc-500">{en ? "Checkpoint" : "介入时机"}</span>
          <select
            value={hitl.checkpoint ?? ""}
            onChange={(e) => onChange({ checkpoint: (e.target.value || undefined) as "pre" | "post" | undefined })}
            className={inputCls}
          >
            <option value="">{en ? "— none —" : "— 无 —"}</option>
            <option value="pre">{checkpointLabel("pre")}</option>
            <option value="post">{checkpointLabel("post")}</option>
          </select>
        </label>
        <label className="text-xs">
          <span className="block text-zinc-500">{en ? "Escalate below confidence (%)" : "置信度阈值 (%)"}</span>
          <input
            type="number"
            min={0}
            max={100}
            value={hitl.confidenceThreshold ?? ""}
            onChange={(e) => {
              const v = e.target.value;
              onChange({ confidenceThreshold: v === "" ? undefined : Math.min(100, Math.max(0, Number(v) || 0)) });
            }}
            placeholder={en ? "e.g. 80" : "例如 80"}
            className={inputCls}
          />
        </label>
        <label className="text-xs">
          <span className="block text-zinc-500">{en ? "Trigger" : "触发条件"}</span>
          <input
            value={hitl.trigger ?? ""}
            onChange={(e) => onChange({ trigger: e.target.value })}
            placeholder={en ? "e.g. Variance > $1k" : "例如:差异 > $1k"}
            className={inputCls}
          />
        </label>
        <label className="text-xs">
          <span className="block text-zinc-500">{en ? "Reviewer" : "审核人"}</span>
          <input
            value={hitl.reviewer ?? ""}
            onChange={(e) => onChange({ reviewer: e.target.value })}
            placeholder={en ? "e.g. AP Controller" : "例如:应付控制员"}
            className={inputCls}
          />
        </label>
        <label className="text-xs">
          <span className="block text-zinc-500">SLA</span>
          <input
            value={hitl.sla ?? ""}
            onChange={(e) => onChange({ sla: e.target.value })}
            placeholder={en ? "e.g. 4h business" : "例如:4 工作小时"}
            className={inputCls}
          />
        </label>
        <label className="text-xs">
          <span className="block text-zinc-500">{en ? "Escalation" : "升级路径"}</span>
          <input
            value={hitl.escalation ?? ""}
            onChange={(e) => onChange({ escalation: e.target.value })}
            placeholder={en ? "e.g. Controller → CFO" : "例如:控制人 → CFO"}
            className={inputCls}
          />
        </label>
      </div>
    </div>
  );
}

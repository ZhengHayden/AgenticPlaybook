"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { HitlConfig, Workflow, WorkflowStep } from "@/content/sample-data";
import {
  isOversightStep,
  isRiskGap,
  recommendHitl,
  summarizeCoverage,
} from "@/content/hitl-advisor";
import { AlertTriangle } from "lucide-react";
import { HitlStepCard } from "./hitl-step-card";

interface HitlEditorProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

export function HitlEditor({ projectId, workflows, workflow }: HitlEditorProps) {
  const { locale } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [steps, setSteps] = useState<WorkflowStep[]>(workflow.steps.map((s) => ({ ...s })));
  const [dirty, setDirty] = useState(false);
  const en = locale === "en";

  const oversightSteps = steps.filter(isOversightStep);
  const riskGaps = steps.filter(isRiskGap);
  const coverage = summarizeCoverage(steps);

  const updateHitl = (stepId: string, patch: Partial<HitlConfig>) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === stepId ? { ...s, hitl: { ...s.hitl, ...patch } } : s)),
    );
    setDirty(true);
  };

  const applyRecommendation = (step: WorkflowStep) => {
    const rec = recommendHitl(step);
    updateHitl(step.id, { checkpoint: rec.checkpoint, confidenceThreshold: rec.confidenceThreshold });
  };

  const onSave = async () => {
    await saveWorkflow({ steps });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? en ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? en ? "Saved ✓" : "已保存 ✓"
        : en ? "Save" : "保存";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {en ? "Human-in-the-Loop Integration" : "人工介入 (HITL) 集成"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {en
              ? "Define checkpoints, confidence thresholds, SLAs, and escalation for oversight steps."
              : "为需监督的步骤定义介入时机、置信度阈值、SLA 与升级路径。"}
          </p>
        </div>
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

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">{en ? "Oversight steps" : "监督步骤"}</div>
          <div className="text-lg font-semibold tabular-nums">{coverage.oversightTotal}</div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">{en ? "Configured" : "已配置"}</div>
          <div className="text-lg font-semibold tabular-nums">
            {coverage.configured}/{coverage.oversightTotal}
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
          <div className="text-xs text-slate-500">{en ? "Risk gaps" : "风险缺口"}</div>
          <div
            className={
              coverage.gaps > 0
                ? "text-lg font-semibold tabular-nums text-rose-600 dark:text-rose-400"
                : "text-lg font-semibold tabular-nums"
            }
          >
            {coverage.gaps}
          </div>
        </div>
      </div>

      {riskGaps.length > 0 && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 dark:border-rose-900/50 dark:bg-rose-950/30">
          <div className="flex items-center gap-2 text-sm font-semibold text-rose-700 dark:text-rose-300">
            <AlertTriangle className="h-4 w-4" />
            {en ? "Unattended high-risk steps" : "无人监督的高风险步骤"}
          </div>
          <p className="mt-1 text-xs text-rose-700/80 dark:text-rose-300/80">
            {en
              ? "These steps carry high, irreversible impact but run on Autopilot. Reconsider Co-Pilot or Guardian mode on the Interactions tab."
              : "以下步骤具有高且不可逆的影响,却运行在自动驾驶模式。请在交互模式 Tab 改为 Co-Pilot 或 Guardian。"}
          </p>
          <ul className="mt-2 space-y-1">
            {riskGaps.map((s) => (
              <li key={s.id} className="text-xs text-rose-800 dark:text-rose-200">
                • {s.seq}. {s.name || (en ? "Untitled" : "未命名")} — {en ? "failure cost" : "失败代价"}:{" "}
                {s.failureCost ?? "low"}
                {s.reversible ? "" : en ? ", irreversible" : ",不可逆"}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {oversightSteps.map((step) => (
          <HitlStepCard
            key={step.id}
            step={step}
            locale={locale}
            onChange={(patch) => updateHitl(step.id, patch)}
            onApplyRecommendation={() => applyRecommendation(step)}
          />
        ))}
        {oversightSteps.length === 0 && (
          <p className="rounded-md border border-slate-200 bg-white p-4 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-900">
            {en
              ? "No oversight steps yet. Assign Co-Pilot or Guardian modes on the Interactions tab."
              : "尚无监督步骤。请在交互模式 Tab 分配 Co-Pilot 或 Guardian。"}
          </p>
        )}
      </div>
    </div>
  );
}

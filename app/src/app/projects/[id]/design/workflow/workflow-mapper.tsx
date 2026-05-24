"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { WorkflowStep } from "@/content/sample-data";
import { GripVertical, Plus, Sparkles } from "lucide-react";

interface WorkflowMapperProps {
  steps: ReadonlyArray<WorkflowStep>;
}

export function WorkflowMapper({ steps: initialSteps }: WorkflowMapperProps) {
  const { locale } = useLocale();
  const [steps, setSteps] = useState<WorkflowStep[]>(initialSteps.map((s) => ({ ...s })));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((s, idx) => ({ ...s, seq: idx + 1 }));
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Workflow Steps" : "工作流步骤"} ({steps.length})
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {locale === "en" ? "Drag to reorder. AI-detected from candidate description." : "拖动以重新排序;基于候选描述由 AI 检测。"}
          </p>
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
          <Plus className="h-4 w-4" /> {locale === "en" ? "Add Step" : "添加步骤"}
        </button>
      </div>

      <ul className="space-y-2">
        {steps.map((step, idx) => (
          <li
            key={step.id}
            draggable
            onDragStart={() => setDragIdx(idx)}
            onDragOver={(e) => {
              e.preventDefault();
              setHoverIdx(idx);
            }}
            onDragEnd={() => {
              if (dragIdx !== null && hoverIdx !== null) move(dragIdx, hoverIdx);
              setDragIdx(null);
              setHoverIdx(null);
            }}
            className={
              "flex items-start gap-3 rounded-xl border bg-white p-4 dark:bg-zinc-900 " +
              (hoverIdx === idx && dragIdx !== idx
                ? "border-indigo-400 ring-2 ring-indigo-100 dark:ring-indigo-900/30"
                : "border-zinc-200 dark:border-zinc-800")
            }
          >
            <GripVertical className="mt-0.5 h-4 w-4 shrink-0 cursor-grab text-zinc-400 active:cursor-grabbing" />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                  {step.seq}
                </span>
                <span className="font-medium">{step.name}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{step.description}</p>
              <div className="mt-2 grid grid-cols-3 gap-3 text-xs text-zinc-500">
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">{locale === "en" ? "Inputs" : "输入"}</span>
                  <span>{step.inputs}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">{locale === "en" ? "Outputs" : "输出"}</span>
                  <span>{step.outputs}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase tracking-wide">{locale === "en" ? "Decisions" : "决策点"}</span>
                  <span>{step.decisionPoints}</span>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
        <Sparkles className="mr-1 inline h-3.5 w-3.5" />
        {locale === "en"
          ? "AI detected 4 steps from the candidate description. Review & edit before classifying."
          : "AI 从候选描述中检测到 4 个步骤。在分类前请审阅与编辑。"}
      </div>
    </div>
  );
}

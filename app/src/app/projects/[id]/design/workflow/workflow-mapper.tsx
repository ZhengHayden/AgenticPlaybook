"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { Workflow, WorkflowStep } from "@/content/sample-data";
import { GripVertical, Pencil, Plus, Trash2, X } from "lucide-react";
import { StepCard } from "./step-card";

interface WorkflowMapperProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

function blankStep(seq: number): WorkflowStep {
  return {
    id: `s-${crypto.randomUUID()}`,
    seq,
    name: "",
    description: "",
    inputs: "",
    outputs: "",
    decisionPoints: 0,
  };
}

const cloneSteps = (steps: ReadonlyArray<WorkflowStep>): WorkflowStep[] =>
  steps.map((s) => ({ ...s }));

export function WorkflowMapper({ projectId, workflows, workflow }: WorkflowMapperProps) {
  const { locale } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [editing, setEditing] = useState(false);
  const [steps, setSteps] = useState<WorkflowStep[]>(cloneSteps(workflow.steps));
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  const en = locale === "en";

  const update = (id: string, patch: Partial<WorkflowStep>) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addStep = () => setSteps((prev) => [...prev, blankStep(prev.length + 1)]);

  const removeStep = (id: string) =>
    setSteps((prev) => prev.filter((s) => s.id !== id).map((s, idx) => ({ ...s, seq: idx + 1 })));

  const move = (from: number, to: number) => {
    if (from === to) return;
    setSteps((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next.map((s, idx) => ({ ...s, seq: idx + 1 }));
    });
  };

  const onEdit = () => {
    setSteps(cloneSteps(workflow.steps));
    setEditing(true);
  };

  const onCancel = () => {
    setSteps(cloneSteps(workflow.steps));
    setEditing(false);
  };

  const onSave = async () => {
    await saveWorkflow({ steps });
    setEditing(false);
  };

  const saving = status === "saving";
  const fieldCls =
    "w-full rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950";
  const microLabel = "block text-[10px] uppercase tracking-wide text-zinc-500";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {en ? "Workflow Steps" : "工作流步骤"} ({editing ? steps.length : workflow.steps.length})
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {editing
              ? en
                ? "Drag to reorder; edit fields inline."
                : "拖动以重新排序;直接编辑字段。"
              : en
                ? "Read-only. Click Edit to add, reorder, or change steps."
                : "只读。点击「编辑」以添加、排序或修改步骤。"}
          </p>
        </div>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={addStep}
              className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" /> {en ? "Add Step" : "添加步骤"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={saving}
              className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              <X className="h-4 w-4" /> {en ? "Cancel" : "取消"}
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
            >
              {saving ? (en ? "Saving…" : "保存中…") : en ? "Save" : "保存"}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Pencil className="h-4 w-4" /> {en ? "Edit" : "编辑"}
          </button>
        )}
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      {!editing ? (
        <ul className="space-y-2">
          {workflow.steps.map((step) => (
            <StepCard key={step.id} step={step} locale={locale} />
          ))}
          {workflow.steps.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
              {en ? "No steps yet. Click “Edit” to add the first step." : "尚无步骤。点击「编辑」添加第一个步骤。"}
            </li>
          )}
        </ul>
      ) : (
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
              <GripVertical className="mt-2 h-4 w-4 shrink-0 cursor-grab text-zinc-400 active:cursor-grabbing" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-zinc-100 text-xs font-semibold dark:bg-zinc-800">
                    {step.seq}
                  </span>
                  <input
                    value={step.name}
                    onChange={(e) => update(step.id, { name: e.target.value })}
                    placeholder={en ? "Step name" : "步骤名称"}
                    className={`${fieldCls} font-medium`}
                  />
                  <button
                    type="button"
                    onClick={() => removeStep(step.id)}
                    aria-label={en ? "Delete step" : "删除步骤"}
                    className="shrink-0 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
                <textarea
                  rows={2}
                  value={step.description}
                  onChange={(e) => update(step.id, { description: e.target.value })}
                  placeholder={en ? "Description" : "描述"}
                  className={`${fieldCls} resize-y`}
                />
                <div className="grid grid-cols-2 gap-3">
                  <label>
                    <span className={microLabel}>{en ? "Inputs" : "输入"}</span>
                    <input value={step.inputs} onChange={(e) => update(step.id, { inputs: e.target.value })} className={fieldCls} />
                  </label>
                  <label>
                    <span className={microLabel}>{en ? "Outputs" : "输出"}</span>
                    <input value={step.outputs} onChange={(e) => update(step.id, { outputs: e.target.value })} className={fieldCls} />
                  </label>
                </div>
              </div>
            </li>
          ))}
          {steps.length === 0 && (
            <li className="rounded-xl border border-dashed border-zinc-300 bg-white p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-900">
              {en ? "No steps yet. Click “Add Step” to begin." : "尚无步骤。点击「添加步骤」开始。"}
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

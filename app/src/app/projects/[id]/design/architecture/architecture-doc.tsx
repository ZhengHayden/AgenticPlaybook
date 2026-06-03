"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useWorkflowSave } from "@/lib/use-workflow-save";
import type { Workflow } from "@/content/sample-data";
import { archetypes } from "@/content/archetypes";
import { interactionModes } from "@/content/interactions";
import { a2aPatterns } from "@/content/a2a-patterns";
import { Download, Sparkles } from "lucide-react";

interface ArchitectureDocProps {
  projectId: string;
  projectName: string;
  workflows: ReadonlyArray<Workflow>;
  workflow: Workflow;
}

export function ArchitectureDoc({ projectId, projectName, workflows, workflow }: ArchitectureDocProps) {
  const { locale } = useLocale();
  const { status, error, saveWorkflow } = useWorkflowSave(projectId, workflows, workflow.id);
  const [summary, setSummary] = useState<string>(workflow.architectureSummary ?? "");
  const [dirty, setDirty] = useState(false);

  const onSave = async () => {
    await saveWorkflow({ architectureSummary: summary });
    setDirty(false);
  };

  const saveLabel =
    status === "saving"
      ? locale === "en" ? "Saving…" : "保存中…"
      : status === "saved" && !dirty
        ? locale === "en" ? "Saved ✓" : "已保存 ✓"
        : locale === "en" ? "Save" : "保存";

  const pattern = workflow.a2aPattern ? a2aPatterns.find((p) => p.id === workflow.a2aPattern) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Agent Architecture Document · v0.3 draft" : "智能体架构文档 · v0.3 草稿"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {locale === "en"
              ? "Auto-assembled from prior tabs. Edit the summary; structured data is derived."
              : "从前序 Tab 自动汇编。可编辑摘要;结构化数据为派生。"}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Sparkles className="h-4 w-4" /> {locale === "en" ? "AI review" : "AI 评审"}
          </button>
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Download className="h-4 w-4" /> {locale === "en" ? "Export PDF" : "导出 PDF"}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <article className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <header>
          <h1 className="text-xl font-bold">
            {workflow.name} — {locale === "en" ? "Agent Architecture" : "智能体架构"}
          </h1>
          <p className="text-xs text-zinc-500">{projectName}</p>
        </header>

        <section>
          <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            1. {locale === "en" ? "Executive Summary" : "执行摘要"}
          </h2>
          <textarea
            value={summary}
            onChange={(e) => {
              setSummary(e.target.value);
              setDirty(true);
            }}
            placeholder={
              locale === "en"
                ? "Summarize the agent architecture, the orchestration choice, and where humans stay in the loop."
                : "概述智能体架构、编排选择,以及人工介入点。"
            }
            className="mt-2 w-full resize-y rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            rows={4}
          />
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            2. {locale === "en" ? "Agent Specifications" : "智能体规格"}
          </h2>
          <div className="mt-2 space-y-3">
            {workflow.steps.map((step) => {
              const archetype = step.archetype ? archetypes.find((a) => a.id === step.archetype) : undefined;
              const mode = step.interactionMode ? interactionModes.find((m) => m.id === step.interactionMode) : undefined;
              return (
                <div key={step.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {locale === "en" ? "Agent" : "智能体"} {step.seq}: {step.name || (locale === "en" ? "Untitled" : "未命名")}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {locale === "en" ? "Archetype" : "原型"}:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">{archetype ? archetype[locale].name : "—"}</strong>
                    {"  ·  "}
                    {locale === "en" ? "Mode" : "模式"}:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">{mode ? mode[locale].name : "—"}</strong>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-1 text-xs md:grid-cols-3">
                    <div>
                      <span className="text-zinc-500">{locale === "en" ? "Given" : "前置"}:</span> {step.inputs}
                    </div>
                    <div>
                      <span className="text-zinc-500">{locale === "en" ? "When" : "触发"}:</span> {step.description}
                    </div>
                    <div>
                      <span className="text-zinc-500">{locale === "en" ? "Then" : "结果"}:</span> {step.outputs}
                    </div>
                  </div>
                </div>
              );
            })}
            {workflow.steps.length === 0 && (
              <p className="text-xs text-zinc-500">
                {locale === "en" ? "No steps defined yet." : "尚未定义步骤。"}
              </p>
            )}
          </div>
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            3. {locale === "en" ? "Orchestration Design" : "编排设计"}
          </h2>
          <p className="mt-2 text-sm">
            {locale === "en" ? "Pattern: " : "模式: "}
            <strong>{pattern ? pattern[locale].name : "—"}</strong>
            {pattern && (
              <>
                {" · "}
                {pattern[locale].description}
              </>
            )}
          </p>
        </section>
      </article>
    </div>
  );
}

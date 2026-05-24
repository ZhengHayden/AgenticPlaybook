"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Project } from "@/content/sample-data";
import { archetypes } from "@/content/archetypes";
import { interactionModes } from "@/content/interactions";
import { a2aPatterns } from "@/content/a2a-patterns";
import { Download, Sparkles } from "lucide-react";

interface ArchitectureDocProps {
  project: Project;
}

export function ArchitectureDoc({ project }: ArchitectureDocProps) {
  const { locale } = useLocale();
  const [summary, setSummary] = useState<string>(
    locale === "en"
      ? "A 4-step agent architecture automates ACME's AP invoice match end-to-end. Three agents act autonomously on well-defined steps; the fourth runs in Guardian mode for irreversible GL posts. The pipeline pattern was selected to maximize throughput while preserving exception-routing flexibility at Step 3."
      : "由 4 个步骤构成的智能体架构端到端自动化 ACME 的 AP 发票匹配。前三个智能体在明确步骤上自主执行;第四个对不可逆的 GL 入账采用 Guardian 模式。选择流水线模式以最大化吞吐量,同时在步骤 3 保留异常路由的灵活性。",
  );

  const pattern = project.a2aPattern ? a2aPatterns.find((p) => p.id === project.a2aPattern) : undefined;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Agent Architecture Document · v0.3 draft" : "智能体架构文档 · v0.3 草稿"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {locale === "en"
              ? "Auto-assembled from prior tabs. Edit narrative; structured data is locked."
              : "从前序 Tab 自动汇编。可编辑叙述;结构化数据已锁定。"}
          </p>
        </div>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <Sparkles className="h-4 w-4" /> {locale === "en" ? "AI review" : "AI 评审"}
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            <Download className="h-4 w-4" /> {locale === "en" ? "Export PDF" : "导出 PDF"}
          </button>
        </div>
      </div>

      <article className="space-y-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <header>
          <h1 className="text-xl font-bold">
            {project.name} — {locale === "en" ? "Agent Architecture" : "智能体架构"}
          </h1>
        </header>

        <section>
          <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            1. {locale === "en" ? "Executive Summary" : "执行摘要"}
          </h2>
          <textarea
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="mt-2 w-full resize-y rounded-md border border-zinc-200 bg-white p-3 text-sm dark:border-zinc-800 dark:bg-zinc-950"
            rows={4}
          />
        </section>

        <section>
          <h2 className="border-b border-zinc-200 pb-1 text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:border-zinc-800">
            2. {locale === "en" ? "Agent Specifications" : "智能体规格"}
          </h2>
          <div className="mt-2 space-y-3">
            {project.workflowSteps.map((step) => {
              const archetype = step.archetype ? archetypes.find((a) => a.id === step.archetype) : undefined;
              const mode = step.interactionMode ? interactionModes.find((m) => m.id === step.interactionMode) : undefined;
              return (
                <div key={step.id} className="rounded-md border border-zinc-200 p-3 dark:border-zinc-800">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    {locale === "en" ? "Agent" : "智能体"} {step.seq}: {step.name}
                  </div>
                  <div className="mt-1 text-xs text-zinc-500">
                    {locale === "en" ? "Archetype" : "原型"}:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      {archetype ? archetype[locale].name : "—"}
                    </strong>
                    {"  ·  "}
                    {locale === "en" ? "Mode" : "模式"}:{" "}
                    <strong className="text-zinc-700 dark:text-zinc-300">
                      {mode ? mode[locale].name : "—"}
                    </strong>
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

        <section className="text-xs text-zinc-500">
          <p>
            {locale === "en" ? "(Sections 4–9 — HITL, Acceptance Criteria, MVP Scope, Risk Register, Handoff — auto-generate from prior tabs when exported.)" : "(第 4–9 节 — HITL、验收标准、MVP 范围、风险登记、移交 — 在导出时从前序 Tab 自动生成。)"}
          </p>
        </section>
      </article>
    </div>
  );
}

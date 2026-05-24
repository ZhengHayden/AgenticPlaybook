"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { WorkflowStep } from "@/content/sample-data";
import { a2aPatterns, type A2APatternId } from "@/content/a2a-patterns";
import { archetypes } from "@/content/archetypes";
import { ArrowRight } from "lucide-react";

interface OrchestrationPickerProps {
  steps: ReadonlyArray<WorkflowStep>;
  initialPattern?: A2APatternId;
}

export function OrchestrationPicker({ steps, initialPattern }: OrchestrationPickerProps) {
  const { locale } = useLocale();
  const [pattern, setPattern] = useState<A2APatternId>(initialPattern ?? "pipeline");
  const selected = a2aPatterns.find((p) => p.id === pattern);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-base font-semibold">
          {locale === "en" ? "Agent-to-Agent Orchestration Pattern" : "智能体之间编排模式"}
        </h2>
      </div>

      <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
        {a2aPatterns.map((p) => (
          <button
            key={p.id}
            onClick={() => setPattern(p.id)}
            className={
              p.id === pattern
                ? "rounded-xl border border-indigo-300 bg-indigo-50 p-3 text-left ring-2 ring-indigo-200 dark:border-indigo-700 dark:bg-indigo-950/30 dark:ring-indigo-900"
                : "rounded-xl border border-zinc-200 bg-white p-3 text-left hover:border-zinc-300 dark:border-zinc-800 dark:bg-zinc-900"
            }
          >
            <div className="text-sm font-semibold">{p[locale].name}</div>
            <p className="mt-1 text-xs text-zinc-500">{p[locale].description}</p>
          </button>
        ))}
      </div>

      {selected && (
        <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <h3 className="text-sm font-semibold">
            {locale === "en" ? "Why" : "为什么"} {selected[locale].name}?
          </h3>
          <p className="mt-1 text-xs text-zinc-500">{selected[locale].useWhen}</p>

          <div className="mt-4 flex flex-wrap items-center gap-2 rounded-md bg-zinc-50 p-4 dark:bg-zinc-950">
            {steps.map((step, idx) => {
              const archetype = step.archetype ? archetypes.find((a) => a.id === step.archetype) : undefined;
              return (
                <div key={step.id} className="flex items-center gap-2">
                  <div className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-xs dark:border-zinc-700 dark:bg-zinc-900">
                    {archetype && <span className="mr-1">{archetype.icon}</span>}
                    <span className="font-medium">{archetype ? archetype[locale].name : "?"}</span>
                    <span className="ml-1 text-zinc-400">· {locale === "en" ? "Step" : "步骤"} {step.seq}</span>
                  </div>
                  {idx < steps.length - 1 && <ArrowRight className="h-3.5 w-3.5 text-zinc-400" />}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

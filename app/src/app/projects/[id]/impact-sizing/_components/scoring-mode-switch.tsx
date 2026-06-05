"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { ScoringMode } from "@/content/sample-data";
import { SegTabs } from "@/components/ui/seg-tabs";

interface ScoringModeSwitchProps {
  projectId: string;
  mode: ScoringMode;
}

const T = {
  en: {
    label: "Score by",
    workflow: "Workflow",
    useCase: "Use case",
    notice: "Switching keeps the other mode's scores but ranks by the selected grain.",
  },
  zh: {
    label: "评分粒度",
    workflow: "工作流",
    useCase: "用例",
    notice: "切换会保留另一模式的评分,但按所选粒度排序。",
  },
};

/**
 * Per-project prioritization-grain toggle. Persists `project.scoringMode` and
 * refreshes so the scoring/portfolio server components re-read the new grain.
 */
export function ScoringModeSwitch({ projectId, mode }: ScoringModeSwitchProps) {
  const { locale } = useLocale();
  const t = T[locale];
  const { save, status } = useProjectSave(projectId);
  const [value, setValue] = useState<ScoringMode>(mode);

  const onChange = async (next: ScoringMode) => {
    if (next === value) return;
    setValue(next);
    await save({ scoringMode: next });
  };

  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{t.label}</span>
      <SegTabs<ScoringMode>
        value={value}
        onChange={onChange}
        tabs={[
          { value: "workflow", label: t.workflow },
          { value: "useCase", label: t.useCase },
        ]}
      />
      <span className="text-xs text-slate-400">
        {status === "saving" ? "…" : t.notice}
      </span>
    </div>
  );
}

"use client";

import { useLocale } from "@/lib/locale-context";
import type { ProjectUseCase } from "@/content/sample-data";
import { Button } from "@/components/ui/button";
import { Plus, X } from "lucide-react";

interface UseCaseIdeasPanelProps {
  /** Parent workflow these ideas belong to. */
  candidateId: string;
  useCases: ReadonlyArray<ProjectUseCase>;
  /** Receives the full next list (immutable); the host persists it. */
  onChange: (next: ProjectUseCase[]) => void;
}

function newId(): string {
  return `uc-${Math.random().toString(36).slice(2, 8)}`;
}

const T = {
  en: {
    title: "Use-case ideas",
    hint: "Discrete agentic opportunities within this workflow. Scored individually in use-case mode.",
    add: "Add use case",
    name: "Name",
    description: "Description",
    rationale: "Impact rationale",
    kpis: "Expected KPIs (comma-separated)",
    remove: "Remove",
    empty: "No use-case ideas yet.",
  },
  zh: {
    title: "用例想法",
    hint: "此工作流中的独立智能体机会。在用例模式下单独评分。",
    add: "添加用例",
    name: "名称",
    description: "描述",
    rationale: "影响理由",
    kpis: "预期 KPI(逗号分隔)",
    remove: "移除",
    empty: "暂无用例想法。",
  },
};

export function UseCaseIdeasPanel({ candidateId, useCases, onChange }: UseCaseIdeasPanelProps) {
  const { locale } = useLocale();
  const t = T[locale];

  const patchAt = (index: number, patch: Partial<ProjectUseCase>) => {
    onChange(useCases.map((uc, i) => (i === index ? { ...uc, ...patch } : uc)));
  };

  const addIdea = () => {
    onChange([
      ...useCases,
      { id: newId(), candidateId, name: "", description: "", impactRationale: "" },
    ]);
  };

  const removeAt = (index: number) => {
    onChange(useCases.filter((_, i) => i !== index));
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900/40">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-100">{t.title}</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">{t.hint}</p>
        </div>
        <Button variant="secondary" onClick={addIdea} className="shrink-0">
          <Plus className="h-4 w-4" />
          {t.add}
        </Button>
      </div>

      {useCases.length === 0 ? (
        <p className="py-2 text-sm text-slate-400">{t.empty}</p>
      ) : (
        <ul className="space-y-3">
          {useCases.map((uc, i) => (
            <li
              key={uc.id}
              className="rounded-md border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900"
            >
              <div className="flex items-start gap-2">
                <input
                  aria-label={t.name}
                  value={uc.name}
                  placeholder={t.name}
                  onChange={(e) => patchAt(i, { name: e.target.value })}
                  className="flex-1 rounded-md border border-slate-300 px-2 py-1 text-sm font-medium dark:border-slate-700 dark:bg-slate-950"
                />
                <Button
                  variant="ghost"
                  aria-label={t.remove}
                  onClick={() => removeAt(i)}
                  className="shrink-0 px-2 text-rose-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <textarea
                aria-label={t.description}
                value={uc.description}
                placeholder={t.description}
                rows={2}
                onChange={(e) => patchAt(i, { description: e.target.value })}
                className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <textarea
                aria-label={t.rationale}
                value={uc.impactRationale}
                placeholder={t.rationale}
                rows={2}
                onChange={(e) => patchAt(i, { impactRationale: e.target.value })}
                className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
              <input
                aria-label={t.kpis}
                value={(uc.expectedKpis ?? []).join(", ")}
                placeholder={t.kpis}
                onChange={(e) => {
                  const kpis = e.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean);
                  patchAt(i, { expectedKpis: kpis.length > 0 ? kpis : undefined });
                }}
                className="mt-2 w-full rounded-md border border-slate-300 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
              />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

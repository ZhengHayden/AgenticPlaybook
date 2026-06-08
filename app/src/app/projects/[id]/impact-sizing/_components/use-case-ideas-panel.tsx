"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ProjectUseCase } from "@/content/sample-data";
import { Plus, Pencil, Trash2 } from "lucide-react";

interface UseCaseIdeasPanelProps {
  /** Parent workflow these ideas belong to. */
  candidateId: string;
  useCases: ReadonlyArray<ProjectUseCase>;
  /** Receives the full next list (immutable); the host persists it. */
  onChange: (next: ProjectUseCase[]) => void;
  /** Display-only: render names as text with no add/edit/delete controls. */
  readOnly?: boolean;
}

function newId(): string {
  return `uc-${Math.random().toString(36).slice(2, 8)}`;
}

const T = {
  en: {
    title: "Use cases",
    hint: "Discrete agentic opportunities within this workflow. Scored individually in use-case mode.",
    add: "Add use case",
    name: "Name",
    description: "Description",
    rationale: "Impact rationale",
    kpis: "Expected KPIs (comma-separated)",
    remove: "Remove",
    edit: "Edit use case",
    done: "Done",
    empty: "No use-case ideas yet.",
    untitled: "Untitled",
  },
  zh: {
    title: "用例",
    hint: "此工作流中的独立智能体机会。在用例模式下单独评分。",
    add: "添加用例",
    name: "名称",
    description: "描述",
    rationale: "影响理由",
    kpis: "预期 KPI(逗号分隔)",
    remove: "移除",
    edit: "编辑用例",
    done: "完成",
    empty: "暂无用例想法。",
    untitled: "未命名",
  },
};

const iconButtonClass =
  "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border text-ink-muted hover:bg-surface-muted";

/**
 * Compact, always-visible list of a workflow's use-case ideas. Each idea shows
 * an inline name plus small icon buttons to edit its details or delete it; a
 * single add button appends a new idea. Pure and immutable — edits return new
 * arrays and call `onChange`; the host persists.
 */
export function UseCaseIdeasPanel({
  candidateId,
  useCases,
  onChange,
  readOnly = false,
}: UseCaseIdeasPanelProps) {
  const { locale } = useLocale();
  const t = T[locale];
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (readOnly) {
    return (
      <section>
        <div className="mb-1">
          <span className="eyebrow">{t.title}</span>
        </div>
        {useCases.length === 0 ? (
          <p className="text-xs text-ink-faint">{t.empty}</p>
        ) : (
          <ul className="list-disc space-y-0.5 pl-5 text-sm text-ink-muted">
            {useCases.map((uc) => (
              <li key={uc.id}>{uc.name || t.untitled}</li>
            ))}
          </ul>
        )}
      </section>
    );
  }

  const patchAt = (index: number, patch: Partial<ProjectUseCase>) => {
    onChange(useCases.map((uc, i) => (i === index ? { ...uc, ...patch } : uc)));
  };

  const addIdea = () => {
    onChange([
      ...useCases,
      { id: newId(), candidateId, name: "", description: "", impactRationale: "" },
    ]);
    setOpenIdx(useCases.length);
  };

  const removeAt = (index: number) => {
    onChange(useCases.filter((_, i) => i !== index));
    setOpenIdx(null);
  };

  return (
    <section>
      <div className="mb-1 flex items-center justify-between gap-2">
        <span className="eyebrow">{t.title}</span>
        <button
          type="button"
          aria-label={t.add}
          title={t.add}
          onClick={addIdea}
          className={iconButtonClass}
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {useCases.length === 0 ? (
        <p className="text-xs text-ink-faint">{t.empty}</p>
      ) : (
        <ul className="space-y-1.5">
          {useCases.map((uc, i) => {
            const open = openIdx === i;
            return (
              <li
                key={uc.id}
                className="rounded-lg border border-border bg-surface p-2"
              >
                <div className="flex items-center gap-2">
                  {open ? (
                    <input
                      aria-label={t.name}
                      value={uc.name}
                      placeholder={t.name}
                      onChange={(e) => patchAt(i, { name: e.target.value })}
                      className="flex-1 rounded-md border border-border bg-surface px-2 py-1 text-sm font-medium"
                    />
                  ) : (
                    <span className="flex-1 truncate text-sm font-medium text-foreground">
                      {uc.name || t.untitled}
                    </span>
                  )}
                  <button
                    type="button"
                    aria-label={open ? t.done : t.edit}
                    title={open ? t.done : t.edit}
                    onClick={() => setOpenIdx(open ? null : i)}
                    className={open ? `${iconButtonClass} bg-surface-muted` : iconButtonClass}
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    aria-label={t.remove}
                    title={t.remove}
                    onClick={() => removeAt(i)}
                    className={`${iconButtonClass} hover:text-danger`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
                {open && (
                  <div className="mt-2 space-y-2">
                    <textarea
                      aria-label={t.description}
                      value={uc.description}
                      placeholder={t.description}
                      rows={2}
                      onChange={(e) => patchAt(i, { description: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm"
                    />
                    <textarea
                      aria-label={t.rationale}
                      value={uc.impactRationale}
                      placeholder={t.rationale}
                      rows={2}
                      onChange={(e) => patchAt(i, { impactRationale: e.target.value })}
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm"
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
                      className="w-full rounded-md border border-border bg-surface px-2 py-1 text-sm"
                    />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

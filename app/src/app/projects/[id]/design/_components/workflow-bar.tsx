"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import type { Candidate, Workflow } from "@/content/sample-data";
import { useProjectSave } from "@/lib/use-project-save";
import { AddWorkflowModal } from "./add-workflow-modal";
import { Plus, Trash2 } from "lucide-react";

interface WorkflowBarProps {
  projectId: string;
  workflows: ReadonlyArray<Workflow>;
  candidates: ReadonlyArray<Candidate>;
  variant: "A" | "B" | "C";
}

const variantNames: Record<"A" | "B" | "C", { en: string; zh: string }> = {
  A: { en: "Variant A — Taxonomy-First", zh: "方案 A — 分类法优先" },
  B: { en: "Variant B — Decision-Tree", zh: "方案 B — 决策树" },
  C: { en: "Variant C — Sprint Dual-Track", zh: "方案 C — 双轨冲刺" },
};

const TAB_KEYS = ["workflow", "archetypes", "interactions", "orchestration", "hitl", "gate"] as const;

export function WorkflowBar({ projectId, workflows, candidates, variant }: WorkflowBarProps) {
  const { t, locale } = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { save } = useProjectSave(projectId);
  const [showAdd, setShowAdd] = useState(false);

  const base = `/projects/${projectId}/design`;
  const requestedId = searchParams.get("w");
  const selected = workflows.find((w) => w.id === requestedId) ?? workflows[0];
  const selectedId = selected?.id;
  const wQuery = selectedId ? `?w=${selectedId}` : "";

  const onSelectWorkflow = (id: string) => {
    const sep = pathname.includes("?") ? "&" : "?";
    router.push(`${pathname}${sep}w=${id}`);
  };

  const onDeleteWorkflow = async () => {
    if (!selected) return;
    const confirmed = window.confirm(
      locale === "en"
        ? `Delete workflow "${selected.name}"? This cannot be undone.`
        : `删除工作流「${selected.name}」?此操作不可撤销。`,
    );
    if (!confirmed) return;
    const next = workflows.filter((w) => w.id !== selected.id);
    await save({ workflows: next });
    const fallback = next[0]?.id;
    router.push(`${base}/workflow${fallback ? `?w=${fallback}` : ""}`);
  };

  const tabLabel = (key: string): string =>
    (t.design[key as keyof typeof t.design] as string) ?? key;

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{t.phases.design}</h1>
        <span className="text-xs text-zinc-500">{variantNames[variant][locale]}</span>
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <label className="text-xs text-zinc-500">{locale === "en" ? "Workflow" : "工作流"}</label>
        <select
          value={selectedId ?? ""}
          onChange={(e) => onSelectWorkflow(e.target.value)}
          disabled={workflows.length === 0}
          className="rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        >
          {workflows.length === 0 && <option value="">{locale === "en" ? "No workflows" : "无工作流"}</option>}
          {workflows.map((w) => (
            <option key={w.id} value={w.id}>
              {w.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          <Plus className="h-3.5 w-3.5" /> {locale === "en" ? "Add workflow" : "添加工作流"}
        </button>
        {selected && (
          <button
            type="button"
            onClick={onDeleteWorkflow}
            aria-label={locale === "en" ? "Delete workflow" : "删除工作流"}
            className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-2 py-1 text-xs text-zinc-500 hover:text-rose-600 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:text-rose-400"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <nav className="mt-2 flex flex-wrap gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {TAB_KEYS.map((key) => {
          const href = `${base}/${key}`;
          const active = pathname.startsWith(href);
          return (
            <Link
              key={key}
              href={`${href}${wQuery}`}
              className={cn(
                "border-b-2 px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-indigo-600 text-zinc-900 dark:text-zinc-50"
                  : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
              )}
            >
              {tabLabel(key)}
            </Link>
          );
        })}
      </nav>

      {showAdd && (
        <AddWorkflowModal
          projectId={projectId}
          workflows={workflows}
          candidates={candidates}
          onClose={() => setShowAdd(false)}
          onAdded={(id) => router.push(`${base}/workflow?w=${id}`)}
        />
      )}
    </div>
  );
}

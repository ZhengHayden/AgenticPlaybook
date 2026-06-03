"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate, Project, Workflow, WorkflowStatus } from "@/content/sample-data";
import { rankWorkflows, type RankedWorkflow } from "@/content/workflow-priority";
import { quadrants, type QuadrantId } from "@/content/funnel-rubric";
import { isDesignEligible, SOLUTION_LABELS } from "@/content/solution-proposal";
import { AddWorkflowModal } from "@/app/projects/[id]/design/_components/add-workflow-modal";
import { ArrowRight, Plus, Search, Trash2 } from "lucide-react";

interface WorkflowPortfolioProps {
  project: Project;
}

// Static badge classes per quadrant (Tailwind cannot purge-safely interpolate).
const quadrantBadge: Record<QuadrantId, string> = {
  quickWin: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  sponsorAlign: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  investProve: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  deferMature: "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300",
};

const WORKFLOW_STATUSES: ReadonlyArray<WorkflowStatus> = [
  "notStarted",
  "inDesign",
  "built",
  "live",
  "onHold",
];

const statusLabel: Record<WorkflowStatus, { en: string; zh: string }> = {
  notStarted: { en: "Not started", zh: "未开始" },
  inDesign: { en: "In design", zh: "设计中" },
  built: { en: "Built", zh: "已构建" },
  live: { en: "Live", zh: "上线" },
  onHold: { en: "On hold", zh: "暂停" },
};

interface Completeness {
  stepsDesigned: number;
  totalSteps: number;
  hitlCount: number;
  orchestrationSet: boolean;
}

function assess(workflow: Workflow): Completeness {
  const stepsDesigned = workflow.steps.filter((s) => s.archetype && s.interactionMode).length;
  const hitlCount = workflow.steps.filter(
    (s) => s.hitl && (s.hitl.trigger || s.hitl.sla || s.hitl.escalation),
  ).length;
  return {
    stepsDesigned,
    totalSteps: workflow.steps.length,
    hitlCount,
    orchestrationSet: Boolean(workflow.a2aPattern),
  };
}

export function WorkflowPortfolio({ project }: WorkflowPortfolioProps) {
  const { locale } = useLocale();
  const { status, error, save } = useProjectSave(project.id);
  const [showAdd, setShowAdd] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | WorkflowStatus>("all");

  const ranked: RankedWorkflow[] = rankWorkflows(project.workflows, project.candidates);
  const deleting = status === "saving";

  const candidateById = useMemo(
    () => new Map<string, Candidate>(project.candidates.map((c) => [c.id, c])),
    [project.candidates],
  );
  const linkedIds = new Set(
    project.workflows.map((w) => w.candidateId).filter((id): id is string => Boolean(id)),
  );
  const eligibleUnlinked = project.candidates.filter(
    (c) => isDesignEligible(c) && !linkedIds.has(c.id),
  );

  // Filter the ranked roadmap by free-text (name/function/owners) + status.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return ranked.filter(({ workflow }) => {
      if (statusFilter !== "all" && (workflow.status ?? "notStarted") !== statusFilter) return false;
      if (!q) return true;
      const cand = workflow.candidateId ? candidateById.get(workflow.candidateId) : undefined;
      const haystack = [workflow.name, cand?.businessFunction, cand?.agentOwner, cand?.processOwner]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [ranked, query, statusFilter, candidateById]);

  const onStatusChange = async (workflow: Workflow, next: WorkflowStatus) => {
    await save({
      workflows: project.workflows.map((w) => (w.id === workflow.id ? { ...w, status: next } : w)),
    });
  };

  const onDelete = async (workflow: Workflow) => {
    const confirmed = window.confirm(
      locale === "en"
        ? `Delete workflow "${workflow.name}"? Its steps, orchestration, and HITL design will be removed.`
        : `删除工作流「${workflow.name}」?其步骤、编排与 HITL 设计将被移除。`,
    );
    if (!confirmed) return;
    setDeletingId(workflow.id);
    await save({ workflows: project.workflows.filter((w) => w.id !== workflow.id) });
    setDeletingId(null);
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">
            {locale === "en" ? "Agentic Roadmap" : "智能体路线图"}
          </h2>
          <p className="mt-0.5 text-xs text-zinc-500">
            {locale === "en"
              ? "Workflows ranked by their origin candidate's Priority Score."
              : "按来源候选的优先级评分排序的工作流。"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus className="h-4 w-4" /> {locale === "en" ? "Add workflow" : "添加工作流"}
        </button>
      </div>

      {error && (
        <p className="mt-2 rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      {eligibleUnlinked.length > 0 && (
        <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-900/50 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-sm font-semibold text-emerald-800 dark:text-emerald-200">
              {locale === "en" ? "Design-eligible candidates" : "可进入 Design 的候选"}
            </h3>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="shrink-0 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-zinc-900 dark:text-emerald-300"
            >
              {locale === "en" ? "Promote to Design" : "提升到 Design"}
            </button>
          </div>
          <p className="mt-1 text-xs text-emerald-700/80 dark:text-emerald-300/80">
            {locale === "en"
              ? "Decided RPA or Agent in Impact-Sizing and not yet linked to a workflow."
              : "在影响力评估中被定为 RPA 或 Agent,且尚未关联到工作流。"}
          </p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {eligibleUnlinked.map((cand) => (
              <li
                key={cand.id}
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs dark:border-emerald-900/50 dark:bg-zinc-900"
              >
                <span className="font-medium">{cand.name}</span>
                {cand.solutionProposal && (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {SOLUTION_LABELS[cand.solutionProposal][locale]}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {ranked.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[12rem]">
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-zinc-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === "en"
                  ? "Filter by name, function, or owner…"
                  : "按名称、职能或负责人筛选…"
              }
              className="w-full rounded-md border border-zinc-200 bg-white py-1.5 pl-8 pr-3 text-sm dark:border-zinc-700 dark:bg-zinc-950"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | WorkflowStatus)}
            aria-label={locale === "en" ? "Filter by status" : "按状态筛选"}
            className="rounded-md border border-zinc-200 bg-white px-2 py-1.5 text-sm dark:border-zinc-700 dark:bg-zinc-950"
          >
            <option value="all">{locale === "en" ? "All statuses" : "全部状态"}</option>
            {WORKFLOW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s][locale]}
              </option>
            ))}
          </select>
          <span className="text-xs text-zinc-500">
            {locale === "en"
              ? `${filtered.length} of ${ranked.length}`
              : `${ranked.length} 个中 ${filtered.length} 个`}
          </span>
        </div>
      )}

      {ranked.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">
            {locale === "en"
              ? "No workflows yet. Promote a prioritized candidate or add a blank workflow to begin design."
              : "尚无工作流。提升一个已优先级排序的候选,或添加空白工作流以开始设计。"}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-zinc-300 bg-white p-8 text-center dark:border-zinc-700 dark:bg-zinc-900">
          <p className="text-sm text-zinc-500">
            {locale === "en" ? "No workflows match your filter." : "没有符合筛选条件的工作流。"}
          </p>
        </div>
      ) : (
        <ul className="mt-3 space-y-2">
          {filtered.map(({ workflow, rank, score }) => {
            const quadrant = score ? quadrants.find((q) => q.id === score.quadrant) : undefined;
            const c = assess(workflow);
            const cand = workflow.candidateId ? candidateById.get(workflow.candidateId) : undefined;
            return (
              <li
                key={workflow.id}
                className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
              >
                <span className="w-6 shrink-0 text-center text-lg font-semibold tabular-nums text-zinc-400">
                  {rank}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate font-medium">{workflow.name}</span>
                    {quadrant && (
                      <span
                        className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge[quadrant.id]}`}
                      >
                        {quadrant.shortName[locale]}
                      </span>
                    )}
                    {!workflow.candidateId && (
                      <span className="shrink-0 rounded-md bg-zinc-100 px-2 py-0.5 text-xs text-zinc-500 dark:bg-zinc-800">
                        {locale === "en" ? "Manual" : "手动"}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <MetaChip label={locale === "en" ? "Function" : "职能"} value={cand?.businessFunction} />
                    <MetaChip label={locale === "en" ? "Expected" : "预计完成"} value={cand?.targetCompletionDate} />
                    <MetaChip label={locale === "en" ? "Agent owner" : "智能体负责人"} value={cand?.agentOwner} />
                    <MetaChip label={locale === "en" ? "Process owner" : "流程负责人"} value={cand?.processOwner} />
                  </div>
                  <div className="mt-1 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-zinc-500">
                    <span>
                      {locale === "en" ? "Steps" : "步骤"}: {c.stepsDesigned}/{c.totalSteps}{" "}
                      {locale === "en" ? "designed" : "已设计"}
                    </span>
                    <span>
                      {locale === "en" ? "HITL" : "人工介入"}: {c.hitlCount}
                    </span>
                    <span>
                      {locale === "en" ? "Orchestration" : "编排"}:{" "}
                      {c.orchestrationSet ? (locale === "en" ? "set" : "已设置") : "—"}
                    </span>
                  </div>
                  <label className="mt-2 inline-flex items-center gap-1.5 text-xs text-zinc-500">
                    <span>{locale === "en" ? "Status" : "状态"}:</span>
                    <select
                      value={workflow.status ?? "notStarted"}
                      onChange={(e) => onStatusChange(workflow, e.target.value as WorkflowStatus)}
                      disabled={deleting}
                      className="rounded border border-zinc-200 bg-white px-1.5 py-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-950"
                    >
                      {WORKFLOW_STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {statusLabel[s][locale]}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="shrink-0 text-right">
                  <div className="text-xs text-zinc-400">{locale === "en" ? "Priority" : "优先级"}</div>
                  <div className="tabular-nums text-lg font-semibold">
                    {score ? score.priorityScore.toFixed(2) : "—"}
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={`/projects/${project.id}/design/workflow?w=${workflow.id}`}
                    className="inline-flex items-center gap-1 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:text-indigo-400 dark:hover:bg-zinc-800"
                  >
                    {locale === "en" ? "Open in Design" : "进入设计"} <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onDelete(workflow)}
                    disabled={deleting && deletingId === workflow.id}
                    aria-label={locale === "en" ? `Delete ${workflow.name}` : `删除 ${workflow.name}`}
                    className="rounded-md border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900/50 dark:bg-zinc-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {showAdd && (
        <AddWorkflowModal
          projectId={project.id}
          workflows={project.workflows}
          candidates={project.candidates}
          onClose={() => setShowAdd(false)}
        />
      )}
    </section>
  );
}

interface MetaChipProps {
  label: string;
  value?: string;
}

/** A labeled metadata pill surfacing candidate ownership/timeline next to the workflow name. */
function MetaChip({ label, value }: MetaChipProps) {
  const has = Boolean(value && value.trim());
  return (
    <span
      className={
        "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-xs " +
        (has
          ? "border-zinc-200 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-800/60"
          : "border-dashed border-zinc-200 bg-transparent dark:border-zinc-800")
      }
    >
      <span className="text-[10px] font-medium uppercase tracking-wide text-zinc-400">{label}</span>
      <span className={has ? "font-medium text-zinc-700 dark:text-zinc-200" : "text-zinc-400"}>
        {has ? value : "—"}
      </span>
    </span>
  );
}

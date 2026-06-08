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
// Mapped to the reference priority-quadrant tokens: q1 Quick Win (green),
// q2 Sponsor & Align (blue), q3 Invest & Prove (amber), q4 Defer (slate).
const quadrantBadge: Record<QuadrantId, string> = {
  quickWin: "bg-q1-soft text-q1",
  sponsorAlign: "bg-q2-soft text-q2",
  investProve: "bg-q3-soft text-q3",
  deferMature: "bg-q4-soft text-q4",
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
          <h2 className="font-display text-lg font-semibold tracking-tight">
            {locale === "en" ? "Agentic Roadmap" : "智能体路线图"}
          </h2>
          <p className="mt-0.5 text-xs text-ink-muted">
            {locale === "en"
              ? "Workflows ranked by their origin candidate's Priority Score."
              : "按来源候选的优先级评分排序的工作流。"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="inline-flex items-center gap-1.5 rounded-lg bg-accent-violet px-3.5 py-2 text-sm font-semibold text-white transition hover:opacity-90"
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
              className="shrink-0 rounded-md border border-emerald-300 bg-white px-2 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-slate-900 dark:text-emerald-300"
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
                className="inline-flex items-center gap-1.5 rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs dark:border-emerald-900/50 dark:bg-slate-900"
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
            <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                locale === "en"
                  ? "Filter by name, function, or owner…"
                  : "按名称、职能或负责人筛选…"
              }
              className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-sm dark:border-slate-700 dark:bg-slate-950"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as "all" | WorkflowStatus)}
            aria-label={locale === "en" ? "Filter by status" : "按状态筛选"}
            className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
          >
            <option value="all">{locale === "en" ? "All statuses" : "全部状态"}</option>
            {WORKFLOW_STATUSES.map((s) => (
              <option key={s} value={s}>
                {statusLabel[s][locale]}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500">
            {locale === "en"
              ? `${filtered.length} of ${ranked.length}`
              : `${ranked.length} 个中 ${filtered.length} 个`}
          </span>
        </div>
      )}

      {ranked.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            {locale === "en"
              ? "No workflows yet. Promote a prioritized candidate or add a blank workflow to begin design."
              : "尚无工作流。提升一个已优先级排序的候选,或添加空白工作流以开始设计。"}
          </p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mt-3 rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
          <p className="text-sm text-slate-500">
            {locale === "en" ? "No workflows match your filter." : "没有符合筛选条件的工作流。"}
          </p>
        </div>
      ) : (
        <div className="mt-3 overflow-x-auto rounded-xl border border-border bg-surface">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-surface-muted/50 text-left text-xs uppercase tracking-wide text-ink-faint">
              <tr>
                <th className="w-8 px-3 py-2 font-medium">#</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Function" : "职能"}</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Workflow" : "工作流"}</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Agent owner" : "智能体负责人"}</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Process owner" : "流程负责人"}</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Status" : "状态"}</th>
                <th className="px-3 py-2 font-medium">{locale === "en" ? "Prioritization" : "优先级排序"}</th>
                <th className="px-3 py-2 font-medium">
                  <span className="sr-only">{locale === "en" ? "Actions" : "操作"}</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(({ workflow, rank, score }) => {
                const quadrant = score ? quadrants.find((q) => q.id === score.quadrant) : undefined;
                const c = assess(workflow);
                const cand = workflow.candidateId
                  ? candidateById.get(workflow.candidateId)
                  : undefined;
                return (
                  <tr
                    key={workflow.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  >
                    <td className="px-3 py-3 text-center font-semibold tabular-nums text-slate-400">
                      {rank}
                    </td>
                    <td className="px-3 py-3">
                      {cand?.businessFunction ? (
                        <span
                          className="max-w-[10rem] truncate text-xs font-medium"
                          title={cand.businessFunction}
                        >
                          {cand.businessFunction}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{workflow.name}</span>
                        {quadrant && (
                          <span
                            className={`shrink-0 rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge[quadrant.id]}`}
                          >
                            {quadrant.shortName[locale]}
                          </span>
                        )}
                        {!workflow.candidateId && (
                          <span className="shrink-0 rounded-md bg-slate-100 px-2 py-0.5 text-xs text-slate-500 dark:bg-slate-800">
                            {locale === "en" ? "Manual" : "手动"}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-slate-500">
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
                        <span>
                          {locale === "en" ? "Expected" : "预计完成"}:{" "}
                          {cand?.targetCompletionDate ?? "—"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {cand?.agentOwner ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-600 dark:text-slate-300">
                      {cand?.processOwner ?? "—"}
                    </td>
                    <td className="px-3 py-3">
                      <label className="inline-flex items-center gap-1.5 text-xs text-slate-500">
                        <span className="sr-only">{locale === "en" ? "Status" : "状态"}</span>
                        <select
                          value={workflow.status ?? "notStarted"}
                          onChange={(e) =>
                            onStatusChange(workflow, e.target.value as WorkflowStatus)
                          }
                          disabled={deleting}
                          aria-label={locale === "en" ? "Status" : "状态"}
                          className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-xs dark:border-slate-700 dark:bg-slate-950"
                        >
                          {WORKFLOW_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {statusLabel[s][locale]}
                            </option>
                          ))}
                        </select>
                      </label>
                    </td>
                    <td className="px-3 py-3">
                      <span className="text-lg font-semibold tabular-nums">
                        {score ? score.priorityScore.toFixed(2) : "—"}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/projects/${project.id}/design/workflow?w=${workflow.id}`}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-indigo-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-indigo-400 dark:hover:bg-slate-800"
                        >
                          {locale === "en" ? "Open in Design" : "进入设计"}{" "}
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Link>
                        <button
                          type="button"
                          onClick={() => onDelete(workflow)}
                          disabled={deleting && deletingId === workflow.id}
                          aria-label={
                            locale === "en" ? `Delete ${workflow.name}` : `删除 ${workflow.name}`
                          }
                          className="rounded-md border border-rose-200 bg-white p-1.5 text-rose-600 hover:bg-rose-50 disabled:opacity-40 dark:border-rose-900/50 dark:bg-slate-900 dark:text-rose-400 dark:hover:bg-rose-950/30"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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

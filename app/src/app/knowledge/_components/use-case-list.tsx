"use client";

import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  LibraryWorkflow,
} from "@/content/knowledge";
import type { TechTag, ValidationStatus } from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { Star } from "lucide-react";
import { StatusChip, type ChipState } from "@/components/ui/status-chip";
import { cn } from "@/lib/utils";
import { UseCaseCard } from "./use-case-card";
import { localized, maturityLabel, validationDotClass, validationLabel } from "./display";

export type LibraryView = "grouped" | "cards" | "table";

/** Validation status → semantic chip state. */
const VALIDATION_STATE: Record<ValidationStatus, ChipState> = {
  validated: "ready",
  partial: "warn",
  notYet: "neutral",
};

/** Per-category pill tint (ring-inset, mirrors the reference mock-up). */
const TECH_PILL: Record<TechTag, string> = {
  "AI/ML": "bg-blue-50 text-blue-700 ring-blue-200 dark:bg-blue-950/30 dark:text-blue-300 dark:ring-blue-900/50",
  GenAI: "bg-violet-50 text-violet-700 ring-violet-200 dark:bg-violet-950/30 dark:text-violet-300 dark:ring-violet-900/50",
  Analytics: "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:ring-emerald-900/50",
  Optimization: "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900/50",
};

function TechPill({ tag }: { tag: TechTag }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs ring-1 ring-inset",
        TECH_PILL[tag],
      )}
    >
      {tag}
    </span>
  );
}

interface UseCaseListProps {
  view: LibraryView;
  library: KnowledgeLibrary;
  useCases: KnowledgeUseCase[];
  counts?: Record<string, number>;
  onView: (useCase: KnowledgeUseCase) => void;
  onEdit: (useCase: KnowledgeUseCase) => void;
  onDelete: (useCase: KnowledgeUseCase) => void;
}

export function UseCaseList({ view, library, useCases, counts, onView, onEdit, onDelete }: UseCaseListProps) {
  const { t } = useLocale();

  if (useCases.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 py-16 text-center text-sm text-slate-500 dark:border-slate-700">
        {t.knowledge.noResults}
      </div>
    );
  }

  if (view === "cards") {
    return (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {useCases.map((uc) => (
          <UseCaseCard key={uc.id} useCase={uc} onView={onView} onEdit={onEdit} onDelete={onDelete} />
        ))}
      </div>
    );
  }

  if (view === "table") {
    return <UseCaseTable useCases={useCases} library={library} counts={counts} onView={onView} />;
  }

  return <GroupedView library={library} useCases={useCases} counts={counts} onView={onView} />;
}

// ─── grouped view: Function → Workflow → Use Case ─────────────
interface GroupedProps {
  library: KnowledgeLibrary;
  useCases: KnowledgeUseCase[];
  counts?: Record<string, number>;
  onView: (useCase: KnowledgeUseCase) => void;
}

function GroupedView({ library, useCases, counts, onView }: GroupedProps) {
  const { t, locale } = useLocale();
  const byId = new Set(useCases.map((uc) => uc.id));
  const visible = library.useCases.filter((uc) => byId.has(uc.id));

  const functions = library.functions
    .filter((fn) => visible.some((uc) => uc.functionId === fn.id))
    .sort((a, b) => a.sort - b.sort);

  return (
    <div className="space-y-5">
      {functions.map((fn) => (
        <FunctionGroup
          key={fn.id}
          workflows={library.workflows.filter((w) => w.functionId === fn.id)}
          useCases={visible.filter((uc) => uc.functionId === fn.id)}
          counts={counts}
          onView={onView}
          fnLabel={localized(fn.name, locale)}
          statusLabel={(uc) => validationLabel(t, uc.validation.status)}
        />
      ))}
    </div>
  );
}

interface FunctionGroupProps {
  workflows: LibraryWorkflow[];
  useCases: KnowledgeUseCase[];
  counts?: Record<string, number>;
  onView: (useCase: KnowledgeUseCase) => void;
  fnLabel: string;
  statusLabel: (uc: KnowledgeUseCase) => string;
}

function FunctionGroup({ workflows, useCases, counts, onView, fnLabel, statusLabel }: FunctionGroupProps) {
  const wfs = workflows
    .filter((w) => useCases.some((uc) => uc.workflowId === w.id))
    .sort((a, b) => a.sort - b.sort);

  return (
    <section className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
      <header className="flex items-center gap-2 border-b border-slate-200 border-l-[3px] border-l-brand-600 bg-slate-50 px-4 py-2.5 dark:border-slate-800 dark:bg-slate-800/40">
        <h3 className="text-[13px] font-bold uppercase tracking-wide text-slate-700 dark:text-slate-200">
          {fnLabel}
        </h3>
        <span className="rounded-full bg-brand-100 px-1.5 text-[10px] font-bold tabular-nums text-brand-700 dark:bg-brand-800/40 dark:text-brand-300">
          {useCases.length}
        </span>
      </header>
      <div className="divide-y divide-slate-100 dark:divide-slate-800">
        {wfs.map((wf) => (
          <div key={wf.id} className="px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-400 dark:bg-slate-500" aria-hidden="true" />
              {wf.name}
            </p>
            <ul className="mt-2 space-y-1.5">
              {useCases
                .filter((uc) => uc.workflowId === wf.id)
                .map((uc) => (
                  <li key={uc.id}>
                    <button
                      type="button"
                      onClick={() => onView(uc)}
                      className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    >
                      <span
                        className={cn("h-2 w-2 shrink-0 rounded-full", validationDotClass(uc.validation.status))}
                        title={statusLabel(uc)}
                      />
                      <span className="font-medium text-slate-700 dark:text-slate-200">{uc.name}</span>
                      {counts?.[uc.id] ? (
                        <span className="ml-1 rounded-full bg-brand-50 px-1.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-800/40 dark:text-brand-300">
                          ◆ {counts[uc.id]}
                        </span>
                      ) : null}
                      <span className="text-xs text-slate-400">{uc.domain}</span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

// ─── table view ───────────────────────────────────────────────
interface TableProps {
  useCases: KnowledgeUseCase[];
  library: KnowledgeLibrary;
  counts?: Record<string, number>;
  onView: (useCase: KnowledgeUseCase) => void;
}

function UseCaseTable({ useCases, library, counts, onView }: TableProps) {
  const { t, locale } = useLocale();
  const fnName = (id: string) => {
    const fn = library.functions.find((f) => f.id === id);
    return fn ? localized(fn.name, locale) : "—";
  };

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <table className="w-full min-w-[760px] text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500 dark:bg-slate-950/50">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.knowledge.colUseCase}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.knowledge.colTech}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.knowledge.colMaturity}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.knowledge.colOwner}</th>
            <th scope="col" className="px-4 py-2.5 font-medium">{t.knowledge.colStatus}</th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">{t.knowledge.artifacts}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {useCases.map((uc) => {
            const validated = uc.validation.status === "validated";
            return (
              <tr
                key={uc.id}
                className="cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
                onClick={() => onView(uc)}
              >
                <td className="px-4 py-3">
                  <div className="flex items-start gap-2">
                    <Star
                      className={cn(
                        "mt-0.5 h-4 w-4 shrink-0",
                        validated ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600",
                      )}
                      aria-hidden
                    />
                    <div className="min-w-0">
                      <div className="truncate font-medium text-slate-900 dark:text-slate-100">{uc.name}</div>
                      {uc.domain && (
                        <div className="mt-0.5 truncate text-xs text-slate-500">{uc.domain}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <TechPill tag={uc.techTag} />
                </td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{maturityLabel(t, uc.maturity)}</td>
                <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                  <span
                    className="block max-w-[14rem] truncate"
                    title={uc.sponsors?.trim() || fnName(uc.functionId)}
                  >
                    {uc.sponsors?.trim() || fnName(uc.functionId)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <StatusChip state={VALIDATION_STATE[uc.validation.status]} size="sm">
                    {validationLabel(t, uc.validation.status)}
                  </StatusChip>
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-slate-600 dark:text-slate-400">
                  {counts?.[uc.id] ?? 0}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

"use client";

import type {
  KnowledgeLibrary,
  KnowledgeUseCase,
  LibraryWorkflow,
} from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UseCaseCard } from "./use-case-card";
import { localized, maturityLabel, validationDotClass, validationLabel } from "./display";

export type LibraryView = "grouped" | "cards" | "table";

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
  const wfName = (id: string) => library.workflows.find((w) => w.id === id)?.name ?? "—";

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 dark:border-slate-800">
      <table className="w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:bg-slate-800/50">
          <tr>
            <th className="px-4 py-2.5">{t.knowledge.colUseCase}</th>
            <th className="px-4 py-2.5">{t.knowledge.colFunction}</th>
            <th className="px-4 py-2.5">{t.knowledge.colWorkflow}</th>
            <th className="px-4 py-2.5">{t.knowledge.colMaturity}</th>
            <th className="px-4 py-2.5">{t.knowledge.colTech}</th>
            <th className="px-4 py-2.5">{t.knowledge.colStatus}</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {useCases.map((uc) => (
            <tr
              key={uc.id}
              className="cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/60"
              onClick={() => onView(uc)}
            >
              <td className="px-4 py-2.5">
                <div className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-200">
                  {uc.name}
                  {counts?.[uc.id] ? (
                    <span className="ml-1 rounded-full bg-brand-50 px-1.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-800/40 dark:text-brand-300">
                      ◆ {counts[uc.id]}
                    </span>
                  ) : null}
                </div>
                <div className="text-xs text-slate-400">{uc.domain}</div>
              </td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{fnName(uc.functionId)}</td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{wfName(uc.workflowId)}</td>
              <td className="px-4 py-2.5 text-slate-600 dark:text-slate-300">{maturityLabel(t, uc.maturity)}</td>
              <td className="px-4 py-2.5">
                <Badge>{uc.techTag}</Badge>
              </td>
              <td className="px-4 py-2.5">
                <span className="inline-flex items-center gap-1.5">
                  <span className={cn("h-2 w-2 rounded-full", validationDotClass(uc.validation.status))} />
                  <span className="text-xs text-slate-600 dark:text-slate-300">
                    {validationLabel(t, uc.validation.status)}
                  </span>
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

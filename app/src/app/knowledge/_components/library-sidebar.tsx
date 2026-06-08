"use client";

import type { KnowledgeLibrary, KnowledgeUseCase, Maturity } from "@/content/knowledge";
import { MATURITIES } from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import { Layers, Boxes, Database, type LucideIcon } from "lucide-react";
import type { Filters } from "./filtering";
import { functionsForCompany } from "./filtering";
import { localized, maturityLabel } from "./display";

interface LibrarySidebarProps {
  library: KnowledgeLibrary;
  companyId: string;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  /** Company-scoped use cases (pre-filter) used for category/maturity counts. */
  scopedUseCases: ReadonlyArray<KnowledgeUseCase>;
}

/**
 * Knowledge filters rail (proposal §5.5, reference mock-up): a clean
 * Categories (by business function) list and a Maturity Layer list, each with
 * counts and an active highlight. Search and secondary filters live in the
 * toolbar above the table.
 */
export function LibrarySidebar({
  library,
  companyId,
  filters,
  onFiltersChange,
  scopedUseCases,
}: LibrarySidebarProps) {
  const { t, locale } = useLocale();
  const functions = functionsForCompany(library, companyId).sort((a, b) => a.sort - b.sort);

  const fnCount = (id: string) => scopedUseCases.filter((uc) => uc.functionId === id).length;
  const maturityCount = (m: Maturity) => scopedUseCases.filter((uc) => uc.maturity === m).length;

  const patch = (next: Partial<Filters>) => onFiltersChange({ ...filters, ...next });

  return (
    <aside className="rounded-lg border border-slate-200 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
      <GroupLabel className="pb-1 pt-2">{t.knowledge.categories}</GroupLabel>
      <ul className="flex flex-col">
        <NavItem
          icon={Layers}
          label={t.knowledge.allFunctions}
          count={scopedUseCases.length}
          active={filters.functionId === ""}
          onClick={() => patch({ functionId: "" })}
        />
        {functions.map((fn) => (
          <NavItem
            key={fn.id}
            icon={Boxes}
            label={localized(fn.name, locale)}
            count={fnCount(fn.id)}
            active={filters.functionId === fn.id}
            onClick={() => patch({ functionId: filters.functionId === fn.id ? "" : fn.id })}
          />
        ))}
      </ul>

      <GroupLabel className="mt-3 border-t border-slate-100 pb-2 pt-3 dark:border-slate-800">
        {t.knowledge.maturityLayer}
      </GroupLabel>
      <ul className="flex flex-col">
        {MATURITIES.map((m) => (
          <NavItem
            key={m}
            icon={Database}
            label={maturityLabel(t, m)}
            count={maturityCount(m)}
            active={filters.maturity === m}
            onClick={() => patch({ maturity: filters.maturity === m ? "" : m })}
          />
        ))}
      </ul>
    </aside>
  );
}

function GroupLabel({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={cn("px-2 text-xs font-medium uppercase tracking-wide text-ink-faint", className)}>
      {children}
    </p>
  );
}

interface NavItemProps {
  icon: LucideIcon;
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}

function NavItem({ icon: Icon, label, count, active, onClick }: NavItemProps) {
  return (
    <li>
      <button
        type="button"
        onClick={onClick}
        aria-current={active ? "true" : undefined}
        className={cn(
          "flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-left text-sm transition-colors",
          active
            ? "bg-slate-100 font-medium text-slate-900 dark:bg-slate-800 dark:text-slate-100"
            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/60",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Icon className="h-4 w-4 shrink-0 text-slate-500" />
          <span className="truncate">{label}</span>
        </span>
        <span className="shrink-0 text-xs tabular-nums text-slate-400">{count}</span>
      </button>
    </li>
  );
}

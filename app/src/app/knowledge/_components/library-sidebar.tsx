"use client";

import type { KnowledgeLibrary, Maturity, TechTag, ValidationStatus } from "@/content/knowledge";
import { MATURITIES, TECH_TAGS, VALIDATION_STATUSES } from "@/content/knowledge";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { SegTabs } from "@/components/ui/seg-tabs";
import { cn } from "@/lib/utils";
import type { Filters } from "./filtering";
import { EMPTY_FILTERS, functionsForCompany } from "./filtering";
import { localized, maturityLabel, validationLabel } from "./display";
import type { LibraryView } from "./use-case-list";

interface LibrarySidebarProps {
  library: KnowledgeLibrary;
  companyId: string;
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  view: LibraryView;
  onViewChange: (view: LibraryView) => void;
}

const SELECT_CLASS =
  "w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-800";

export function LibrarySidebar({
  library,
  companyId,
  filters,
  onFiltersChange,
  view,
  onViewChange,
}: LibrarySidebarProps) {
  const { t, locale } = useLocale();
  const functions = functionsForCompany(library, companyId).sort((a, b) => a.sort - b.sort);
  const hasFilters =
    filters.search || filters.functionId || filters.maturity || filters.techTag || filters.validationStatus || filters.hasArtifacts;

  function patch(next: Partial<Filters>) {
    onFiltersChange({ ...filters, ...next });
  }

  return (
    <aside className="space-y-4">
      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">{t.knowledge.search}</label>
        <input
          className={SELECT_CLASS}
          value={filters.search}
          placeholder={t.knowledge.searchPlaceholder}
          onChange={(e) => patch({ search: e.target.value })}
        />
      </div>

      <div>
        <label className="mb-1 block text-xs font-semibold text-slate-500">{t.knowledge.view}</label>
        <SegTabs<LibraryView>
          value={view}
          onChange={onViewChange}
          tabs={[
            { value: "grouped", label: t.knowledge.viewGrouped },
            { value: "cards", label: t.knowledge.viewCards },
            { value: "table", label: t.knowledge.viewTable },
          ]}
        />
      </div>

      <div className="space-y-2.5 rounded-md border border-slate-200 p-3 dark:border-slate-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">{t.knowledge.filters}</p>

        <FilterSelect
          value={filters.functionId}
          onChange={(v) => patch({ functionId: v })}
          allLabel={t.knowledge.allFunctions}
          options={functions.map((fn) => ({ value: fn.id, label: localized(fn.name, locale) }))}
        />
        <FilterSelect
          value={filters.maturity}
          onChange={(v) => patch({ maturity: v as Maturity | "" })}
          allLabel={t.knowledge.allMaturity}
          options={MATURITIES.map((m) => ({ value: m, label: maturityLabel(t, m) }))}
        />
        <FilterSelect
          value={filters.techTag}
          onChange={(v) => patch({ techTag: v as TechTag | "" })}
          allLabel={t.knowledge.allTech}
          options={TECH_TAGS.map((tag) => ({ value: tag, label: tag }))}
        />
        <FilterSelect
          value={filters.validationStatus}
          onChange={(v) => patch({ validationStatus: v as ValidationStatus | "" })}
          allLabel={t.knowledge.allValidation}
          options={VALIDATION_STATUSES.map((s) => ({ value: s, label: validationLabel(t, s) }))}
        />
        <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
          <input
            type="checkbox"
            checked={filters.hasArtifacts}
            onChange={(e) => patch({ hasArtifacts: e.target.checked })}
          />
          {t.knowledge.hasArtifacts}
        </label>

        {hasFilters && (
          <Button
            variant="ghost"
            className="w-full px-2 py-1 text-xs"
            onClick={() => onFiltersChange(EMPTY_FILTERS)}
          >
            {t.knowledge.clearFilters}
          </Button>
        )}
      </div>
    </aside>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  allLabel: string;
  options: ReadonlyArray<{ value: string; label: string }>;
}

function FilterSelect({ value, onChange, allLabel, options }: FilterSelectProps) {
  return (
    <select className={cn(SELECT_CLASS)} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type {
  CreateUseCaseFields,
  KnowledgeLibrary,
  KnowledgeUseCase,
  TechTag,
  ValidationStatus,
} from "@/content/knowledge";
import { TECH_TAGS, VALIDATION_STATUSES } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { getDictionary } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { SegTabs } from "@/components/ui/seg-tabs";
import { ChevronRight, Search } from "lucide-react";
import {
  createUseCase as apiCreateUseCase,
  deleteUseCase as apiDeleteUseCase,
  listArtifacts as apiListArtifacts,
  setUseCaseValidation as apiSetValidation,
  updateUseCase as apiUpdateUseCase,
} from "@/lib/api-client";
import {
  Scope,
  applyFilters,
  companiesForIndustry,
  defaultScope,
  EMPTY_FILTERS,
  Filters,
  industriesForSector,
  scopedUseCases,
  workflowsForCompany,
} from "./_components/filtering";
import { localized, validationLabel } from "./_components/display";
import { LibrarySidebar } from "./_components/library-sidebar";
import { UseCaseList, type LibraryView } from "./_components/use-case-list";
import { UseCaseEditor } from "./_components/use-case-editor";
import { UseCaseModal } from "./_components/use-case-modal";

interface KnowledgeClientProps {
  library: KnowledgeLibrary;
}

const TOOLBAR_SELECT =
  "rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-sm text-ink-muted shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300";

export function KnowledgeClient({ library: initial }: KnowledgeClientProps) {
  const { t, locale } = useLocale();
  const [library, setLibrary] = useState<KnowledgeLibrary>(initial);
  const [scope, setScope] = useState<Scope>(() => defaultScope(initial));
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<LibraryView>("table");
  const [detail, setDetail] = useState<KnowledgeUseCase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [artifactCounts, setArtifactCounts] = useState<Record<string, number>>({});

  const industries = industriesForSector(library, scope.sectorId);
  const companies = companiesForIndustry(library, scope.industryId);

  const companyUseCases = useMemo(
    () => scopedUseCases(library, scope.companyId),
    [library, scope.companyId],
  );

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const entries = await Promise.all(
        companyUseCases.map(async (uc) => [uc.id, (await apiListArtifacts(uc.id)).length] as const),
      );
      if (!cancelled) setArtifactCounts(Object.fromEntries(entries));
    })().catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [companyUseCases]);

  const idsWithArtifacts = useMemo(
    () => new Set(Object.entries(artifactCounts).filter(([, n]) => n > 0).map(([id]) => id)),
    [artifactCounts],
  );
  const filtered = useMemo(
    () => applyFilters(companyUseCases, filters, idsWithArtifacts),
    [companyUseCases, filters, idsWithArtifacts],
  );

  const stats = useMemo(() => {
    const workflows = workflowsForCompany(library, scope.companyId).length;
    const validated = companyUseCases.filter((uc) => uc.validation.status === "validated").length;
    return { total: companyUseCases.length, workflows, validated };
  }, [library, scope.companyId, companyUseCases]);

  function selectSector(sectorId: string) {
    const industry = industriesForSector(library, sectorId)[0];
    const company = industry ? companiesForIndustry(library, industry.id)[0] : undefined;
    setScope({ sectorId, industryId: industry?.id ?? "", companyId: company?.id ?? "" });
    setFilters(EMPTY_FILTERS);
  }

  function selectIndustry(industryId: string) {
    const company = companiesForIndustry(library, industryId)[0];
    setScope((prev) => ({ ...prev, industryId, companyId: company?.id ?? "" }));
    setFilters(EMPTY_FILTERS);
  }

  function selectCompany(companyId: string) {
    setScope((prev) => ({ ...prev, companyId }));
    setFilters(EMPTY_FILTERS);
  }

  async function handleSubmit(fields: CreateUseCaseFields) {
    const saved = await apiCreateUseCase(fields);
    setLibrary((prev) => ({ ...prev, useCases: [...prev.useCases, saved] }));
    setModalOpen(false);
  }

  async function handlePatch(id: string, patch: UpdateUseCaseInput) {
    const saved = await apiUpdateUseCase(id, patch);
    setLibrary((prev) => ({
      ...prev,
      useCases: prev.useCases.map((uc) => (uc.id === saved.id ? saved : uc)),
    }));
    setDetail(saved);
  }

  async function handleDelete(useCase: KnowledgeUseCase) {
    if (!window.confirm(t.knowledge.deleteConfirm)) return;
    await apiDeleteUseCase(useCase.id);
    setLibrary((prev) => ({ ...prev, useCases: prev.useCases.filter((uc) => uc.id !== useCase.id) }));
    if (detail?.id === useCase.id) setDetail(null);
  }

  async function handleSetValidation(id: string, status: ValidationStatus, note: string) {
    const saved = await apiSetValidation(id, { status, note });
    setLibrary((prev) => ({
      ...prev,
      useCases: prev.useCases.map((uc) => (uc.id === saved.id ? saved : uc)),
    }));
    setDetail(saved);
  }

  const artifactTotal = Object.values(artifactCounts).reduce((a, b) => a + b, 0);
  const validatedPct = stats.total > 0 ? Math.round((stats.validated / stats.total) * 100) : 0;
  const altTitle = getDictionary(locale === "en" ? "zh" : "en").knowledge.title;

  return (
    <section>
      {/* White header band — breaks out of the page's grey padded container */}
      <div className="-mx-6 -mt-8 mb-6 border-b border-slate-200 bg-white px-6 pb-6 pt-8 dark:border-slate-800 dark:bg-slate-900">
        {/* Breadcrumb + scope hierarchy */}
        <nav className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
          <span>{t.knowledge.workspace}</span>
          <ChevronRight className="h-3 w-3" />
          <span className="text-ink dark:text-slate-100">{t.knowledge.title}</span>
          <ChevronRight className="h-3 w-3" />
          <CrumbSelect
            value={scope.sectorId}
            onChange={selectSector}
            options={library.sectors
              .slice()
              .sort((a, b) => a.sort - b.sort)
              .map((s) => ({ value: s.id, label: localized(s.name, locale) }))}
          />
          <ChevronRight className="h-3 w-3" />
          <CrumbSelect
            value={scope.industryId}
            onChange={selectIndustry}
            options={industries.map((i) => ({ value: i.id, label: localized(i.name, locale) }))}
          />
          <ChevronRight className="h-3 w-3" />
          <CrumbSelect
            value={scope.companyId}
            onChange={selectCompany}
            options={companies.map((c) => ({ value: c.id, label: c.name }))}
          />
        </nav>

        {/* Title + primary action */}
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[22px] font-semibold tracking-tight text-ink dark:text-slate-50">
              {t.knowledge.title}
              <span className="ml-2 text-base font-normal text-slate-400">· {altTitle}</span>
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-ink-muted dark:text-slate-400">
              {t.knowledge.subtitle}
            </p>
          </div>
          <Button onClick={() => setModalOpen(true)} disabled={!scope.companyId}>
            + {t.knowledge.addUseCase}
          </Button>
        </div>

        {/* KPI tiles */}
        <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
          <KpiCell label={t.knowledge.useCases} value={stats.total} />
          <KpiCell label={t.knowledge.validated} value={stats.validated} hint={`${validatedPct}% of total`} />
          <KpiCell label={t.knowledge.artifacts} value={artifactTotal} />
          <KpiCell label={t.knowledge.workflows} value={stats.workflows} />
        </div>
      </div>

      {/* Filters rail + table */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[15rem_1fr]">
        <LibrarySidebar
          library={library}
          companyId={scope.companyId}
          filters={filters}
          onFiltersChange={setFilters}
          scopedUseCases={companyUseCases}
        />

        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <div className="relative min-w-[12rem] flex-1">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <input
                type="search"
                value={filters.search}
                onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                placeholder={t.knowledge.searchPlaceholder}
                className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-8 pr-2.5 text-sm text-ink shadow-sm placeholder:text-ink-faint focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
              />
            </div>
            <select
              aria-label={t.knowledge.colTech}
              value={filters.techTag}
              onChange={(e) => setFilters({ ...filters, techTag: e.target.value as TechTag | "" })}
              className={TOOLBAR_SELECT}
            >
              <option value="">{t.knowledge.allTech}</option>
              {TECH_TAGS.map((tag) => (
                <option key={tag} value={tag}>
                  {tag}
                </option>
              ))}
            </select>
            <select
              aria-label={t.knowledge.colStatus}
              value={filters.validationStatus}
              onChange={(e) =>
                setFilters({ ...filters, validationStatus: e.target.value as ValidationStatus | "" })
              }
              className={TOOLBAR_SELECT}
            >
              <option value="">{t.knowledge.allValidation}</option>
              {VALIDATION_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {validationLabel(t, s)}
                </option>
              ))}
            </select>
            <span className="ml-auto text-xs tabular-nums text-ink-faint">
              {filtered.length} / {companyUseCases.length} {t.knowledge.entries}
            </span>
            <SegTabs<LibraryView>
              value={view}
              onChange={setView}
              tabs={[
                { value: "table", label: t.knowledge.viewTable },
                { value: "grouped", label: t.knowledge.viewGrouped },
                { value: "cards", label: t.knowledge.viewCards },
              ]}
            />
          </div>

          <UseCaseList
            view={view}
            library={library}
            useCases={filtered}
            counts={artifactCounts}
            onView={setDetail}
            onEdit={setDetail}
            onDelete={handleDelete}
          />
        </div>
      </div>

      {detail && (
        <UseCaseEditor
          key={detail.id}
          useCase={detail}
          library={library}
          onClose={() => setDetail(null)}
          onPatch={handlePatch}
          onSetValidation={handleSetValidation}
          onDelete={handleDelete}
        />
      )}
      {modalOpen && (
        <UseCaseModal
          library={library}
          companyId={scope.companyId}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
        />
      )}
    </section>
  );
}

interface CrumbSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}

/** Minimal inline breadcrumb select — muted until hovered/focused. */
function CrumbSelect({ value, onChange, options }: CrumbSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="cursor-pointer rounded bg-transparent px-0.5 py-0.5 text-xs font-medium text-ink-muted hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:text-slate-300"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

function KpiCell({ label, value, hint }: { label: ReactNode; value: ReactNode; hint?: ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-950/40">
      <div className="text-xs font-medium uppercase tracking-wide text-ink-faint dark:text-slate-500">
        {label}
      </div>
      <div className="mt-1 text-xl font-semibold tracking-tight tabular-nums text-slate-900 dark:text-slate-50">
        {value}
      </div>
      {hint !== undefined && <div className="mt-0.5 text-xs text-ink-faint">{hint}</div>}
    </div>
  );
}

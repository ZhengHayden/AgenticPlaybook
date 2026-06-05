"use client";

import { useMemo, useState } from "react";
import type {
  CreateUseCaseFields,
  KnowledgeLibrary,
  KnowledgeUseCase,
  ValidationStatus,
} from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { StatCard } from "@/components/ui/stat-card";
import { Button } from "@/components/ui/button";
import {
  createUseCase as apiCreateUseCase,
  deleteUseCase as apiDeleteUseCase,
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
import { localized } from "./_components/display";
import { LibrarySidebar } from "./_components/library-sidebar";
import { UseCaseList, type LibraryView } from "./_components/use-case-list";
import { UseCaseEditor } from "./_components/use-case-editor";
import { UseCaseModal } from "./_components/use-case-modal";

interface KnowledgeClientProps {
  library: KnowledgeLibrary;
}

const SCOPE_SELECT_CLASS =
  "rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium dark:border-slate-700 dark:bg-slate-800";

export function KnowledgeClient({ library: initial }: KnowledgeClientProps) {
  const { t, locale } = useLocale();
  const [library, setLibrary] = useState<KnowledgeLibrary>(initial);
  const [scope, setScope] = useState<Scope>(() => defaultScope(initial));
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<LibraryView>("grouped");
  const [detail, setDetail] = useState<KnowledgeUseCase | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const industries = industriesForSector(library, scope.sectorId);
  const companies = companiesForIndustry(library, scope.industryId);

  const companyUseCases = useMemo(
    () => scopedUseCases(library, scope.companyId),
    [library, scope.companyId],
  );
  const filtered = useMemo(() => applyFilters(companyUseCases, filters), [companyUseCases, filters]);

  const stats = useMemo(() => {
    const workflows = workflowsForCompany(library, scope.companyId).length;
    const count = (s: KnowledgeUseCase["maturity"]) =>
      companyUseCases.filter((uc) => uc.maturity === s).length;
    const validated = companyUseCases.filter((uc) => uc.validation.status === "validated").length;
    return { total: companyUseCases.length, workflows, proven: count("proven"), emerging: count("emerging"), pilot: count("pilot"), validated };
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

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{t.knowledge.title}</h1>
          <p className="mt-1 text-sm text-slate-500">{t.knowledge.subtitle}</p>
        </div>
        <Button onClick={() => setModalOpen(true)} disabled={!scope.companyId}>
          + {t.knowledge.addUseCase}
        </Button>
      </div>

      {/* scope bar */}
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
        <ScopeSelect
          label={t.knowledge.sector}
          value={scope.sectorId}
          onChange={selectSector}
          options={library.sectors
            .slice()
            .sort((a, b) => a.sort - b.sort)
            .map((s) => ({ value: s.id, label: localized(s.name, locale) }))}
        />
        <span className="text-slate-300">›</span>
        <ScopeSelect
          label={t.knowledge.industry}
          value={scope.industryId}
          onChange={selectIndustry}
          options={industries.map((i) => ({ value: i.id, label: localized(i.name, locale) }))}
        />
        <span className="text-slate-300">›</span>
        <ScopeSelect
          label={t.knowledge.company}
          value={scope.companyId}
          onChange={selectCompany}
          options={companies.map((c) => ({ value: c.id, label: c.name }))}
        />
      </div>

      {/* scoped stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard label={t.knowledge.useCases} value={stats.total} accent="bg-indigo-500" />
        <StatCard label={t.knowledge.workflows} value={stats.workflows} accent="bg-sky-500" />
        <StatCard label={t.knowledge.maturityProven} value={stats.proven} accent="bg-emerald-500" />
        <StatCard label={t.knowledge.maturityEmerging} value={stats.emerging} accent="bg-sky-500" />
        <StatCard label={t.knowledge.maturityPilot} value={stats.pilot} accent="bg-amber-500" />
        <StatCard label={t.knowledge.validated} value={stats.validated} accent="bg-emerald-500" />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[16rem_1fr]">
        <LibrarySidebar
          library={library}
          companyId={scope.companyId}
          filters={filters}
          onFiltersChange={setFilters}
          view={view}
          onViewChange={setView}
        />
        <UseCaseList
          view={view}
          library={library}
          useCases={filtered}
          onView={setDetail}
          onEdit={setDetail}
          onDelete={handleDelete}
        />
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

interface ScopeSelectProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<{ value: string; label: string }>;
}

function ScopeSelect({ label, value, onChange, options }: ScopeSelectProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <select className={SCOPE_SELECT_CLASS} value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}

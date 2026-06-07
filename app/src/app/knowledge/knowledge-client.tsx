"use client";

import { useEffect, useMemo, useState } from "react";
import type {
  CreateUseCaseFields,
  KnowledgeLibrary,
  KnowledgeUseCase,
  ValidationStatus,
} from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Library } from "lucide-react";
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
import { localized, maturityAccent } from "./_components/display";
import { cn } from "@/lib/utils";
import { LibrarySidebar } from "./_components/library-sidebar";
import { UseCaseList, type LibraryView } from "./_components/use-case-list";
import { UseCaseEditor } from "./_components/use-case-editor";
import { UseCaseModal } from "./_components/use-case-modal";

interface KnowledgeClientProps {
  library: KnowledgeLibrary;
}

const SCOPE_SELECT_CLASS =
  "rounded border border-slate-300 bg-white px-3 py-1.5 text-sm font-medium focus:border-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 dark:border-slate-700 dark:bg-slate-800";

export function KnowledgeClient({ library: initial }: KnowledgeClientProps) {
  const { t, locale } = useLocale();
  const [library, setLibrary] = useState<KnowledgeLibrary>(initial);
  const [scope, setScope] = useState<Scope>(() => defaultScope(initial));
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [view, setView] = useState<LibraryView>("grouped");
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

  const artifactTotal = Object.values(artifactCounts).reduce((a, b) => a + b, 0);

  return (
    <section className="space-y-5">
      <PageHeader
        icon={<Library className="h-5 w-5" />}
        title={t.knowledge.title}
        subtitle={t.knowledge.subtitle}
        actions={
          <Button onClick={() => setModalOpen(true)} disabled={!scope.companyId}>
            + {t.knowledge.addUseCase}
          </Button>
        }
        highlights={[
          { label: t.knowledge.useCases, value: stats.total },
          { label: t.knowledge.validated, value: stats.validated },
          { label: t.knowledge.artifacts, value: artifactTotal },
          { label: t.knowledge.workflows, value: stats.workflows },
        ]}
      />

      {/* context bar: scope hierarchy + maturity breakdown */}
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-brand-100 bg-brand-50 px-4 py-3 dark:border-brand-800/50 dark:bg-brand-800/20">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          <Library className="h-3.5 w-3.5" />
          {t.knowledge.browsing}
        </span>
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

        <div className="ml-auto flex items-center gap-3 border-l border-brand-200 pl-3 text-xs text-slate-600 dark:border-brand-800/50 dark:text-slate-300">
          <MaturityStat color={maturityAccent("proven")} label={t.knowledge.maturityProven} value={stats.proven} />
          <MaturityStat color={maturityAccent("emerging")} label={t.knowledge.maturityEmerging} value={stats.emerging} />
          <MaturityStat color={maturityAccent("pilot")} label={t.knowledge.maturityPilot} value={stats.pilot} />
        </div>
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
          counts={artifactCounts}
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

interface MaturityStatProps {
  color: string;
  label: string;
  value: number;
}

function MaturityStat({ color, label, value }: MaturityStatProps) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn("h-2 w-2 rounded-full", color)} aria-hidden="true" />
      <span>{label}</span>
      <span className="font-semibold tabular-nums text-slate-700 dark:text-slate-200">{value}</span>
    </span>
  );
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

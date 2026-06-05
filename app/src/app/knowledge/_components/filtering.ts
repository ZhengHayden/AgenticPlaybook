import type {
  Company,
  Industry,
  KnowledgeLibrary,
  KnowledgeUseCase,
  LibraryFunction,
  LibraryWorkflow,
  Maturity,
  TechTag,
  ValidationStatus,
} from "@/content/knowledge";

/** Browse scope — the selected Sector → Industry → Company path. */
export interface Scope {
  sectorId: string;
  industryId: string;
  companyId: string;
}

/** In-library filters. Empty string means "all". */
export interface Filters {
  search: string;
  functionId: string;
  maturity: Maturity | "";
  techTag: TechTag | "";
  validationStatus: ValidationStatus | "";
  hasArtifacts: boolean;
}

export const EMPTY_FILTERS: Filters = {
  search: "",
  functionId: "",
  maturity: "",
  techTag: "",
  validationStatus: "",
  hasArtifacts: false,
};

// ─── scope cascade ────────────────────────────────────────────
export function industriesForSector(lib: KnowledgeLibrary, sectorId: string): Industry[] {
  return lib.industries.filter((i) => i.sectorId === sectorId);
}

export function companiesForIndustry(lib: KnowledgeLibrary, industryId: string): Company[] {
  return lib.companies.filter((c) => c.industryId === industryId);
}

export function functionsForCompany(lib: KnowledgeLibrary, companyId: string): LibraryFunction[] {
  return lib.functions.filter((f) => f.companyId === companyId);
}

export function workflowsForCompany(lib: KnowledgeLibrary, companyId: string): LibraryWorkflow[] {
  const fnIds = new Set(functionsForCompany(lib, companyId).map((f) => f.id));
  return lib.workflows.filter((w) => fnIds.has(w.functionId));
}

/** First available Sector → Industry → Company path, or empty ids. */
export function defaultScope(lib: KnowledgeLibrary): Scope {
  const sector = lib.sectors[0];
  const industry = sector ? industriesForSector(lib, sector.id)[0] : undefined;
  const company = industry ? companiesForIndustry(lib, industry.id)[0] : undefined;
  return {
    sectorId: sector?.id ?? "",
    industryId: industry?.id ?? "",
    companyId: company?.id ?? "",
  };
}

// ─── use case selection ───────────────────────────────────────
export function scopedUseCases(lib: KnowledgeLibrary, companyId: string): KnowledgeUseCase[] {
  return lib.useCases.filter((uc) => uc.companyId === companyId);
}

export function applyFilters(
  useCases: KnowledgeUseCase[],
  filters: Filters,
  useCaseIdsWithArtifacts?: ReadonlySet<string>,
): KnowledgeUseCase[] {
  const q = filters.search.trim().toLowerCase();
  return useCases.filter((uc) => {
    if (filters.functionId && uc.functionId !== filters.functionId) return false;
    if (filters.maturity && uc.maturity !== filters.maturity) return false;
    if (filters.techTag && uc.techTag !== filters.techTag) return false;
    if (filters.validationStatus && uc.validation.status !== filters.validationStatus) return false;
    if (filters.hasArtifacts && !(useCaseIdsWithArtifacts?.has(uc.id) ?? false)) return false;
    if (q) {
      const haystack = [uc.name, uc.domain, uc.description, ...uc.kpis, ...uc.businessObjectives]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

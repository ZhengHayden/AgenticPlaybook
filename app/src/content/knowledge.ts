import type { ArchetypeId } from "./archetypes";
import type { InteractionId } from "./interactions";
import type { A2APatternId } from "./a2a-patterns";

/**
 * Domain model for the Knowledge → Agentic Use Case Library.
 *
 * The library is a sector-based catalogue of agentic use cases. The browse
 * hierarchy, top → leaf, is:
 *
 *   Sector → Industry → Company → Function → Workflow → Use Case
 *
 * Each {@link KnowledgeUseCase} is the leaf: it carries its KPIs, market /
 * competitor intelligence ({@link UseCaseReference}), the agentic-design tags
 * (archetypes / interaction mode / A2A pattern) shared with the Design phase,
 * and a single inline {@link UseCaseValidation} status + note.
 *
 * The five grouping levels are reference taxonomy (seeded, not user-edited in
 * v1); only use cases are add/edit/delete-able in the app.
 */

// ─── Localized label ──────────────────────────────────────────
export interface LocalizedText {
  en: string;
  zh: string;
}

// ─── Scalar unions ────────────────────────────────────────────
export type Maturity = "proven" | "emerging" | "pilot";
export type TechTag = "AI/ML" | "GenAI" | "Analytics" | "Optimization";
export type ValidationStatus = "validated" | "partial" | "notYet";

export const MATURITIES: readonly Maturity[] = ["proven", "emerging", "pilot"];
export const TECH_TAGS: readonly TechTag[] = ["AI/ML", "GenAI", "Analytics", "Optimization"];
export const VALIDATION_STATUSES: readonly ValidationStatus[] = ["validated", "partial", "notYet"];

// ─── Grouping levels (taxonomy) ───────────────────────────────
export interface Sector {
  id: string;
  name: LocalizedText;
  sort: number;
}

export interface Industry {
  id: string;
  sectorId: string;
  name: LocalizedText;
  sort: number;
}

export interface Company {
  id: string;
  industryId: string;
  name: string;
  sort: number;
}

/** Was `vertical` in the source mockup — a business function within a company. */
export interface LibraryFunction {
  id: string;
  companyId: string;
  name: LocalizedText;
  /** Hex accent color carried from the mockup's vertical colors. */
  color: string;
  sort: number;
}

export interface LibraryWorkflow {
  id: string;
  functionId: string;
  name: string;
  description: string;
  color: string;
  durationWeeks?: number;
  squadHint?: string;
  sort: number;
}

// ─── Use case (leaf) ──────────────────────────────────────────
/** A market/competitor benchmark — was `comp{n}` / `comp{n}Action`. */
export interface UseCaseReference {
  name: string;
  detail: string;
}

/**
 * A structured impact KPI (proposal §5.6): one measurable metric with its
 * baseline, target, unit, and source. Free-text KPIs live on `kpis` (the Notes
 * field); this is the structured representation.
 */
export interface KpiMetric {
  metric: string;
  baseline: string;
  target: string;
  unit: string;
  source: string;
}

/** Single validation status + free-text note, embedded on the use case. */
export interface UseCaseValidation {
  status: ValidationStatus;
  note: string;
}

export interface KnowledgeUseCase {
  id: string;
  workflowId: string;
  // Denormalized parent ids (derived from workflowId on every write) so the
  // client can filter without walking the taxonomy.
  sectorId: string;
  industryId: string;
  companyId: string;
  functionId: string;

  name: string;
  domain: string;
  description: string;
  /** Free-text KPI notes (one per line). Structured metrics live on `kpiMetrics`. */
  kpis: string[];
  /** Structured impact KPIs (proposal §5.6); optional for back-compat. */
  kpiMetrics?: KpiMetric[];
  techTag: TechTag;
  maturity: Maturity;
  businessObjectives: string[];

  // Agentic-design tags, consistent with the Design-phase taxonomy.
  archetypes: ArchetypeId[];
  interactionMode?: InteractionId;
  a2aPattern?: A2APatternId;

  references: UseCaseReference[];
  sponsors?: string;
  validation: UseCaseValidation;
}

// ─── Assembled library ────────────────────────────────────────
export interface KnowledgeLibrary {
  sectors: Sector[];
  industries: Industry[];
  companies: Company[];
  functions: LibraryFunction[];
  workflows: LibraryWorkflow[];
  useCases: KnowledgeUseCase[];
}

/**
 * A use case as authored in a seed file: the full leaf object minus the four
 * denormalized parent ids, which are resolved from `workflowId` at build time.
 */
export type UseCaseSeed = Omit<
  KnowledgeUseCase,
  "sectorId" | "industryId" | "companyId" | "functionId"
>;

/** A self-contained sector branch contributed to the seed by a content module. */
export interface KnowledgeBranch {
  sectors: Sector[];
  industries: Industry[];
  companies: Company[];
  functions: LibraryFunction[];
  workflows: LibraryWorkflow[];
  useCaseSeeds: UseCaseSeed[];
}

/** Fields a client may set when creating a use case (parents derived server-side). */
export interface CreateUseCaseFields {
  workflowId: string;
  name: string;
  domain: string;
  description: string;
  kpis: string[];
  kpiMetrics?: KpiMetric[];
  techTag: TechTag;
  maturity: Maturity;
  businessObjectives: string[];
  archetypes: ArchetypeId[];
  interactionMode?: InteractionId;
  a2aPattern?: A2APatternId;
  references: UseCaseReference[];
  sponsors?: string;
}

export const DEFAULT_VALIDATION: UseCaseValidation = { status: "notYet", note: "" };

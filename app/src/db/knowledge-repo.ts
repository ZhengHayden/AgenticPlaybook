import { eq } from "drizzle-orm";
import { db } from "./client";
import {
  knowledgeTaxonomy,
  knowledgeUseCases,
  knowledgeArtifacts,
  type KnowledgeTaxonomyRow,
  type KnowledgeUseCaseRow,
} from "./schema";
import { deleteUseCaseArtifactsDir } from "@/lib/artifact-storage";
import { knowledgeSeed } from "@/content/knowledge-seed";
import {
  DEFAULT_VALIDATION,
  type Company,
  type Industry,
  type KnowledgeLibrary,
  type KnowledgeUseCase,
  type LibraryFunction,
  type LibraryWorkflow,
  type Sector,
  type UseCaseValidation,
} from "@/content/knowledge";
import type {
  CreateUseCaseInput,
  UpdateUseCaseInput,
  ValidationPatchInput,
} from "./knowledge-validation";

/**
 * Repository for the Knowledge library. The taxonomy (Sector…Workflow) lives in
 * `knowledge_taxonomy`, one row per level, with the full level object as JSON in
 * `data`. Use cases live in `knowledge_use_cases`, the full object as JSON with
 * parent ids + a few filter columns denormalized on every write.
 *
 * better-sqlite3 is synchronous; these are async so route handlers can await
 * them uniformly, mirroring `projects-repo.ts`.
 */

// ─── taxonomy (de)serialization ───────────────────────────────
type TaxonomyType = KnowledgeTaxonomyRow["type"];

function taxonomyRow(
  type: TaxonomyType,
  parentId: string | null,
  sort: number,
  obj: unknown,
  id: string,
): KnowledgeTaxonomyRow {
  return { id, type, parentId, sort, data: JSON.stringify(obj) };
}

function parseTaxonomy<T>(rows: KnowledgeTaxonomyRow[], type: TaxonomyType): T[] {
  return rows
    .filter((r) => r.type === type)
    .sort((a, b) => a.sort - b.sort)
    .map((r) => JSON.parse(r.data) as T);
}

// ─── use case (de)serialization ───────────────────────────────
function toUseCaseRow(uc: KnowledgeUseCase): KnowledgeUseCaseRow {
  return {
    id: uc.id,
    workflowId: uc.workflowId,
    sectorId: uc.sectorId,
    industryId: uc.industryId,
    companyId: uc.companyId,
    functionId: uc.functionId,
    maturity: uc.maturity,
    techTag: uc.techTag,
    name: uc.name,
    validationStatus: uc.validation.status,
    data: JSON.stringify(uc),
  };
}

function fromUseCaseRow(row: KnowledgeUseCaseRow): KnowledgeUseCase {
  const uc = JSON.parse(row.data) as KnowledgeUseCase;
  // Back-compat: rows stored before structured KPIs lack `kpiMetrics`.
  return { ...uc, kpiMetrics: uc.kpiMetrics ?? [] };
}

// ─── seeding ──────────────────────────────────────────────────
let seeded = false;

/**
 * Populate an empty database with the bundled library. Idempotent and runs at
 * most once per process; safe to call from every read path.
 */
export function ensureKnowledgeSeeded(): void {
  if (seeded) return;
  seeded = true;
  const count = db.select().from(knowledgeTaxonomy).all().length;
  if (count > 0) return;

  const { sectors, industries, companies, functions, workflows, useCases } = knowledgeSeed;
  const rows: KnowledgeTaxonomyRow[] = [
    ...sectors.map((s) => taxonomyRow("sector", null, s.sort, s, s.id)),
    ...industries.map((i) => taxonomyRow("industry", i.sectorId, i.sort, i, i.id)),
    ...companies.map((c) => taxonomyRow("company", c.industryId, c.sort, c, c.id)),
    ...functions.map((f) => taxonomyRow("function", f.companyId, f.sort, f, f.id)),
    ...workflows.map((w) => taxonomyRow("workflow", w.functionId, w.sort, w, w.id)),
  ];
  for (const row of rows) {
    db.insert(knowledgeTaxonomy).values(row).onConflictDoNothing().run();
  }
  for (const uc of useCases) {
    db.insert(knowledgeUseCases).values(toUseCaseRow(uc)).onConflictDoNothing().run();
  }
}

// ─── reads ────────────────────────────────────────────────────
export async function getLibrary(): Promise<KnowledgeLibrary> {
  ensureKnowledgeSeeded();
  const taxonomyRows = db.select().from(knowledgeTaxonomy).all();
  const useCaseRows = db.select().from(knowledgeUseCases).all();
  return {
    sectors: parseTaxonomy<Sector>(taxonomyRows, "sector"),
    industries: parseTaxonomy<Industry>(taxonomyRows, "industry"),
    companies: parseTaxonomy<Company>(taxonomyRows, "company"),
    functions: parseTaxonomy<LibraryFunction>(taxonomyRows, "function"),
    workflows: parseTaxonomy<LibraryWorkflow>(taxonomyRows, "workflow"),
    useCases: useCaseRows.map(fromUseCaseRow),
  };
}

// ─── parent resolution ────────────────────────────────────────
interface ParentIds {
  functionId: string;
  companyId: string;
  industryId: string;
  sectorId: string;
}

/** Walk workflow → function → company → industry → sector from the taxonomy. */
function resolveParents(workflowId: string): ParentIds {
  const get = (id: string) =>
    db.select().from(knowledgeTaxonomy).where(eq(knowledgeTaxonomy.id, id)).get();

  const workflow = get(workflowId);
  if (!workflow || workflow.type !== "workflow" || !workflow.parentId) {
    throw new Error(`Unknown workflowId: ${workflowId}`);
  }
  const fn = get(workflow.parentId);
  if (!fn || !fn.parentId) throw new Error(`Workflow ${workflowId} has no function`);
  const company = get(fn.parentId);
  if (!company || !company.parentId) throw new Error(`Function ${fn.id} has no company`);
  const industry = get(company.parentId);
  if (!industry || !industry.parentId) throw new Error(`Company ${company.id} has no industry`);

  return {
    functionId: fn.id,
    companyId: company.id,
    industryId: industry.id,
    sectorId: industry.parentId,
  };
}

// ─── writes ───────────────────────────────────────────────────
export async function createUseCase(input: CreateUseCaseInput): Promise<KnowledgeUseCase> {
  const parents = resolveParents(input.workflowId);
  const id = uniqueUseCaseId(input.name);
  const useCase: KnowledgeUseCase = {
    id,
    ...input,
    ...parents,
    validation: DEFAULT_VALIDATION,
  };
  db.insert(knowledgeUseCases).values(toUseCaseRow(useCase)).run();
  return useCase;
}

export async function updateUseCase(
  id: string,
  patch: UpdateUseCaseInput,
): Promise<KnowledgeUseCase | undefined> {
  const existing = await getUseCase(id);
  if (!existing) return undefined;

  // If the workflow changed, re-derive the parent ids; otherwise keep them.
  const parents =
    patch.workflowId && patch.workflowId !== existing.workflowId
      ? resolveParents(patch.workflowId)
      : {
          functionId: existing.functionId,
          companyId: existing.companyId,
          industryId: existing.industryId,
          sectorId: existing.sectorId,
        };

  const updated: KnowledgeUseCase = {
    ...existing,
    ...patch,
    ...parents,
    id: existing.id,
    validation: existing.validation, // validation has its own endpoint
  };
  db.update(knowledgeUseCases).set(toUseCaseRow(updated)).where(eq(knowledgeUseCases.id, id)).run();
  return updated;
}

export async function deleteUseCase(id: string): Promise<boolean> {
  // Cascade: remove the use case's artifact rows and on-disk bytes first.
  db.delete(knowledgeArtifacts).where(eq(knowledgeArtifacts.useCaseId, id)).run();
  await deleteUseCaseArtifactsDir(id);
  const result = db.delete(knowledgeUseCases).where(eq(knowledgeUseCases.id, id)).run();
  return result.changes > 0;
}

export async function setValidation(
  id: string,
  patch: ValidationPatchInput,
): Promise<KnowledgeUseCase | undefined> {
  const existing = await getUseCase(id);
  if (!existing) return undefined;
  const validation: UseCaseValidation = { status: patch.status, note: patch.note };
  const updated: KnowledgeUseCase = { ...existing, validation };
  db.update(knowledgeUseCases).set(toUseCaseRow(updated)).where(eq(knowledgeUseCases.id, id)).run();
  return updated;
}

// ─── helpers ──────────────────────────────────────────────────
async function getUseCase(id: string): Promise<KnowledgeUseCase | undefined> {
  ensureKnowledgeSeeded();
  const row = db.select().from(knowledgeUseCases).where(eq(knowledgeUseCases.id, id)).get();
  return row ? fromUseCaseRow(row) : undefined;
}

function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "use-case";
}

function uniqueUseCaseId(name: string): string {
  const base = `uc-${slugify(name)}`.slice(0, 60);
  let candidate = base;
  let n = 2;
  while (db.select().from(knowledgeUseCases).where(eq(knowledgeUseCases.id, candidate)).get()) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

import { eq } from "drizzle-orm";
import { db } from "./client";
import { projects, type ProjectRow } from "./schema";
import { sampleProjects, type Project } from "@/content/sample-data";
import type { CreateProjectInput, ProjectPatchInput } from "./validation";

/**
 * Repository for projects. The full `Project` lives as JSON in the `data`
 * column; the row's scalar columns are derived from it on every write. All
 * reads revive `updatedAt` back into a `Date`.
 *
 * better-sqlite3 is synchronous, but these are exposed as async so server
 * components and route handlers can `await` them uniformly.
 */

// ─── (de)serialization ────────────────────────────────────────
function toRow(project: Project): ProjectRow {
  return {
    id: project.id,
    name: project.name,
    client: project.client,
    domain: project.domain,
    status: project.status,
    updatedAt: project.updatedAt.getTime(),
    data: JSON.stringify(project), // Date -> ISO string automatically
  };
}

/**
 * Legacy shape: before the workflow-portfolio change, a project held a single
 * flat `workflowSteps[]` + `a2aPattern`. New rows use `workflows: Workflow[]`.
 */
interface LegacyProject {
  workflowSteps?: Project["workflows"][number]["steps"];
  a2aPattern?: Project["workflows"][number]["a2aPattern"];
}

function migrate(parsed: Project & LegacyProject): Project {
  if (Array.isArray(parsed.workflows)) {
    // Already new shape; strip any vestigial legacy keys.
    const { workflowSteps: _ws, a2aPattern: _ap, ...rest } = parsed;
    return rest;
  }
  const { workflowSteps, a2aPattern, ...rest } = parsed;
  const steps = workflowSteps ?? [];
  return {
    ...rest,
    workflows:
      steps.length > 0
        ? [{ id: "wf-1", name: parsed.name, steps, a2aPattern }]
        : [],
  };
}

function fromRow(row: ProjectRow): Project {
  const parsed = JSON.parse(row.data) as Project & LegacyProject;
  const migrated = migrate(parsed);
  return { ...migrated, updatedAt: new Date(migrated.updatedAt) };
}

// ─── seeding ──────────────────────────────────────────────────
let seeded = false;

/**
 * Populate an empty database with the bundled sample projects. Idempotent and
 * runs at most once per process; safe to call from every read path so the app
 * is never empty on a fresh checkout.
 */
export function ensureSeeded(): void {
  if (seeded) return;
  seeded = true;
  const count = db.select().from(projects).all().length;
  if (count > 0) return;
  for (const project of sampleProjects) {
    db.insert(projects).values(toRow(project)).onConflictDoNothing().run();
  }
}

// ─── reads ────────────────────────────────────────────────────
export async function listProjects(filters?: { status?: Project["status"] }): Promise<Project[]> {
  ensureSeeded();
  const rows = filters?.status
    ? db.select().from(projects).where(eq(projects.status, filters.status)).all()
    : db.select().from(projects).all();
  return rows
    .map(fromRow)
    .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
}

export async function getProject(id: string): Promise<Project | undefined> {
  ensureSeeded();
  const row = db.select().from(projects).where(eq(projects.id, id)).get();
  return row ? fromRow(row) : undefined;
}

// ─── writes ───────────────────────────────────────────────────
export async function createProject(input: CreateProjectInput): Promise<Project> {
  const id = await uniqueSlug(input.name);
  const project: Project = {
    id,
    name: input.name,
    client: input.client,
    domain: input.domain,
    description: "",
    language: input.language,
    p1Variant: input.p1Variant,
    p2Variant: input.p2Variant,
    status: "active",
    updatedAt: new Date(),
    currentPhase: "impactSizing",
    phaseProgress: { impactSizing: 0, design: 0, mvp: 0, production: 0 },
    candidates: [],
    workflows: [],
    p1Gate: [],
    p2Gate: [],
  };
  db.insert(projects).values(toRow(project)).run();
  return project;
}

export async function updateProject(
  id: string,
  patch: ProjectPatchInput,
): Promise<Project | undefined> {
  const existing = await getProject(id);
  if (!existing) return undefined;

  // Immutable update: id is fixed and updatedAt is repo-managed.
  const updated: Project = {
    ...existing,
    ...(patch as Partial<Project>),
    id: existing.id,
    updatedAt: new Date(),
  };
  db.update(projects).set(toRow(updated)).where(eq(projects.id, id)).run();
  return updated;
}

export async function deleteProject(id: string): Promise<boolean> {
  const result = db.delete(projects).where(eq(projects.id, id)).run();
  return result.changes > 0;
}

// ─── helpers ──────────────────────────────────────────────────
function slugify(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return base || "project";
}

async function uniqueSlug(name: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 2;
  while (db.select().from(projects).where(eq(projects.id, candidate)).get()) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  return candidate;
}

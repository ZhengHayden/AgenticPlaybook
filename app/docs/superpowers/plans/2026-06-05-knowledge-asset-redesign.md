# Knowledge Asset Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebalance the `/knowledge` use-case editor into five even tabs and add a first-class Artifacts module (upload + link, Draft/Published/Deprecated status, current-file-plus-changelog versioning) so a use case becomes a real knowledge-asset record.

**Architecture:** Follow the existing knowledge module patterns exactly — a new `knowledge_artifacts` SQLite table storing filter columns + a JSON `data` blob, a sync better-sqlite3 repo wrapped in async functions, Route Handlers using the `ok`/`fail` envelope, and zod validation at the boundary. File bytes live on the VM disk under a configurable artifacts dir; "Replace" overwrites current bytes and appends a changelog entry (no historical bytes retained). The detail editor merges References + Validation into one **Evidence** tab and adds an **Artifacts** tab.

**Tech Stack:** Next.js 16, React 19, TypeScript, better-sqlite3 + drizzle-orm, zod v4, Vitest + @testing-library/react (added in Task 0).

**Spec:** `docs/superpowers/specs/2026-06-05-knowledge-module-redesign-design.md`

---

## File Structure

**Created:**
- `vitest.config.ts` — test runner config (jsdom, path alias).
- `vitest.setup.ts` — RTL matchers + per-test temp DB/artifacts dirs.
- `src/content/knowledge-artifacts.ts` — artifact domain types + constants.
- `src/db/knowledge-artifacts-validation.ts` — zod schemas + inferred input types.
- `src/lib/artifact-storage.ts` — disk path derivation, sanitization, size/MIME caps, write/read/delete.
- `src/db/knowledge-artifacts-repo.ts` — list/create/patch/replace/delete + changelog.
- `src/app/api/knowledge/use-cases/[id]/artifacts/route.ts` — GET list, POST create.
- `src/app/api/knowledge/artifacts/[aid]/route.ts` — PATCH, DELETE.
- `src/app/api/knowledge/artifacts/[aid]/download/route.ts` — GET stream.
- `src/app/knowledge/_components/editor/artifacts-tab.tsx` — Artifacts tab container.
- `src/app/knowledge/_components/editor/artifact-row.tsx` — one artifact row + changelog.
- `src/app/knowledge/_components/editor/artifact-form.tsx` — add/edit form.
- `src/app/knowledge/_components/editor/evidence-tab.tsx` — merged References + Validation.
- Test files alongside each logic module (`*.test.ts` / `*.test.tsx`).
- `e2e/knowledge-artifacts.spec.ts` — Playwright flow (optional, via MCP).

**Modified:**
- `package.json` — test deps + scripts.
- `src/db/schema.ts` — `knowledgeArtifacts` table.
- `src/db/client.ts` — bootstrap `knowledge_artifacts` table.
- `src/db/knowledge-repo.ts` — cascade-delete artifacts with a use case.
- `src/lib/api-client.ts` — artifact client helpers.
- `src/app/knowledge/_components/use-case-editor.tsx` — tab list (Evidence + Artifacts), drop References/Validation tabs.
- `src/app/knowledge/knowledge-client.tsx` — artifact state, rebalanced stats, badges.
- `src/app/knowledge/_components/library-sidebar.tsx` — "Has artifacts" filter.
- `src/app/knowledge/_components/filtering.ts` — `hasArtifacts` filter field.
- `src/app/knowledge/_components/use-case-list.tsx` — artifact count badge.
- `src/lib/i18n.ts` — new keys (en + zh).

**Deleted:**
- `src/app/knowledge/_components/editor/references-tab.tsx`
- `src/app/knowledge/_components/editor/validation-tab.tsx`

---

## Task 0: Test harness (Vitest + RTL)

**Files:**
- Create: `vitest.config.ts`, `vitest.setup.ts`
- Modify: `package.json`
- Test: `src/lib/__smoke__/harness.test.ts`

- [ ] **Step 1: Install dev dependencies**

Run:
```bash
npm i -D vitest@^3 @vitest/coverage-v8@^3 jsdom@^25 @testing-library/react@^16 @testing-library/jest-dom@^6 @testing-library/user-event@^14
```
Expected: packages added to `devDependencies`, no peer-dep errors (React 19 is supported by RTL 16).

- [ ] **Step 2: Add test scripts to `package.json`**

In the `"scripts"` block add:
```json
"test": "vitest run",
"test:watch": "vitest",
"test:cov": "vitest run --coverage"
```

- [ ] **Step 3: Create `vitest.config.ts`**

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    globals: true,
    include: ["src/**/*.test.{ts,tsx}"],
    coverage: { provider: "v8", reporter: ["text", "html"] },
  },
  resolve: {
    alias: { "@": path.resolve(__dirname, "src") },
  },
});
```

- [ ] **Step 4: Create `vitest.setup.ts`**

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Each test file gets isolated SQLite + artifact dirs via env, so the repo and
// storage modules never touch the real data/ directory.
let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "playbook-test-"));
  process.env.PLAYBOOK_DB_PATH = path.join(tmpRoot, "test.db");
  process.env.PLAYBOOK_ARTIFACTS_DIR = path.join(tmpRoot, "artifacts");
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});
```

- [ ] **Step 5: Write a smoke test**

Create `src/lib/__smoke__/harness.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs and resolves @ alias env", () => {
    expect(process.env.PLAYBOOK_ARTIFACTS_DIR).toContain("artifacts");
  });
});
```

- [ ] **Step 6: Run the smoke test**

Run: `npm test -- src/lib/__smoke__/harness.test.ts`
Expected: PASS (1 test).

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json vitest.config.ts vitest.setup.ts src/lib/__smoke__/harness.test.ts
git commit -m "test: add vitest + react-testing-library harness"
```

---

## Task 1: Artifact domain types + constants

**Files:**
- Create: `src/content/knowledge-artifacts.ts`
- Test: `src/content/knowledge-artifacts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/content/knowledge-artifacts.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  ARTIFACT_KINDS,
  ARTIFACT_TYPES,
  ARTIFACT_STATUSES,
  DEFAULT_ARTIFACT_STATUS,
} from "./knowledge-artifacts";

describe("artifact constants", () => {
  it("exposes the two storage kinds", () => {
    expect(ARTIFACT_KINDS).toEqual(["file", "link"]);
  });
  it("includes the eight artifact types", () => {
    expect(ARTIFACT_TYPES).toContain("playbook");
    expect(ARTIFACT_TYPES).toContain("promptSet");
    expect(ARTIFACT_TYPES).toHaveLength(8);
  });
  it("defaults new artifacts to draft", () => {
    expect(DEFAULT_ARTIFACT_STATUS).toBe("draft");
    expect(ARTIFACT_STATUSES).toEqual(["draft", "published", "deprecated"]);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/content/knowledge-artifacts.test.ts`
Expected: FAIL — cannot find module `./knowledge-artifacts`.

- [ ] **Step 3: Create `src/content/knowledge-artifacts.ts`**

```ts
/**
 * Domain model for Knowledge artifacts — the deliverables attached to a use
 * case (playbooks, decks, prompt sets, SOPs, code, diagrams, datasets). Each
 * artifact keeps a single current file or link plus a textual change log; old
 * file bytes are not retained (see the redesign spec).
 */

export type ArtifactKind = "file" | "link";
export type ArtifactType =
  | "playbook" | "deck" | "promptSet" | "sop"
  | "code" | "diagram" | "dataset" | "other";
export type ArtifactStatus = "draft" | "published" | "deprecated";

export const ARTIFACT_KINDS: readonly ArtifactKind[] = ["file", "link"];
export const ARTIFACT_TYPES: readonly ArtifactType[] = [
  "playbook", "deck", "promptSet", "sop", "code", "diagram", "dataset", "other",
];
export const ARTIFACT_STATUSES: readonly ArtifactStatus[] = [
  "draft", "published", "deprecated",
];
export const DEFAULT_ARTIFACT_STATUS: ArtifactStatus = "draft";

/** Upload limits enforced at the API boundary. */
export const MAX_ARTIFACT_BYTES = 25 * 1024 * 1024; // 25 MB
export const ALLOWED_ARTIFACT_MIME: readonly string[] = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/markdown", "text/csv",
  "image/png", "image/jpeg", "image/svg+xml",
  "application/json", "application/zip",
];

export interface ArtifactFile {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  storagePath: string; // server-derived, relative to the artifacts dir
}

export interface ArtifactChangeEntry {
  at: number; // epoch millis
  author: string;
  note: string;
  versionLabel?: string;
}

export interface KnowledgeArtifact {
  id: string;
  useCaseId: string;
  title: string;
  kind: ArtifactKind;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  versionLabel?: string;
  createdAt: number;
  updatedAt: number;
  file?: ArtifactFile; // kind === "file"
  url?: string;        // kind === "link"
  changelog: ArtifactChangeEntry[];
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/content/knowledge-artifacts.test.ts`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add src/content/knowledge-artifacts.ts src/content/knowledge-artifacts.test.ts
git commit -m "feat(knowledge): artifact domain types and constants"
```

---

## Task 2: Artifacts table + schema + bootstrap

**Files:**
- Modify: `src/db/schema.ts`, `src/db/client.ts`
- Test: `src/db/knowledge-artifacts-schema.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/db/knowledge-artifacts-schema.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("knowledge_artifacts bootstrap", () => {
  it("creates the table on a fresh database", async () => {
    const { db } = await import("./client");
    const rows = db.$client
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_artifacts'")
      .all();
    expect(rows).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/db/knowledge-artifacts-schema.test.ts`
Expected: FAIL — table not found (0 rows).

- [ ] **Step 3: Add the drizzle table to `src/db/schema.ts`**

Append:
```ts
/**
 * One row per knowledge artifact. The full {@link KnowledgeArtifact} is stored
 * as JSON in `data`; `use_case_id`, `kind`, `type`, `status` and `updated_at`
 * are denormalized for cheap listing/filtering — never edited independently.
 */
export const knowledgeArtifacts = sqliteTable("knowledge_artifacts", {
  id: text("id").primaryKey(),
  useCaseId: text("use_case_id").notNull(),
  kind: text("kind", { enum: ["file", "link"] }).notNull(),
  type: text("type").notNull(),
  status: text("status", { enum: ["draft", "published", "deprecated"] }).notNull(),
  updatedAt: integer("updated_at").notNull(),
  data: text("data").notNull(), // JSON-serialized KnowledgeArtifact
});

export type KnowledgeArtifactRow = typeof knowledgeArtifacts.$inferSelect;
export type NewKnowledgeArtifactRow = typeof knowledgeArtifacts.$inferInsert;
```

- [ ] **Step 4: Bootstrap the table in `src/db/client.ts`**

Inside `createConnection()`, in the `sqlite.exec(\`...\`)` block, append after the `knowledge_use_cases` table:
```sql
    CREATE TABLE IF NOT EXISTS knowledge_artifacts (
      id TEXT PRIMARY KEY,
      use_case_id TEXT NOT NULL,
      kind TEXT NOT NULL,
      type TEXT NOT NULL,
      status TEXT NOT NULL,
      updated_at INTEGER NOT NULL,
      data TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS idx_artifacts_use_case ON knowledge_artifacts(use_case_id);
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/db/knowledge-artifacts-schema.test.ts`
Expected: PASS (1 test).

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts src/db/client.ts src/db/knowledge-artifacts-schema.test.ts
git commit -m "feat(knowledge): knowledge_artifacts table + bootstrap"
```

---

## Task 3: Artifact storage (disk)

**Files:**
- Create: `src/lib/artifact-storage.ts`
- Test: `src/lib/artifact-storage.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/artifact-storage.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  writeArtifactFile,
  readArtifactFile,
  deleteArtifactDir,
  sanitizeFileName,
} from "./artifact-storage";

describe("sanitizeFileName", () => {
  it("strips path separators and traversal", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("etc_passwd");
    expect(sanitizeFileName("my deck.pdf")).toBe("my deck.pdf");
    expect(sanitizeFileName("")).toBe("file");
  });
});

describe("write/read/delete", () => {
  it("writes bytes under <useCaseId>/<artifactId> and reads them back", async () => {
    const bytes = Buffer.from("hello");
    const rel = await writeArtifactFile("uc-1", "art-1", "doc.txt", bytes);
    expect(rel).toBe("uc-1/art-1/doc.txt");
    const read = await readArtifactFile(rel);
    expect(read.toString()).toBe("hello");
  });

  it("overwrites the previous file on replace (no history kept)", async () => {
    await writeArtifactFile("uc-1", "art-1", "a.txt", Buffer.from("v1"));
    const rel = await writeArtifactFile("uc-1", "art-1", "b.txt", Buffer.from("v2"));
    const dir = `${process.env.PLAYBOOK_ARTIFACTS_DIR}/uc-1/art-1`;
    expect(fs.readdirSync(dir)).toEqual(["b.txt"]); // old file removed
    expect((await readArtifactFile(rel)).toString()).toBe("v2");
  });

  it("deletes an artifact directory", async () => {
    await writeArtifactFile("uc-2", "art-9", "x.txt", Buffer.from("z"));
    await deleteArtifactDir("uc-2", "art-9");
    expect(fs.existsSync(`${process.env.PLAYBOOK_ARTIFACTS_DIR}/uc-2/art-9`)).toBe(false);
  });

  it("rejects reads that escape the artifacts dir", async () => {
    await expect(readArtifactFile("../../etc/passwd")).rejects.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/artifact-storage.test.ts`
Expected: FAIL — cannot find module `./artifact-storage`.

- [ ] **Step 3: Create `src/lib/artifact-storage.ts`**

```ts
import path from "node:path";
import fs from "node:fs/promises";

/** Root dir for artifact bytes; overridable in tests via env. */
function artifactsRoot(): string {
  return process.env.PLAYBOOK_ARTIFACTS_DIR ?? path.resolve(process.cwd(), "data/artifacts");
}

/** Strip directory separators / traversal; keep a safe, non-empty basename. */
export function sanitizeFileName(name: string): string {
  const base = path.basename(name).replace(/[/\\]/g, "_").replace(/\.\.+/g, "_").trim();
  return base.length > 0 ? base : "file";
}

function safeId(id: string): string {
  const clean = id.replace(/[^a-zA-Z0-9._-]/g, "");
  if (!clean) throw new Error("Invalid id");
  return clean;
}

/** Resolve a stored relative path back to an absolute path, guarding traversal. */
function resolveWithin(relativePath: string): string {
  const root = artifactsRoot();
  const abs = path.resolve(root, relativePath);
  if (abs !== root && !abs.startsWith(root + path.sep)) {
    throw new Error("Path escapes artifacts root");
  }
  return abs;
}

/**
 * Write bytes to `<root>/<useCaseId>/<artifactId>/<fileName>`, removing any
 * previous file in that artifact dir first (current-only, no history). Returns
 * the relative storage path to persist on the artifact.
 */
export async function writeArtifactFile(
  useCaseId: string,
  artifactId: string,
  fileName: string,
  bytes: Buffer,
): Promise<string> {
  const safeName = sanitizeFileName(fileName);
  const dirRel = path.join(safeId(useCaseId), safeId(artifactId));
  const dirAbs = resolveWithin(dirRel);
  await fs.rm(dirAbs, { recursive: true, force: true });
  await fs.mkdir(dirAbs, { recursive: true });
  await fs.writeFile(path.join(dirAbs, safeName), bytes);
  return path.join(dirRel, safeName);
}

export async function readArtifactFile(relativePath: string): Promise<Buffer> {
  return fs.readFile(resolveWithin(relativePath));
}

export async function deleteArtifactDir(useCaseId: string, artifactId: string): Promise<void> {
  const dirAbs = resolveWithin(path.join(safeId(useCaseId), safeId(artifactId)));
  await fs.rm(dirAbs, { recursive: true, force: true });
}

/** Remove all artifacts for a use case (cascade on use-case delete). */
export async function deleteUseCaseArtifactsDir(useCaseId: string): Promise<void> {
  const dirAbs = resolveWithin(safeId(useCaseId));
  await fs.rm(dirAbs, { recursive: true, force: true });
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/artifact-storage.test.ts`
Expected: PASS (6 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/artifact-storage.ts src/lib/artifact-storage.test.ts
git commit -m "feat(knowledge): artifact disk storage with path-traversal guards"
```

---

## Task 4: Artifact validation schemas

**Files:**
- Create: `src/db/knowledge-artifacts-validation.ts`
- Test: `src/db/knowledge-artifacts-validation.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/db/knowledge-artifacts-validation.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import {
  createLinkArtifactSchema,
  createFileMetaSchema,
  updateArtifactSchema,
} from "./knowledge-artifacts-validation";

describe("artifact validation", () => {
  it("accepts a valid link artifact", () => {
    const parsed = createLinkArtifactSchema.safeParse({
      title: "Deck", type: "deck", status: "published",
      owner: "M. Wu", url: "https://example.com/x", changeNote: "init",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects a link artifact with a non-URL", () => {
    const parsed = createLinkArtifactSchema.safeParse({
      title: "Deck", type: "deck", status: "published", owner: "x", url: "not-a-url",
    });
    expect(parsed.success).toBe(false);
  });

  it("rejects an unknown type", () => {
    const parsed = createFileMetaSchema.safeParse({
      title: "P", type: "nope", status: "draft", owner: "x",
    });
    expect(parsed.success).toBe(false);
  });

  it("allows a partial patch", () => {
    expect(updateArtifactSchema.safeParse({ status: "deprecated" }).success).toBe(true);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/db/knowledge-artifacts-validation.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Create `src/db/knowledge-artifacts-validation.ts`**

```ts
import { z } from "zod";
import { ARTIFACT_TYPES, ARTIFACT_STATUSES } from "@/content/knowledge-artifacts";

const typeSchema = z.enum(ARTIFACT_TYPES as [string, ...string[]]);
const statusSchema = z.enum(ARTIFACT_STATUSES as [string, ...string[]]);

/** Shared metadata fields for create. */
const baseMeta = {
  title: z.string().min(1),
  type: typeSchema,
  status: statusSchema,
  owner: z.string().min(1),
  versionLabel: z.string().optional(),
  changeNote: z.string().optional(),
};

/** Link artifact create body (JSON). */
export const createLinkArtifactSchema = z.object({
  ...baseMeta,
  url: z.string().url(),
});

/** File artifact create — metadata fields parsed from multipart form values. */
export const createFileMetaSchema = z.object(baseMeta);

/** PATCH body: metadata changes and/or a status change; file replace is multipart. */
export const updateArtifactSchema = z
  .object({
    title: z.string().min(1).optional(),
    type: typeSchema.optional(),
    status: statusSchema.optional(),
    owner: z.string().min(1).optional(),
    versionLabel: z.string().optional(),
    url: z.string().url().optional(),
    changeNote: z.string().optional(),
  })
  .strict();

export type CreateLinkArtifactInput = z.infer<typeof createLinkArtifactSchema>;
export type CreateFileMetaInput = z.infer<typeof createFileMetaSchema>;
export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/db/knowledge-artifacts-validation.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/db/knowledge-artifacts-validation.ts src/db/knowledge-artifacts-validation.test.ts
git commit -m "feat(knowledge): zod schemas for artifact create/update"
```

---

## Task 5: Artifacts repository

**Files:**
- Create: `src/db/knowledge-artifacts-repo.ts`
- Test: `src/db/knowledge-artifacts-repo.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/db/knowledge-artifacts-repo.test.ts`:
```ts
import { describe, it, expect } from "vitest";

async function repo() {
  return import("./knowledge-artifacts-repo");
}

describe("artifacts repo", () => {
  it("creates and lists a link artifact", async () => {
    const { createLinkArtifact, listArtifacts } = await repo();
    const created = await createLinkArtifact("uc-1", {
      title: "Deck", type: "deck", status: "published", owner: "M. Wu",
      url: "https://example.com", changeNote: "init",
    });
    expect(created.kind).toBe("link");
    expect(created.url).toBe("https://example.com");
    expect(created.changelog).toHaveLength(1);
    const list = await listArtifacts("uc-1");
    expect(list).toHaveLength(1);
    expect(list[0].id).toBe(created.id);
  });

  it("appends a changelog entry on update", async () => {
    const { createLinkArtifact, updateArtifact } = await repo();
    const a = await createLinkArtifact("uc-1", {
      title: "Deck", type: "deck", status: "draft", owner: "x", url: "https://e.com",
    });
    const updated = await updateArtifact(a.id, { status: "published", changeNote: "shipped" });
    expect(updated?.status).toBe("published");
    expect(updated?.changelog).toHaveLength(2);
    expect(updated?.changelog.at(-1)?.note).toBe("shipped");
  });

  it("records a file artifact and replace overwrites current file", async () => {
    const { createFileArtifact, replaceArtifactFile, getArtifact } = await repo();
    const a = await createFileArtifact("uc-1", { title: "PB", type: "playbook", status: "draft", owner: "x" },
      { fileName: "v1.pdf", mimeType: "application/pdf", bytes: Buffer.from("one") });
    expect(a.file?.fileName).toBe("v1.pdf");
    const r = await replaceArtifactFile(a.id, { fileName: "v2.pdf", mimeType: "application/pdf", bytes: Buffer.from("two") }, "rev2");
    expect(r?.file?.fileName).toBe("v2.pdf");
    expect(r?.changelog.at(-1)?.note).toBe("rev2");
    expect((await getArtifact(a.id))?.file?.fileName).toBe("v2.pdf");
  });

  it("deletes an artifact", async () => {
    const { createLinkArtifact, deleteArtifact, listArtifacts } = await repo();
    const a = await createLinkArtifact("uc-9", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    expect(await deleteArtifact(a.id)).toBe(true);
    expect(await listArtifacts("uc-9")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/db/knowledge-artifacts-repo.test.ts`
Expected: FAIL — cannot find module.

- [ ] **Step 3: Create `src/db/knowledge-artifacts-repo.ts`**

```ts
import { eq } from "drizzle-orm";
import { db } from "./client";
import { knowledgeArtifacts, type KnowledgeArtifactRow } from "./schema";
import {
  DEFAULT_ARTIFACT_STATUS,
  type ArtifactChangeEntry,
  type KnowledgeArtifact,
} from "@/content/knowledge-artifacts";
import {
  writeArtifactFile,
  deleteArtifactDir,
} from "@/lib/artifact-storage";
import type {
  CreateFileMetaInput,
  CreateLinkArtifactInput,
  UpdateArtifactInput,
} from "./knowledge-artifacts-validation";

/** Monotonic-ish clock; isolated here so behavior is easy to reason about. */
function now(): number {
  return Date.now();
}

function toRow(a: KnowledgeArtifact): KnowledgeArtifactRow {
  return {
    id: a.id,
    useCaseId: a.useCaseId,
    kind: a.kind,
    type: a.type,
    status: a.status,
    updatedAt: a.updatedAt,
    data: JSON.stringify(a),
  };
}

function fromRow(row: KnowledgeArtifactRow): KnowledgeArtifact {
  return JSON.parse(row.data) as KnowledgeArtifact;
}

function newId(): string {
  return `art-${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function entry(author: string, note: string, versionLabel?: string): ArtifactChangeEntry {
  return { at: now(), author, note, versionLabel };
}

export async function listArtifacts(useCaseId: string): Promise<KnowledgeArtifact[]> {
  return db
    .select()
    .from(knowledgeArtifacts)
    .where(eq(knowledgeArtifacts.useCaseId, useCaseId))
    .all()
    .map(fromRow)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getArtifact(id: string): Promise<KnowledgeArtifact | undefined> {
  const row = db.select().from(knowledgeArtifacts).where(eq(knowledgeArtifacts.id, id)).get();
  return row ? fromRow(row) : undefined;
}

export async function createLinkArtifact(
  useCaseId: string,
  input: CreateLinkArtifactInput,
): Promise<KnowledgeArtifact> {
  const ts = now();
  const artifact: KnowledgeArtifact = {
    id: newId(),
    useCaseId,
    title: input.title,
    kind: "link",
    type: input.type as KnowledgeArtifact["type"],
    status: input.status as KnowledgeArtifact["status"],
    owner: input.owner,
    versionLabel: input.versionLabel,
    url: input.url,
    createdAt: ts,
    updatedAt: ts,
    changelog: [entry(input.owner, input.changeNote || "Created", input.versionLabel)],
  };
  db.insert(knowledgeArtifacts).values(toRow(artifact)).run();
  return artifact;
}

export interface FileUpload {
  fileName: string;
  mimeType: string;
  bytes: Buffer;
}

export async function createFileArtifact(
  useCaseId: string,
  input: CreateFileMetaInput,
  upload: FileUpload,
): Promise<KnowledgeArtifact> {
  const ts = now();
  const id = newId();
  const storagePath = await writeArtifactFile(useCaseId, id, upload.fileName, upload.bytes);
  const artifact: KnowledgeArtifact = {
    id,
    useCaseId,
    title: input.title,
    kind: "file",
    type: input.type as KnowledgeArtifact["type"],
    status: input.status as KnowledgeArtifact["status"],
    owner: input.owner,
    versionLabel: input.versionLabel,
    file: {
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      sizeBytes: upload.bytes.length,
      storagePath,
    },
    createdAt: ts,
    updatedAt: ts,
    changelog: [entry(input.owner, input.changeNote || "Created", input.versionLabel)],
  };
  db.insert(knowledgeArtifacts).values(toRow(artifact)).run();
  return artifact;
}

export async function updateArtifact(
  id: string,
  patch: UpdateArtifactInput,
): Promise<KnowledgeArtifact | undefined> {
  const existing = await getArtifact(id);
  if (!existing) return undefined;
  const { changeNote, ...fields } = patch;
  const updated: KnowledgeArtifact = {
    ...existing,
    ...fields,
    type: (fields.type ?? existing.type) as KnowledgeArtifact["type"],
    status: (fields.status ?? existing.status) as KnowledgeArtifact["status"],
    id: existing.id,
    kind: existing.kind,
    useCaseId: existing.useCaseId,
    updatedAt: now(),
    changelog: [
      ...existing.changelog,
      entry(fields.owner ?? existing.owner, changeNote || "Updated", fields.versionLabel ?? existing.versionLabel),
    ],
  };
  db.update(knowledgeArtifacts).set(toRow(updated)).where(eq(knowledgeArtifacts.id, id)).run();
  return updated;
}

export async function replaceArtifactFile(
  id: string,
  upload: FileUpload,
  changeNote?: string,
  versionLabel?: string,
): Promise<KnowledgeArtifact | undefined> {
  const existing = await getArtifact(id);
  if (!existing || existing.kind !== "file") return undefined;
  const storagePath = await writeArtifactFile(existing.useCaseId, existing.id, upload.fileName, upload.bytes);
  const updated: KnowledgeArtifact = {
    ...existing,
    file: {
      fileName: upload.fileName,
      mimeType: upload.mimeType,
      sizeBytes: upload.bytes.length,
      storagePath,
    },
    versionLabel: versionLabel ?? existing.versionLabel,
    updatedAt: now(),
    changelog: [...existing.changelog, entry(existing.owner, changeNote || "Replaced file", versionLabel)],
  };
  db.update(knowledgeArtifacts).set(toRow(updated)).where(eq(knowledgeArtifacts.id, id)).run();
  return updated;
}

export async function deleteArtifact(id: string): Promise<boolean> {
  const existing = await getArtifact(id);
  if (!existing) return false;
  db.delete(knowledgeArtifacts).where(eq(knowledgeArtifacts.id, id)).run();
  if (existing.kind === "file") {
    await deleteArtifactDir(existing.useCaseId, existing.id);
  }
  return true;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/db/knowledge-artifacts-repo.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/db/knowledge-artifacts-repo.ts src/db/knowledge-artifacts-repo.test.ts
git commit -m "feat(knowledge): artifacts repository (create/list/update/replace/delete + changelog)"
```

---

## Task 6: Cascade-delete artifacts with a use case

**Files:**
- Modify: `src/db/knowledge-repo.ts:197-200` (the `deleteUseCase` function)
- Test: `src/db/knowledge-cascade.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/db/knowledge-cascade.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("use-case delete cascades artifacts", () => {
  it("removes artifact rows when the use case is deleted", async () => {
    const { createLinkArtifact, listArtifacts } = await import("./knowledge-artifacts-repo");
    const { deleteUseCase } = await import("./knowledge-repo");
    await createLinkArtifact("uc-cascade", {
      title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com",
    });
    expect(await listArtifacts("uc-cascade")).toHaveLength(1);
    await deleteUseCase("uc-cascade"); // returns false (no such use case) but must still purge artifacts
    expect(await listArtifacts("uc-cascade")).toHaveLength(0);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/db/knowledge-cascade.test.ts`
Expected: FAIL — artifacts still present after delete.

- [ ] **Step 3: Update `deleteUseCase` in `src/db/knowledge-repo.ts`**

Add imports at the top of the file (after the existing imports):
```ts
import { knowledgeArtifacts } from "./schema";
import { deleteUseCaseArtifactsDir } from "@/lib/artifact-storage";
```
Replace the existing `deleteUseCase` (lines ~197-200) with:
```ts
export async function deleteUseCase(id: string): Promise<boolean> {
  // Cascade: remove the use case's artifact rows and on-disk bytes first.
  db.delete(knowledgeArtifacts).where(eq(knowledgeArtifacts.useCaseId, id)).run();
  await deleteUseCaseArtifactsDir(id);
  const result = db.delete(knowledgeUseCases).where(eq(knowledgeUseCases.id, id)).run();
  return result.changes > 0;
}
```
> Note: `knowledgeUseCases` and `eq` are already imported at the top of the file.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/db/knowledge-cascade.test.ts`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/db/knowledge-repo.ts src/db/knowledge-cascade.test.ts
git commit -m "feat(knowledge): cascade-delete artifacts with their use case"
```

---

## Task 7: API routes — list + create

**Files:**
- Create: `src/app/api/knowledge/use-cases/[id]/artifacts/route.ts`
- Test: `src/app/api/knowledge/use-cases/[id]/artifacts/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create the test:
```ts
import { describe, it, expect } from "vitest";
import { GET, POST } from "./route";

function ctx(id: string) {
  return { params: Promise.resolve({ id }) };
}

describe("artifacts collection route", () => {
  it("creates a link artifact via JSON POST and lists it", async () => {
    const post = await POST(
      new Request("http://t/api", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "Deck", type: "deck", status: "published", owner: "M", url: "https://e.com" }),
      }) as never,
      ctx("uc-route-1"),
    );
    expect(post.status).toBe(201);

    const get = await GET(new Request("http://t/api") as never, ctx("uc-route-1"));
    const body = await get.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveLength(1);
  });

  it("rejects a bad link body with 400", async () => {
    const res = await POST(
      new Request("http://t/api", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ title: "", type: "deck", status: "published", owner: "M", url: "nope" }),
      }) as never,
      ctx("uc-route-2"),
    );
    expect(res.status).toBe(400);
  });

  it("creates a file artifact via multipart POST", async () => {
    const fd = new FormData();
    fd.set("title", "PB");
    fd.set("type", "playbook");
    fd.set("status", "draft");
    fd.set("owner", "A");
    fd.set("file", new File([new Uint8Array([1, 2, 3])], "pb.pdf", { type: "application/pdf" }));
    const res = await POST(
      new Request("http://t/api", { method: "POST", body: fd }) as never,
      ctx("uc-route-3"),
    );
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.data.kind).toBe("file");
    expect(body.data.file.fileName).toBe("pb.pdf");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "src/app/api/knowledge/use-cases/[id]/artifacts/route.test.ts"`
Expected: FAIL — cannot find module `./route`.

- [ ] **Step 3: Create the route**

```ts
import type { NextRequest } from "next/server";
import {
  listArtifacts,
  createLinkArtifact,
  createFileArtifact,
} from "@/db/knowledge-artifacts-repo";
import {
  createLinkArtifactSchema,
  createFileMetaSchema,
} from "@/db/knowledge-artifacts-validation";
import { MAX_ARTIFACT_BYTES, ALLOWED_ARTIFACT_MIME } from "@/content/knowledge-artifacts";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function zodMessage(error: { issues: { path: (string | number)[]; message: string }[] }): string {
  return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
}

/** GET — list artifacts for a use case. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    return ok(await listArtifacts(id));
  } catch (error) {
    console.error("[GET artifacts]", error);
    return fail(errorMessage(error), 500);
  }
}

/** POST — create a link (JSON) or file (multipart) artifact. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const meta = createFileMetaSchema.safeParse({
        title: form.get("title"),
        type: form.get("type"),
        status: form.get("status"),
        owner: form.get("owner"),
        versionLabel: form.get("versionLabel") ?? undefined,
        changeNote: form.get("changeNote") ?? undefined,
      });
      if (!meta.success) return fail(zodMessage(meta.error), 400);

      const file = form.get("file");
      if (!(file instanceof File)) return fail("file is required", 400);
      if (file.size > MAX_ARTIFACT_BYTES) return fail("File exceeds 25 MB limit", 400);
      if (!ALLOWED_ARTIFACT_MIME.includes(file.type)) return fail(`Unsupported file type: ${file.type}`, 400);

      const bytes = Buffer.from(await file.arrayBuffer());
      const created = await createFileArtifact(id, meta.data, {
        fileName: file.name, mimeType: file.type, bytes,
      });
      return ok(created, 201);
    }

    const body = await request.json().catch(() => null);
    if (body === null) return fail("Invalid JSON body", 400);
    const parsed = createLinkArtifactSchema.safeParse(body);
    if (!parsed.success) return fail(zodMessage(parsed.error), 400);
    return ok(await createLinkArtifact(id, parsed.data), 201);
  } catch (error) {
    console.error("[POST artifacts]", error);
    return fail(errorMessage(error), 500);
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- "src/app/api/knowledge/use-cases/[id]/artifacts/route.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 5: Commit**

```bash
git add "src/app/api/knowledge/use-cases/[id]/artifacts/"
git commit -m "feat(knowledge): artifacts list/create API route"
```

---

## Task 8: API routes — patch, delete, download

**Files:**
- Create: `src/app/api/knowledge/artifacts/[aid]/route.ts`
- Create: `src/app/api/knowledge/artifacts/[aid]/download/route.ts`
- Test: `src/app/api/knowledge/artifacts/[aid]/route.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/app/api/knowledge/artifacts/[aid]/route.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { PATCH, DELETE } from "./route";
import { createLinkArtifact } from "@/db/knowledge-artifacts-repo";

function ctx(aid: string) {
  return { params: Promise.resolve({ aid }) };
}

describe("single artifact route", () => {
  it("patches status and appends changelog", async () => {
    const a = await createLinkArtifact("uc-p", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    const res = await PATCH(
      new Request("http://t", {
        method: "PATCH", headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: "published", changeNote: "go" }),
      }) as never,
      ctx(a.id),
    );
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data.status).toBe("published");
    expect(body.data.changelog).toHaveLength(2);
  });

  it("returns 404 patching a missing artifact", async () => {
    const res = await PATCH(
      new Request("http://t", { method: "PATCH", headers: { "content-type": "application/json" }, body: "{}" }) as never,
      ctx("art-missing"),
    );
    expect(res.status).toBe(404);
  });

  it("deletes an artifact", async () => {
    const a = await createLinkArtifact("uc-d", { title: "L", type: "other", status: "draft", owner: "x", url: "https://e.com" });
    const res = await DELETE(new Request("http://t", { method: "DELETE" }) as never, ctx(a.id));
    expect(res.status).toBe(200);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- "src/app/api/knowledge/artifacts/[aid]/route.test.ts"`
Expected: FAIL — cannot find module `./route`.

- [ ] **Step 3: Create `src/app/api/knowledge/artifacts/[aid]/route.ts`**

```ts
import type { NextRequest } from "next/server";
import {
  updateArtifact,
  replaceArtifactFile,
  deleteArtifact,
} from "@/db/knowledge-artifacts-repo";
import { updateArtifactSchema } from "@/db/knowledge-artifacts-validation";
import { MAX_ARTIFACT_BYTES, ALLOWED_ARTIFACT_MIME } from "@/content/knowledge-artifacts";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ aid: string }>;
}

function zodMessage(error: { issues: { path: (string | number)[]; message: string }[] }): string {
  return error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; ");
}

/** PATCH — metadata/status update (JSON) or file replace (multipart). */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { aid } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    if (contentType.includes("multipart/form-data")) {
      const form = await request.formData();
      const file = form.get("file");
      if (!(file instanceof File)) return fail("file is required", 400);
      if (file.size > MAX_ARTIFACT_BYTES) return fail("File exceeds 25 MB limit", 400);
      if (!ALLOWED_ARTIFACT_MIME.includes(file.type)) return fail(`Unsupported file type: ${file.type}`, 400);
      const bytes = Buffer.from(await file.arrayBuffer());
      const replaced = await replaceArtifactFile(
        aid,
        { fileName: file.name, mimeType: file.type, bytes },
        (form.get("changeNote") as string) || undefined,
        (form.get("versionLabel") as string) || undefined,
      );
      if (!replaced) return fail("File artifact not found", 404);
      return ok(replaced);
    }

    const body = await request.json().catch(() => null);
    if (body === null) return fail("Invalid JSON body", 400);
    const parsed = updateArtifactSchema.safeParse(body);
    if (!parsed.success) return fail(zodMessage(parsed.error), 400);
    const updated = await updateArtifact(aid, parsed.data);
    if (!updated) return fail("Artifact not found", 404);
    return ok(updated);
  } catch (error) {
    console.error("[PATCH artifact]", error);
    return fail(errorMessage(error), 500);
  }
}

/** DELETE — remove an artifact and its bytes. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { aid } = await params;
    const deleted = await deleteArtifact(aid);
    if (!deleted) return fail("Artifact not found", 404);
    return ok({ id: aid });
  } catch (error) {
    console.error("[DELETE artifact]", error);
    return fail(errorMessage(error), 500);
  }
}
```

- [ ] **Step 4: Create `src/app/api/knowledge/artifacts/[aid]/download/route.ts`**

```ts
import type { NextRequest } from "next/server";
import { getArtifact } from "@/db/knowledge-artifacts-repo";
import { readArtifactFile } from "@/lib/artifact-storage";
import { fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ aid: string }>;
}

/** GET — stream the current file bytes of a file artifact. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { aid } = await params;
    const artifact = await getArtifact(aid);
    if (!artifact || artifact.kind !== "file" || !artifact.file) {
      return fail("File artifact not found", 404);
    }
    const bytes = await readArtifactFile(artifact.file.storagePath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": artifact.file.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(artifact.file.fileName)}"`,
      },
    });
  } catch (error) {
    console.error("[GET artifact download]", error);
    return fail(errorMessage(error), 500);
  }
}
```

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- "src/app/api/knowledge/artifacts/[aid]/route.test.ts"`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**

```bash
git add "src/app/api/knowledge/artifacts/"
git commit -m "feat(knowledge): artifact patch/delete/download API routes"
```

---

## Task 9: API client helpers

**Files:**
- Modify: `src/lib/api-client.ts` (append after the existing `setUseCaseValidation`, ~line 230)
- Test: `src/lib/api-client-artifacts.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/lib/api-client-artifacts.test.ts`:
```ts
import { describe, it, expect, vi, afterEach } from "vitest";
import {
  listArtifacts,
  createLinkArtifact,
  updateArtifact,
  deleteArtifact,
} from "./api-client";

function jsonResponse(data: unknown) {
  return { ok: true, json: async () => ({ success: true, data }) } as Response;
}

afterEach(() => vi.restoreAllMocks());

describe("artifact api-client", () => {
  it("GETs the artifact list for a use case", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse([]));
    await listArtifacts("uc-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/knowledge/use-cases/uc-1/artifacts", { method: "GET" });
  });

  it("POSTs a link artifact as JSON", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await createLinkArtifact("uc-1", { title: "D", type: "deck", status: "draft", owner: "x", url: "https://e.com" });
    const [, init] = fetchMock.mock.calls[0];
    expect((init as RequestInit).method).toBe("POST");
    expect((init as RequestInit).headers).toMatchObject({ "Content-Type": "application/json" });
  });

  it("DELETEs an artifact by id", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await deleteArtifact("art-1");
    expect(fetchMock).toHaveBeenCalledWith("/api/knowledge/artifacts/art-1", { method: "DELETE" });
  });

  it("PATCHes artifact metadata as JSON", async () => {
    const fetchMock = vi.spyOn(global, "fetch").mockResolvedValue(jsonResponse({ id: "art-1" }));
    await updateArtifact("art-1", { status: "published" });
    const [url, init] = fetchMock.mock.calls[0];
    expect(url).toBe("/api/knowledge/artifacts/art-1");
    expect((init as RequestInit).method).toBe("PATCH");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/lib/api-client-artifacts.test.ts`
Expected: FAIL — `listArtifacts` (etc.) not exported.

- [ ] **Step 3: Append helpers to `src/lib/api-client.ts`**

First add to the imports at the top:
```ts
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import type {
  CreateLinkArtifactInput,
  UpdateArtifactInput,
} from "@/db/knowledge-artifacts-validation";
```
Then append at the end of the file (reuse the existing `parse<T>` helper already in this module):
```ts
// ─── knowledge artifacts ──────────────────────────────────────
export async function listArtifacts(useCaseId: string): Promise<KnowledgeArtifact[]> {
  const res = await fetch(`/api/knowledge/use-cases/${encodeURIComponent(useCaseId)}/artifacts`, {
    method: "GET",
  });
  return parse<KnowledgeArtifact[]>(res);
}

export async function createLinkArtifact(
  useCaseId: string,
  input: CreateLinkArtifactInput,
): Promise<KnowledgeArtifact> {
  const res = await fetch(`/api/knowledge/use-cases/${encodeURIComponent(useCaseId)}/artifacts`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  return parse<KnowledgeArtifact>(res);
}

/** Create a file artifact (multipart). `meta` carries the non-file fields. */
export async function createFileArtifact(
  useCaseId: string,
  form: FormData,
): Promise<KnowledgeArtifact> {
  const res = await fetch(`/api/knowledge/use-cases/${encodeURIComponent(useCaseId)}/artifacts`, {
    method: "POST",
    body: form,
  });
  return parse<KnowledgeArtifact>(res);
}

export async function updateArtifact(
  id: string,
  patch: UpdateArtifactInput,
): Promise<KnowledgeArtifact> {
  const res = await fetch(`/api/knowledge/artifacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(patch),
  });
  return parse<KnowledgeArtifact>(res);
}

export async function replaceArtifactFile(id: string, form: FormData): Promise<KnowledgeArtifact> {
  const res = await fetch(`/api/knowledge/artifacts/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: form,
  });
  return parse<KnowledgeArtifact>(res);
}

export async function deleteArtifact(id: string): Promise<{ id: string }> {
  const res = await fetch(`/api/knowledge/artifacts/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  return parse<{ id: string }>(res);
}

export function artifactDownloadUrl(id: string): string {
  return `/api/knowledge/artifacts/${encodeURIComponent(id)}/download`;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- src/lib/api-client-artifacts.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/lib/api-client.ts src/lib/api-client-artifacts.test.ts
git commit -m "feat(knowledge): api-client helpers for artifacts"
```

---

## Task 10: i18n keys (en + zh)

**Files:**
- Modify: `src/lib/i18n.ts` (the `knowledge:` blocks at the en ~line 264 and zh ~line 590, and the type block ~line 24)

- [ ] **Step 1: Add the artifact keys to the `knowledge` TYPE block**

In the `knowledge: { ... }` type definition, add these keys (all `string`):
```ts
    tabEvidence: string;
    tabArtifacts: string;
    artifacts: string;
    addArtifact: string;
    editArtifact: string;
    replaceFile: string;
    download: string;
    openLink: string;
    artifactTitle: string;
    artifactKind: string;
    artifactKindFile: string;
    artifactKindLink: string;
    artifactType: string;
    artifactStatus: string;
    artifactOwner: string;
    artifactVersion: string;
    artifactUrl: string;
    changeNote: string;
    changeLog: string;
    noArtifacts: string;
    statusDraft: string;
    statusPublished: string;
    statusDeprecated: string;
    hasArtifacts: string;
    publishedAssets: string;
```

- [ ] **Step 2: Add English values**

In the EN `knowledge: {` block, add:
```ts
      tabEvidence: "Evidence",
      tabArtifacts: "Artifacts",
      artifacts: "Artifacts",
      addArtifact: "Add artifact",
      editArtifact: "Edit artifact",
      replaceFile: "Replace",
      download: "Download",
      openLink: "Open",
      artifactTitle: "Title",
      artifactKind: "Kind",
      artifactKindFile: "Upload file",
      artifactKindLink: "External link",
      artifactType: "Type",
      artifactStatus: "Status",
      artifactOwner: "Owner",
      artifactVersion: "Version",
      artifactUrl: "URL",
      changeNote: "Change note",
      changeLog: "Change log",
      noArtifacts: "No artifacts yet.",
      statusDraft: "Draft",
      statusPublished: "Published",
      statusDeprecated: "Deprecated",
      hasArtifacts: "Has artifacts",
      publishedAssets: "Published",
```

- [ ] **Step 3: Add Simplified-Chinese values**

In the ZH `knowledge: {` block, add:
```ts
      tabEvidence: "佐证",
      tabArtifacts: "知识资产",
      artifacts: "知识资产",
      addArtifact: "添加资产",
      editArtifact: "编辑资产",
      replaceFile: "替换",
      download: "下载",
      openLink: "打开",
      artifactTitle: "标题",
      artifactKind: "类型",
      artifactKindFile: "上传文件",
      artifactKindLink: "外部链接",
      artifactType: "分类",
      artifactStatus: "状态",
      artifactOwner: "负责人",
      artifactVersion: "版本",
      artifactUrl: "链接",
      changeNote: "变更说明",
      changeLog: "变更记录",
      noArtifacts: "暂无知识资产。",
      statusDraft: "草稿",
      statusPublished: "已发布",
      statusDeprecated: "已弃用",
      hasArtifacts: "含资产",
      publishedAssets: "已发布",
```

- [ ] **Step 4: Verify the type-checks pass**

Run: `npx tsc --noEmit`
Expected: no errors referencing `t.knowledge` keys. (Run will also be re-checked after UI tasks.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/i18n.ts
git commit -m "feat(knowledge): i18n keys for artifacts + evidence tab (en/zh)"
```

---

## Task 11: Evidence tab (merge References + Validation)

**Files:**
- Create: `src/app/knowledge/_components/editor/evidence-tab.tsx`
- Test: `src/app/knowledge/_components/editor/evidence-tab.test.tsx`
- Modify: `src/app/knowledge/_components/use-case-editor.tsx`
- Delete: `references-tab.tsx`, `validation-tab.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/knowledge/_components/editor/evidence-tab.test.tsx`:
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { EvidenceTab } from "./evidence-tab";
import type { KnowledgeUseCase } from "@/content/knowledge";

const useCase = {
  id: "uc-1", workflowId: "wf-1", sectorId: "s", industryId: "i", companyId: "c", functionId: "f",
  name: "X", domain: "D", description: "", kpis: [], techTag: "GenAI", maturity: "pilot",
  businessObjectives: [], archetypes: [], references: [{ name: "Comp A", detail: "did X" }],
  validation: { status: "partial", note: "some evidence" },
} as KnowledgeUseCase;

describe("EvidenceTab", () => {
  it("renders both validation status and references in one tab", () => {
    render(
      <LocaleProvider>
        <EvidenceTab useCase={useCase} onPatch={vi.fn()} onSetValidation={vi.fn()} />
      </LocaleProvider>,
    );
    expect(screen.getByDisplayValue("some evidence")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Comp A")).toBeInTheDocument();
  });
});
```
> Confirmed: `src/lib/locale-context.tsx` exports `LocaleProvider({ children })` (no required props) and `useLocale()`. The import above is correct as written; reuse this wrapper in every component test.

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/knowledge/_components/editor/evidence-tab.test.tsx`
Expected: FAIL — cannot find module `./evidence-tab`.

- [ ] **Step 3: Create `evidence-tab.tsx`**

Compose the two existing panels into one. The validation half reuses the same controls as the old `validation-tab.tsx`; the references half reuses the old `references-tab.tsx` logic. Save buttons stay independent (validation → its own endpoint; references → use-case PATCH).
```tsx
"use client";

import { useState } from "react";
import type { KnowledgeUseCase, UseCaseReference, ValidationStatus } from "@/content/knowledge";
import { VALIDATION_STATUSES } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FIELD_CLASS, SaveBar } from "../field";
import { validationDotClass, validationLabel } from "../display";

interface EvidenceTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
  onSetValidation: (id: string, status: ValidationStatus, note: string) => Promise<void>;
}

function clean(rows: UseCaseReference[]): UseCaseReference[] {
  return rows.map((r) => ({ name: r.name.trim(), detail: r.detail.trim() })).filter((r) => r.name.length > 0);
}

/** Merged Evidence tab: validation status + note, then market/competitor references. */
export function EvidenceTab({ useCase, onPatch, onSetValidation }: EvidenceTabProps) {
  const { t } = useLocale();

  // validation half
  const [status, setStatus] = useState<ValidationStatus>(useCase.validation.status);
  const [note, setNote] = useState(useCase.validation.note);
  const [vSaving, setVSaving] = useState(false);
  const [vError, setVError] = useState<string | null>(null);
  const vDirty = status !== useCase.validation.status || note !== useCase.validation.note;

  // references half
  const [rows, setRows] = useState<UseCaseReference[]>(useCase.references);
  const [rSaving, setRSaving] = useState(false);
  const [rError, setRError] = useState<string | null>(null);
  const rDirty = JSON.stringify(clean(rows)) !== JSON.stringify(useCase.references);

  async function saveValidation() {
    setVSaving(true);
    setVError(null);
    try {
      await onSetValidation(useCase.id, status, note);
    } catch (e) {
      setVError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setVSaving(false);
    }
  }

  async function saveReferences() {
    setRSaving(true);
    setRError(null);
    try {
      await onPatch({ references: clean(rows) });
    } catch (e) {
      setRError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setRSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t.knowledge.tabValidation}
        </p>
        <div className="flex flex-wrap gap-1.5">
          {VALIDATION_STATUSES.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setStatus(s)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition",
                status === s
                  ? "border-indigo-300 bg-indigo-50 text-indigo-700 dark:border-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300"
                  : "border-slate-200 text-slate-500 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800",
              )}
            >
              <span className={cn("h-2 w-2 rounded-full", validationDotClass(s))} />
              {validationLabel(t, s)}
            </button>
          ))}
        </div>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder={t.knowledge.notePlaceholder}
          rows={4}
          className={cn(FIELD_CLASS, "mt-3")}
        />
        <SaveBar dirty={vDirty} saving={vSaving} error={vError} saveLabel={t.common.save} savingLabel={t.common.save + "…"} onSave={saveValidation}>
          {vDirty ? t.knowledge.unsavedChanges : t.common.saved}
        </SaveBar>
      </section>

      <section>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          {t.knowledge.tabReferences}
        </p>
        <div className="space-y-3">
          {rows.length === 0 && <p className="text-sm text-slate-400">{t.knowledge.noReferences}</p>}
          {rows.map((row, i) => (
            <div key={i} className="space-y-2 rounded-lg border border-slate-200 p-3 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <input
                  className={FIELD_CLASS}
                  placeholder={t.knowledge.refName}
                  value={row.name}
                  onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, name: e.target.value } : r)))}
                />
                <Button
                  variant="ghost"
                  className="shrink-0 px-2.5 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                  onClick={() => setRows((prev) => prev.filter((_, j) => j !== i))}
                >
                  {t.knowledge.removeReference}
                </Button>
              </div>
              <textarea
                className={FIELD_CLASS}
                rows={2}
                placeholder={t.knowledge.refDetail}
                value={row.detail}
                onChange={(e) => setRows((prev) => prev.map((r, j) => (j === i ? { ...r, detail: e.target.value } : r)))}
              />
            </div>
          ))}
          <Button variant="secondary" className="text-xs" onClick={() => setRows((prev) => [...prev, { name: "", detail: "" }])}>
            + {t.knowledge.addReference}
          </Button>
        </div>
        <SaveBar dirty={rDirty} saving={rSaving} error={rError} saveLabel={t.common.save} savingLabel={t.common.save + "…"} onSave={saveReferences}>
          {rDirty ? t.knowledge.unsavedChanges : t.common.saved}
        </SaveBar>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Wire it into `use-case-editor.tsx`**

In `src/app/knowledge/_components/use-case-editor.tsx`:
1. Replace the `EditorTab` type:
```ts
type EditorTab = "overview" | "impact" | "agentic" | "artifacts" | "evidence";
```
2. Replace the imports of `ReferencesTab`, `ValidationTab` with:
```ts
import { EvidenceTab } from "./editor/evidence-tab";
import { ArtifactsTab } from "./editor/artifacts-tab"; // created in Task 12
```
3. Replace the `tabs` array with:
```ts
  const tabs: ReadonlyArray<SegTab<EditorTab>> = [
    { value: "overview", label: t.knowledge.tabOverview },
    { value: "impact", label: t.knowledge.tabImpact },
    { value: "agentic", label: t.knowledge.tabAgentic },
    { value: "artifacts", label: t.knowledge.tabArtifacts },
    { value: "evidence", label: t.knowledge.tabEvidence },
  ];
```
4. Replace the panel render block (the two old `references`/`validation` divs) with:
```tsx
          <div className={tab === "artifacts" ? "" : "hidden"}>
            <ArtifactsTab useCaseId={useCase.id} />
          </div>
          <div className={tab === "evidence" ? "" : "hidden"}>
            <EvidenceTab useCase={useCase} onPatch={patch} onSetValidation={onSetValidation} />
          </div>
```

- [ ] **Step 5: Delete the obsolete tab files**

```bash
git rm src/app/knowledge/_components/editor/references-tab.tsx src/app/knowledge/_components/editor/validation-tab.tsx
```

- [ ] **Step 6: Run the test + typecheck**

Run: `npm test -- src/app/knowledge/_components/editor/evidence-tab.test.tsx`
Expected: PASS (1 test).
> Task 12 creates `ArtifactsTab`; until then `use-case-editor.tsx` will not typecheck. Do Step 7 commit, then proceed to Task 12 before running `tsc`.

- [ ] **Step 7: Commit**

```bash
git add src/app/knowledge/_components/editor/evidence-tab.tsx src/app/knowledge/_components/editor/evidence-tab.test.tsx src/app/knowledge/_components/use-case-editor.tsx
git commit -m "feat(knowledge): merge References + Validation into Evidence tab"
```

---

## Task 12: Artifacts tab UI

**Files:**
- Create: `src/app/knowledge/_components/editor/artifacts-tab.tsx`
- Create: `src/app/knowledge/_components/editor/artifact-form.tsx`
- Create: `src/app/knowledge/_components/editor/artifact-row.tsx`
- Test: `src/app/knowledge/_components/editor/artifacts-tab.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/app/knowledge/_components/editor/artifacts-tab.test.tsx`:
```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { ArtifactsTab } from "./artifacts-tab";
import * as api from "@/lib/api-client";

vi.mock("@/lib/api-client", async (orig) => ({
  ...(await orig<typeof import("@/lib/api-client")>()),
  listArtifacts: vi.fn(),
}));

beforeEach(() => vi.clearAllMocks());

describe("ArtifactsTab", () => {
  it("shows empty state when there are no artifacts", async () => {
    vi.mocked(api.listArtifacts).mockResolvedValue([]);
    render(
      <LocaleProvider>
        <ArtifactsTab useCaseId="uc-1" />
      </LocaleProvider>,
    );
    await waitFor(() => expect(screen.getByText(/no artifacts yet/i)).toBeInTheDocument());
  });

  it("lists artifacts returned by the API", async () => {
    vi.mocked(api.listArtifacts).mockResolvedValue([
      {
        id: "art-1", useCaseId: "uc-1", title: "Underwriting Playbook", kind: "link",
        type: "playbook", status: "published", owner: "A", url: "https://e.com",
        createdAt: 1, updatedAt: 2, changelog: [],
      },
    ]);
    render(
      <LocaleProvider>
        <ArtifactsTab useCaseId="uc-1" />
      </LocaleProvider>,
    );
    await waitFor(() => expect(screen.getByText("Underwriting Playbook")).toBeInTheDocument());
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- src/app/knowledge/_components/editor/artifacts-tab.test.tsx`
Expected: FAIL — cannot find module `./artifacts-tab`.

- [ ] **Step 3: Create `artifact-row.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { artifactDownloadUrl } from "@/lib/api-client";

const STATUS_CLASS: Record<KnowledgeArtifact["status"], string> = {
  draft: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  published: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300",
  deprecated: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
};

interface ArtifactRowProps {
  artifact: KnowledgeArtifact;
  onEdit: (a: KnowledgeArtifact) => void;
  onReplace: (a: KnowledgeArtifact) => void;
  onDelete: (a: KnowledgeArtifact) => void;
  statusLabel: (s: KnowledgeArtifact["status"]) => string;
}

export function ArtifactRow({ artifact, onEdit, onReplace, onDelete, statusLabel }: ArtifactRowProps) {
  const { t } = useLocale();
  const [showLog, setShowLog] = useState(false);
  const isFile = artifact.kind === "file";

  return (
    <div className="rounded-xl border border-slate-200 p-3 dark:border-slate-800">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-1.5">
            <span>{isFile ? "📄" : "🔗"}</span>
            <span className="font-medium text-slate-800 dark:text-slate-100">{artifact.title}</span>
            <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-semibold", STATUS_CLASS[artifact.status])}>
              {statusLabel(artifact.status)}
            </span>
            <span className="rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              {artifact.type}
            </span>
          </div>
          <p className="mt-1 truncate text-xs text-slate-400">
            {isFile
              ? `${artifact.file?.fileName} · ${(((artifact.file?.sizeBytes ?? 0) / 1024) | 0)} KB`
              : artifact.url}
            {artifact.versionLabel ? ` · ${artifact.versionLabel}` : ""} · {artifact.owner}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-1.5 text-xs">
          {isFile ? (
            <a className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" href={artifactDownloadUrl(artifact.id)}>
              ⤓ {t.knowledge.download}
            </a>
          ) : (
            <a className="rounded-lg border border-slate-200 px-2 py-1 hover:bg-slate-50 dark:border-slate-700 dark:hover:bg-slate-800" href={artifact.url} target="_blank" rel="noreferrer">
              ↗ {t.knowledge.openLink}
            </a>
          )}
          {isFile && (
            <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onReplace(artifact)}>
              {t.knowledge.replaceFile}
            </Button>
          )}
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={() => onEdit(artifact)}>
            {t.common.edit}
          </Button>
          <Button variant="ghost" className="px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30" onClick={() => onDelete(artifact)}>
            {t.common.delete}
          </Button>
        </div>
      </div>
      {artifact.changelog.length > 0 && (
        <div className="mt-2">
          <button type="button" className="text-xs font-semibold text-indigo-600 dark:text-indigo-400" onClick={() => setShowLog((v) => !v)}>
            {t.knowledge.changeLog} ({artifact.changelog.length})
          </button>
          {showLog && (
            <ul className="mt-1 space-y-0.5 pl-4 text-xs text-slate-500">
              {artifact.changelog
                .slice()
                .reverse()
                .map((e, i) => (
                  <li key={i}>
                    {new Date(e.at).toISOString().slice(0, 10)} · {e.author}
                    {e.versionLabel ? ` · ${e.versionLabel}` : ""} — {e.note}
                  </li>
                ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```
> Confirmed: `t.common.edit`, `t.common.delete`, `t.common.save`, `t.common.saved`, `t.common.close` all already exist in `i18n.ts` (en + zh). No new `common` keys needed.

- [ ] **Step 4: Create `artifact-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import type { KnowledgeArtifact, ArtifactType, ArtifactStatus, ArtifactKind } from "@/content/knowledge-artifacts";
import { ARTIFACT_TYPES, ARTIFACT_STATUSES } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import { Field, FIELD_CLASS } from "../field";

export interface ArtifactDraft {
  mode: "create" | "edit" | "replace";
  artifact?: KnowledgeArtifact;
}

export interface ArtifactSubmit {
  title: string;
  type: ArtifactType;
  status: ArtifactStatus;
  owner: string;
  versionLabel?: string;
  changeNote?: string;
  kind: ArtifactKind;
  url?: string;
  file?: File;
}

interface ArtifactFormProps {
  draft: ArtifactDraft;
  onSubmit: (values: ArtifactSubmit) => Promise<void>;
  onCancel: () => void;
}

export function ArtifactForm({ draft, onSubmit, onCancel }: ArtifactFormProps) {
  const { t } = useLocale();
  const a = draft.artifact;
  const [title, setTitle] = useState(a?.title ?? "");
  const [kind, setKind] = useState<ArtifactKind>(a?.kind ?? "file");
  const [type, setType] = useState<ArtifactType>(a?.type ?? "playbook");
  const [status, setStatus] = useState<ArtifactStatus>(a?.status ?? "draft");
  const [owner, setOwner] = useState(a?.owner ?? "");
  const [versionLabel, setVersionLabel] = useState(a?.versionLabel ?? "");
  const [url, setUrl] = useState(a?.url ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [changeNote, setChangeNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const lockKind = draft.mode !== "create";

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim() || !owner.trim()) {
      setError(t.knowledge.saveError);
      return;
    }
    if (kind === "file" && draft.mode !== "edit" && !file) {
      setError("Please choose a file");
      return;
    }
    if (kind === "link" && !url.trim()) {
      setError("Please enter a URL");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit({
        title: title.trim(), type, status, owner: owner.trim(),
        versionLabel: versionLabel.trim() || undefined,
        changeNote: changeNote.trim() || undefined,
        kind, url: kind === "link" ? url.trim() : undefined, file: file ?? undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3 rounded-xl border border-indigo-200 bg-indigo-50/40 p-4 dark:border-indigo-800 dark:bg-indigo-900/10">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <Field label={t.knowledge.artifactTitle} className="md:col-span-2">
          <input className={FIELD_CLASS} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t.knowledge.artifactKind}>
          <select className={FIELD_CLASS} value={kind} disabled={lockKind} onChange={(e) => setKind(e.target.value as ArtifactKind)}>
            <option value="file">{t.knowledge.artifactKindFile}</option>
            <option value="link">{t.knowledge.artifactKindLink}</option>
          </select>
        </Field>
        <Field label={t.knowledge.artifactType}>
          <select className={FIELD_CLASS} value={type} onChange={(e) => setType(e.target.value as ArtifactType)}>
            {ARTIFACT_TYPES.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
        </Field>
        {kind === "file" ? (
          <Field label="File" className="md:col-span-2">
            <input type="file" className={FIELD_CLASS} onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
          </Field>
        ) : (
          <Field label={t.knowledge.artifactUrl} className="md:col-span-2">
            <input className={FIELD_CLASS} value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://…" />
          </Field>
        )}
        <Field label={t.knowledge.artifactStatus}>
          <select className={FIELD_CLASS} value={status} onChange={(e) => setStatus(e.target.value as ArtifactStatus)}>
            {ARTIFACT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
        <Field label={t.knowledge.artifactOwner}>
          <input className={FIELD_CLASS} value={owner} onChange={(e) => setOwner(e.target.value)} />
        </Field>
        <Field label={t.knowledge.artifactVersion}>
          <input className={FIELD_CLASS} value={versionLabel} onChange={(e) => setVersionLabel(e.target.value)} placeholder="v1" />
        </Field>
        <Field label={t.knowledge.changeNote} className="md:col-span-2">
          <input className={FIELD_CLASS} value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />
        </Field>
      </div>
      {error && <p className="text-xs text-rose-600">{error}</p>}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onCancel}>{t.common.cancel}</Button>
        <Button type="submit" disabled={saving}>{saving ? t.common.save + "…" : t.common.save}</Button>
      </div>
    </form>
  );
}
```
> Confirmed: `t.common.cancel` and `t.common.edit` already exist (en + zh). `src/components/ui/button.tsx` extends `ButtonHTMLAttributes`, defaults `type="button"`, and spreads `...rest`, so `<Button type="submit">` works as written.

- [ ] **Step 5: Create `artifacts-tab.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { KnowledgeArtifact } from "@/content/knowledge-artifacts";
import { useLocale } from "@/lib/locale-context";
import { Button } from "@/components/ui/button";
import {
  listArtifacts,
  createLinkArtifact,
  createFileArtifact,
  updateArtifact,
  replaceArtifactFile,
  deleteArtifact,
} from "@/lib/api-client";
import { ArtifactRow } from "./artifact-row";
import { ArtifactForm, type ArtifactDraft, type ArtifactSubmit } from "./artifact-form";

interface ArtifactsTabProps {
  useCaseId: string;
}

function buildForm(values: ArtifactSubmit): FormData {
  const fd = new FormData();
  fd.set("title", values.title);
  fd.set("type", values.type);
  fd.set("status", values.status);
  fd.set("owner", values.owner);
  if (values.versionLabel) fd.set("versionLabel", values.versionLabel);
  if (values.changeNote) fd.set("changeNote", values.changeNote);
  if (values.file) fd.set("file", values.file);
  return fd;
}

export function ArtifactsTab({ useCaseId }: ArtifactsTabProps) {
  const { t } = useLocale();
  const [artifacts, setArtifacts] = useState<KnowledgeArtifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState<ArtifactDraft | null>(null);
  const statusLabel = (s: KnowledgeArtifact["status"]) =>
    s === "draft" ? t.knowledge.statusDraft : s === "published" ? t.knowledge.statusPublished : t.knowledge.statusDeprecated;

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      setArtifacts(await listArtifacts(useCaseId));
    } finally {
      setLoading(false);
    }
  }, [useCaseId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSubmit(values: ArtifactSubmit) {
    if (draft?.mode === "replace" && draft.artifact) {
      await replaceArtifactFile(draft.artifact.id, buildForm(values));
    } else if (draft?.mode === "edit" && draft.artifact) {
      await updateArtifact(draft.artifact.id, {
        title: values.title, type: values.type, status: values.status,
        owner: values.owner, versionLabel: values.versionLabel,
        url: values.kind === "link" ? values.url : undefined, changeNote: values.changeNote,
      });
    } else if (values.kind === "link") {
      await createLinkArtifact(useCaseId, {
        title: values.title, type: values.type, status: values.status,
        owner: values.owner, versionLabel: values.versionLabel, url: values.url!, changeNote: values.changeNote,
      });
    } else {
      await createFileArtifact(useCaseId, buildForm(values));
    }
    setDraft(null);
    await refresh();
  }

  async function handleDelete(a: KnowledgeArtifact) {
    if (!window.confirm(t.knowledge.deleteConfirm)) return;
    await deleteArtifact(a.id);
    await refresh();
  }

  const published = artifacts.filter((a) => a.status === "published").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-slate-500">
          {artifacts.length} {t.knowledge.artifacts.toLowerCase()} · {published} {t.knowledge.statusPublished.toLowerCase()}
        </p>
        {!draft && <Button onClick={() => setDraft({ mode: "create" })}>+ {t.knowledge.addArtifact}</Button>}
      </div>

      {draft && <ArtifactForm draft={draft} onSubmit={handleSubmit} onCancel={() => setDraft(null)} />}

      {loading ? (
        <p className="text-sm text-slate-400">…</p>
      ) : artifacts.length === 0 && !draft ? (
        <p className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-sm text-slate-400 dark:border-slate-700">
          {t.knowledge.noArtifacts}
        </p>
      ) : (
        <div className="space-y-2">
          {artifacts.map((a) => (
            <ArtifactRow
              key={a.id}
              artifact={a}
              statusLabel={statusLabel}
              onEdit={(x) => setDraft({ mode: "edit", artifact: x })}
              onReplace={(x) => setDraft({ mode: "replace", artifact: x })}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Run the test + typecheck**

Run: `npm test -- src/app/knowledge/_components/editor/artifacts-tab.test.tsx`
Expected: PASS (2 tests).
Run: `npx tsc --noEmit`
Expected: no errors (Task 11 + 12 together make the editor typecheck).

- [ ] **Step 7: Commit**

```bash
git add src/app/knowledge/_components/editor/artifact-row.tsx src/app/knowledge/_components/editor/artifact-form.tsx src/app/knowledge/_components/editor/artifacts-tab.tsx src/app/knowledge/_components/editor/artifacts-tab.test.tsx
git commit -m "feat(knowledge): Artifacts tab UI (list, add/edit/replace, changelog)"
```

---

## Task 13: Page shell — "Has artifacts" filter

**Files:**
- Modify: `src/app/knowledge/_components/filtering.ts`
- Test: `src/app/knowledge/_components/filtering.test.ts`

- [ ] **Step 1: Read the current filtering module**

Run: `sed -n '1,80p' src/app/knowledge/_components/filtering.ts` (understand `Filters`, `EMPTY_FILTERS`, `applyFilters`).

- [ ] **Step 2: Write the failing test**

Create `src/app/knowledge/_components/filtering.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { applyFilters, EMPTY_FILTERS } from "./filtering";
import type { KnowledgeUseCase } from "@/content/knowledge";

const base = (id: string): KnowledgeUseCase => ({
  id, workflowId: "w", sectorId: "s", industryId: "i", companyId: "c", functionId: "f",
  name: id, domain: "", description: "", kpis: [], techTag: "GenAI", maturity: "pilot",
  businessObjectives: [], archetypes: [], references: [], validation: { status: "notYet", note: "" },
});

describe("hasArtifacts filter", () => {
  it("keeps only use cases whose id is in the artifact set when enabled", () => {
    const cases = [base("uc-1"), base("uc-2")];
    const out = applyFilters(cases, { ...EMPTY_FILTERS, hasArtifacts: true }, new Set(["uc-1"]));
    expect(out.map((c) => c.id)).toEqual(["uc-1"]);
  });

  it("ignores the artifact set when the filter is off", () => {
    const cases = [base("uc-1"), base("uc-2")];
    const out = applyFilters(cases, EMPTY_FILTERS, new Set(["uc-1"]));
    expect(out).toHaveLength(2);
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- src/app/knowledge/_components/filtering.test.ts`
Expected: FAIL — `hasArtifacts` not on `Filters`, and `applyFilters` takes 2 args.

- [ ] **Step 4: Extend `filtering.ts`**

1. Add `hasArtifacts: boolean` to the `Filters` interface.
2. Add `hasArtifacts: false` to `EMPTY_FILTERS`.
3. Change `applyFilters` signature to accept an optional artifact-id set and apply it:
```ts
export function applyFilters(
  useCases: KnowledgeUseCase[],
  filters: Filters,
  useCaseIdsWithArtifacts?: ReadonlySet<string>,
): KnowledgeUseCase[] {
  return useCases.filter((uc) => {
    // ... keep all existing predicate checks unchanged ...
    if (filters.hasArtifacts && !(useCaseIdsWithArtifacts?.has(uc.id) ?? false)) return false;
    return true; // (fold into the existing final return)
  });
}
```
> Keep every existing predicate; only add the `hasArtifacts` guard and the new optional parameter.

- [ ] **Step 5: Run test to verify it passes**

Run: `npm test -- src/app/knowledge/_components/filtering.test.ts`
Expected: PASS (2 tests).

- [ ] **Step 6: Commit**

```bash
git add src/app/knowledge/_components/filtering.ts src/app/knowledge/_components/filtering.test.ts
git commit -m "feat(knowledge): hasArtifacts filter predicate"
```

---

## Task 14: Page shell — artifact counts, stats, badges, sidebar

**Files:**
- Modify: `src/app/knowledge/knowledge-client.tsx`, `src/app/knowledge/_components/library-sidebar.tsx`, `src/app/knowledge/_components/use-case-list.tsx`
- Test: covered by manual run + existing component tests; add `knowledge-client-stats.test.tsx` for the count map helper.

- [ ] **Step 1: Add an artifact-count map to the page**

In `knowledge-client.tsx`, add state + a load effect that fetches the per-use-case artifact counts for the current company. Add helper near the top:
```ts
import { listArtifacts as apiListArtifacts } from "@/lib/api-client";
```
Add state:
```ts
const [artifactCounts, setArtifactCounts] = useState<Record<string, number>>({});
```
Add an effect that, when `companyUseCases` changes, fetches counts in parallel (bounded — these are local API calls):
```ts
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
```
> Note: `useEffect` must be imported from `react` (currently only `useMemo`, `useState` are). Add it.

- [ ] **Step 2: Derive the artifact-id set and pass to `applyFilters`**

```ts
const idsWithArtifacts = useMemo(
  () => new Set(Object.entries(artifactCounts).filter(([, n]) => n > 0).map(([id]) => id)),
  [artifactCounts],
);
const filtered = useMemo(
  () => applyFilters(companyUseCases, filters, idsWithArtifacts),
  [companyUseCases, filters, idsWithArtifacts],
);
```

- [ ] **Step 3: Rebalance the stat cards**

Replace the 6-card stats grid block with 4 asset-aware cards + a compact maturity line. Update the `stats` memo to also compute `artifacts` (sum of `artifactCounts`) and `publishedAssets` is approximated by total artifacts for v1 (published count requires fetching full artifacts; keep it as total artifacts labelled "Artifacts"). Render:
```tsx
<div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
  <StatCard label={t.knowledge.useCases} value={stats.total} accent="bg-indigo-500" />
  <StatCard label={t.knowledge.validated} value={stats.validated} accent="bg-emerald-500" />
  <StatCard label={t.knowledge.artifacts} value={artifactTotal} accent="bg-sky-500" />
  <StatCard label={t.knowledge.workflows} value={stats.workflows} accent="bg-violet-500" />
</div>
<p className="text-xs text-slate-400">
  {t.knowledge.maturityProven}: {stats.proven} · {t.knowledge.maturityEmerging}: {stats.emerging} · {t.knowledge.maturityPilot}: {stats.pilot}
</p>
```
where `const artifactTotal = Object.values(artifactCounts).reduce((a, b) => a + b, 0);`

- [ ] **Step 4: Add the "Has artifacts" filter control to `library-sidebar.tsx`**

In the filters card, add a checkbox bound to `filters.hasArtifacts`:
```tsx
<label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
  <input
    type="checkbox"
    checked={filters.hasArtifacts}
    onChange={(e) => patch({ hasArtifacts: e.target.checked })}
  />
  {t.knowledge.hasArtifacts}
</label>
```
Also include `filters.hasArtifacts` in the `hasFilters` boolean so "Clear filters" appears.

- [ ] **Step 5: Add the artifact-count badge to list rows**

Pass `artifactCounts` from `knowledge-client.tsx` into `UseCaseList` and render a small badge where a use case appears (grouped list item and table row). In `use-case-list.tsx`, accept `counts?: Record<string, number>` and render, next to a use-case name:
```tsx
{counts?.[uc.id] ? (
  <span className="ml-1 rounded-full bg-sky-100 px-1.5 text-[10px] font-semibold text-sky-700 dark:bg-sky-900/40 dark:text-sky-300">
    ◆ {counts[uc.id]}
  </span>
) : null}
```
Thread the `counts` prop through `UseCaseList` → `GroupedView`/`UseCaseTable`.

- [ ] **Step 6: Typecheck + run all tests**

Run: `npx tsc --noEmit`
Expected: no errors.
Run: `npm test`
Expected: all suites PASS.

- [ ] **Step 7: Commit**

```bash
git add src/app/knowledge/knowledge-client.tsx src/app/knowledge/_components/library-sidebar.tsx src/app/knowledge/_components/use-case-list.tsx
git commit -m "feat(knowledge): asset-aware stats, has-artifacts filter, count badges"
```

---

## Task 15: Manual verification + E2E flow

**Files:**
- Optional: `e2e/knowledge-artifacts.spec.ts` (via the available Playwright MCP)

- [ ] **Step 1: Run the app**

Run: `npm run dev`
Open `/knowledge`, select a Sector/Industry/Company with use cases, open a use case.

- [ ] **Step 2: Exercise the Artifacts tab manually**

- Add a **link** artifact → appears with status badge.
- Add a **file** artifact (PDF) → appears; click Download → file streams.
- **Replace** the file with a new one + change note → change log grows by one; old file no longer downloadable (current bytes only).
- **Edit** status Draft → Published → row badge updates; change log grows.
- **Delete** an artifact → row removed; count badge on the list decrements.
- Toggle **"Has artifacts"** filter → only use cases with artifacts remain.

- [ ] **Step 3: Verify the rebalanced editor**

Confirm five tabs: Overview / Impact / Agentic / Artifacts / Evidence. Confirm Evidence shows validation status+note AND references, each saving independently.

- [ ] **Step 4: Coverage check**

Run: `npm run test:cov`
Expected: artifact logic modules (storage, repo, validation, routes, api-client, filtering) ≥ 80% line coverage. If below, add cases for: oversize upload reject, bad-MIME reject, 404 download for a link artifact, updateArtifact on missing id.

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "test(knowledge): coverage top-up + e2e flow for artifacts"
```

---

## Self-Review Notes (for the implementer)

- **Validation persistence unchanged:** the Evidence tab is a UI merge only; validation still writes through `setUseCaseValidation` → its existing endpoint; references still write through the use-case PATCH.
- **`locale-context` provider (confirmed):** `LocaleProvider({ children })` and `useLocale()` are exported from `@/lib/locale-context`; the test wrapper is correct as written.
- **`Button`/`common` i18n (confirmed):** `t.common.edit`/`cancel`/`save`/`saved`/`close`/`delete` all exist (en + zh); `Button` extends `ButtonHTMLAttributes` and spreads `...rest`, so `type="submit"` works.
- **`filtering.ts` shape (confirmed):** `Filters`, `EMPTY_FILTERS`, and `applyFilters(useCases, filters)` match Task 13's assumptions; only the new `hasArtifacts` field + optional set parameter are added.
- **No historical bytes:** "current + changelog" — Replace overwrites; only changelog text records prior versions. This is intentional per the spec.

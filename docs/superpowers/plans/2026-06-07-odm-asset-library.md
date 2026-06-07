# ODM Asset Library Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an ODM (electronics contract manufacturing) use-case library — taxonomy + 10 sanitized use cases under the TMT sector, plus each source markdown attached as a downloadable artifact.

**Architecture:** Mirror the Energy & Utilities branch pattern (commit `9f836a1`): a self-contained `knowledge-odm-seed.ts` branch composed into `knowledge-seed.ts`, an integrity test, and an idempotent injector script that backfills an existing DB and attaches sanitized markdown artifacts. The ODM branch reuses the existing `tmt` sector (does not re-declare it).

**Tech Stack:** TypeScript, Next.js, better-sqlite3, drizzle, vitest, tsx.

**Spec:** `docs/superpowers/specs/2026-06-07-odm-asset-library-design.md`

**Working directory:** all paths are relative to `app/`. Run all commands from `/Users/Hayden_Zheng/CodeRepo/00_Playbook/app`.

---

## File Structure

- **Create** `src/content/knowledge-odm-seed.ts` — `odmBranch: KnowledgeBranch` (industry `tmt-odm`, company `apex-odm`, 5 functions, 5 workflows, 10 use-case seeds). Sole responsibility: ODM content.
- **Modify** `src/content/knowledge-seed.ts` — import `odmBranch`, concat into the `*All` arrays and `useCaseSeeds`.
- **Create** `src/content/knowledge-odm-seed.test.ts` — integrity tests for the branch.
- **Create** `scripts/seed-odm-knowledge.ts` — idempotent injector (taxonomy + use cases + artifacts) for an existing DB.

**Reference files (read before authoring):**
- `src/content/knowledge-utility-seed.ts` (branch pattern)
- `src/content/knowledge.ts` (types: `KnowledgeBranch`, `UseCaseSeed`, unions, `DEFAULT_VALIDATION`)
- `src/content/archetypes.ts` (`"orchestrator"|"executor"|"analyst"|"retriever"|"evaluator"`)
- `src/content/interactions.ts` (`"autopilot"|"copilot"|"guardian"`)
- `src/content/a2a-patterns.ts` (`"sequential"|"pipeline"|"parallel"|"hierarchical"|"negotiation"|"broadcast"`)
- `scripts/seed-utility-knowledge.ts` (injector pattern)
- `src/lib/artifact-storage.ts` (`writeArtifactFile`)
- `src/db/schema.ts` (`knowledge_taxonomy`, `knowledge_use_cases`, `knowledge_artifacts` columns)
- `data/odm/use-cases/01..10-*.md` (source content)

**Field-mapping rules (apply to every use case):**
- `techTag`: GenAI files (#3,6,8,10) → `"GenAI"`; agentic planning/scheduling/yield/PO (#1,2,7,9) → `"Optimization"`; agentic risk/NPI (#4,5) → `"AI/ML"`.
- `maturity`: H1 → `"emerging"`; H2 (NPI #4) → `"pilot"`.
- `description`: 2–4 sentence sanitized summary from "Key Features" / "ODM-Specific Value Drivers".
- `kpis`: 2–4 quantified metrics from the file's impact table.
- `businessObjectives`: 2–3 short phrases (e.g. `"Working Capital"`, `"Cost Reduction"`, `"Time-to-Market"`, `"Quality"`, `"Productivity"`, `"Service Level"`).
- `archetypes` / `interactionMode` / `a2aPattern`: from the file's "High-Level Design" / multi-agent section.
- `references`: named vendors + case studies as `{ name, detail }` (3–5 each).
- `validation`: `DEFAULT_VALIDATION`.
- **Sanitization:** never write "Compal"; use "Apex Electronics (ODM)" / "Apex Electronics".

---

## Task 1: Create the ODM branch skeleton (taxonomy, empty use cases)

**Files:**
- Create: `src/content/knowledge-odm-seed.ts`

- [ ] **Step 1: Write the branch skeleton with taxonomy and an empty `useCaseSeeds`**

```typescript
import { DEFAULT_VALIDATION } from "./knowledge";
import type {
  Company,
  Industry,
  KnowledgeBranch,
  LibraryFunction,
  LibraryWorkflow,
  Sector,
  UseCaseSeed,
} from "./knowledge";

/**
 * ODM (electronics contract manufacturing) branch of the Agentic Use Case
 * Library. Ported from `app/data/odm/use-cases/*.md` — 10 prioritized agentic /
 * GenAI use cases for a Tier-1 ODM. Source is Compal-specific; this branch is
 * sanitized to a reference company, "Apex Electronics (ODM)".
 *
 * Reuses the existing TMT sector (no sector row declared here).
 * Browse tree (5 functions → 5 workflows → 10 use cases):
 *   Procurement & Supply Chain → Procurement & Supply Chain Orchestration
 *   Manufacturing Operations   → Production & Process Operations
 *   R&D / Engineering          → Engineering & NPI
 *   Sales & Commercial         → Customer Program & RFQ Management
 *   Quality Assurance & Service→ Quality & Service Resolution
 */

// ─── Sector / Industry / Company ──────────────────────────────
// TMT sector already exists in the base seed; do not re-declare it.
const sectors: Sector[] = [];

const industries: Industry[] = [
  { id: "tmt-odm", sectorId: "tmt", name: { en: "ODM / Electronics Manufacturing", zh: "ODM / 电子制造" }, sort: 1 },
];

const companies: Company[] = [
  { id: "apex-odm", industryId: "tmt-odm", name: "Apex Electronics (ODM)", sort: 0 },
];

// ─── Functions ────────────────────────────────────────────────
const functions: LibraryFunction[] = [
  { id: "odm-fn-proc", companyId: "apex-odm", name: { en: "Procurement & Supply Chain", zh: "采购与供应链" }, color: "#1565c0", sort: 0 },
  { id: "odm-fn-mfg", companyId: "apex-odm", name: { en: "Manufacturing Operations", zh: "制造运营" }, color: "#b45309", sort: 1 },
  { id: "odm-fn-rnd", companyId: "apex-odm", name: { en: "R&D / Engineering", zh: "研发 / 工程" }, color: "#7c3aed", sort: 2 },
  { id: "odm-fn-sales", companyId: "apex-odm", name: { en: "Sales & Commercial", zh: "销售与商务" }, color: "#0d9488", sort: 3 },
  { id: "odm-fn-qa", companyId: "apex-odm", name: { en: "Quality Assurance & Service", zh: "质量保证与服务" }, color: "#be123c", sort: 4 },
];

// ─── Workflows (one per function) ─────────────────────────────
const workflows: LibraryWorkflow[] = [
  { id: "odm-wf-proc", functionId: "odm-fn-proc", name: "Procurement & Supply Chain Orchestration", description: "Agentic material planning, supplier risk, and PO execution across multi-customer ODM programs.", color: "#1565c0", squadHint: "Supply chain + data science", sort: 0 },
  { id: "odm-wf-mfg", functionId: "odm-fn-mfg", name: "Production & Process Operations", description: "Agentic production scheduling and yield optimization across shared lines and OEM programs.", color: "#b45309", squadHint: "Manufacturing engineering + MES", sort: 1 },
  { id: "odm-wf-rnd", functionId: "odm-fn-rnd", name: "Engineering & NPI", description: "GenAI engineering-change analysis, NPI phase-gate orchestration, and an engineering knowledge copilot.", color: "#7c3aed", squadHint: "R&D + PLM", sort: 2 },
  { id: "odm-wf-sales", functionId: "odm-fn-sales", name: "Customer Program & RFQ Management", description: "GenAI RFQ response and should-cost analysis for customer design wins.", color: "#0d9488", squadHint: "Sales engineering + cost", sort: 3 },
  { id: "odm-wf-qa", functionId: "odm-fn-qa", name: "Quality & Service Resolution", description: "GenAI defect analysis and 8D automation across inline inspection and customer quality.", color: "#be123c", squadHint: "Quality + service", sort: 4 },
];

// ─── Use cases ────────────────────────────────────────────────
const useCaseSeeds: UseCaseSeed[] = [];

export const odmBranch: KnowledgeBranch = {
  sectors,
  industries,
  companies,
  functions,
  workflows,
  useCaseSeeds,
};
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/knowledge-odm-seed.ts
git commit -m "feat(knowledge): ODM branch skeleton (taxonomy, no use cases yet)"
```

---

## Task 2: Author the 10 ODM use-case seeds

**Files:**
- Modify: `src/content/knowledge-odm-seed.ts` (replace the empty `useCaseSeeds` array)

For each use case, read its source file under `data/odm/use-cases/` and author a `UseCaseSeed` using the field-mapping rules at the top of this plan. Use case → workflow mapping:

| id | file | workflowId |
|---|---|---|
| odm-uc-01 | 01-agentic-material-planning-demand-supply.md | odm-wf-proc |
| odm-uc-05 | 05-agentic-supplier-risk-performance.md | odm-wf-proc |
| odm-uc-09 | 09-agentic-purchase-order-shortage-prediction.md | odm-wf-proc |
| odm-uc-02 | 02-agentic-production-scheduling-control.md | odm-wf-mfg |
| odm-uc-07 | 07-agentic-yield-optimization-process-engineering.md | odm-wf-mfg |
| odm-uc-03 | 03-genai-engineering-change-impact-analysis.md | odm-wf-rnd |
| odm-uc-04 | 04-agentic-npi-phase-gate-orchestration.md | odm-wf-rnd |
| odm-uc-10 | 10-genai-engineering-knowledge-copilot.md | odm-wf-rnd |
| odm-uc-06 | 06-genai-rfq-response-should-cost.md | odm-wf-sales |
| odm-uc-08 | 08-genai-quality-defect-analysis-8d.md | odm-wf-qa |

- [ ] **Step 1: Author all 10 seeds.** Worked example for `odm-uc-01` (the exact pattern for the rest):

```typescript
const useCaseSeeds: UseCaseSeed[] = [
  {
    id: "odm-uc-01",
    workflowId: "odm-wf-proc",
    name: "Agentic Material Planning & Demand-Supply Orchestration",
    domain: "Procurement & Supply Chain",
    description:
      "A closed-loop multi-agent system that senses, reasons, decides, executes and learns across OEM forecasts, internal plans and component supply — auto-resolving the 200–500 daily MRP exceptions per planner within guardrails. It detects emerging shortages 5–15 days out, optimizes multi-customer allocation of constrained components, and wraps existing ERP/APS (SAP, Kinaxis, o9) via APIs rather than replacing them. For a Tier-1 ODM running daily call-off cycles, 1–2% inventory optimization alone can release $50–100M in working capital.",
    kpis: [
      "Inventory carrying-cost reduction: 15–35%",
      "Manual planning effort: 40–90% reduction",
      "Exception resolution time: 80–90% faster",
      "Working capital release: up to ~$200M per $10B revenue",
    ],
    techTag: "Optimization",
    maturity: "emerging",
    businessObjectives: ["Working Capital", "Productivity", "Service Level"],
    archetypes: ["orchestrator", "retriever", "analyst", "executor"],
    interactionMode: "copilot",
    a2aPattern: "hierarchical",
    references: [
      { name: "Aera Technology", detail: "Digital Material Planner across high-tech manufacturers: 40–90% less manual planning effort; up to $200M working-capital release per $10B revenue." },
      { name: "Oracle Autonomous Supply Chain", detail: "Agentic inventory/supplier coordination: 60–80% reduction in manual procurement effort; auto-replenishment on predicted shortage." },
      { name: "ProvisionAI LevelLoad", detail: "Autonomous capacity-constrained deployment planning: 97% first-tender acceptance; 60% lower shipment volatility." },
      { name: "McKinsey Global Institute", detail: "AI-enabled supply chains: 35% inventory reduction for early adopters; 15–25% total cost savings." },
    ],
    validation: DEFAULT_VALIDATION,
  },
  // ... odm-uc-05, odm-uc-09, odm-uc-02, odm-uc-07, odm-uc-03, odm-uc-04,
  //     odm-uc-10, odm-uc-06, odm-uc-08 — each authored the same way from its
  //     source file, following the field-mapping rules. Order the array by id.
];
```

  Authoring notes per use case (techTag / maturity / suggested design tags):
  - **odm-uc-05** Supplier Risk: `AI/ML`, `emerging`; archetypes `["analyst","evaluator","retriever","executor"]`, `copilot`, `hierarchical`.
  - **odm-uc-09** PO Execution & Shortage: `Optimization`, `emerging`; `["orchestrator","analyst","executor"]`, `copilot`, `hierarchical`.
  - **odm-uc-02** Production Scheduling: `Optimization`, `emerging`; `["orchestrator","analyst","executor","evaluator"]`, `copilot`, `hierarchical`.
  - **odm-uc-07** Yield Optimization: `Optimization`, `emerging`; `["analyst","evaluator","executor"]`, `copilot`, `pipeline`.
  - **odm-uc-03** ECN Impact Analysis: `GenAI`, `emerging`; `["retriever","analyst","evaluator"]`, `copilot`, `pipeline`.
  - **odm-uc-04** NPI Phase-Gate: `AI/ML`, `pilot`; `["orchestrator","analyst","evaluator","executor"]`, `copilot`, `hierarchical`.
  - **odm-uc-10** Engineering Copilot: `GenAI`, `emerging`; `["retriever","analyst"]`, `copilot`, `sequential`.
  - **odm-uc-06** RFQ / Should-Cost: `GenAI`, `emerging`; `["retriever","analyst","evaluator"]`, `copilot`, `pipeline`.
  - **odm-uc-08** Quality 8D: `GenAI`, `emerging`; `["retriever","analyst","evaluator","executor"]`, `copilot`, `pipeline`.

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add src/content/knowledge-odm-seed.ts
git commit -m "feat(knowledge): author 10 ODM use-case seeds"
```

---

## Task 3: Compose the ODM branch into the base seed

**Files:**
- Modify: `src/content/knowledge-seed.ts`

- [ ] **Step 1: Import `odmBranch` near the existing `utilityBranch` import**

Find the line importing the utility branch (e.g. `const utilityBranch = require("./knowledge-utility-seed").utilityBranch;` or an `import { utilityBranch }`). Add, in the same style:

```typescript
import { odmBranch } from "./knowledge-odm-seed";
```
(If the file uses `require` for the utility branch, match that style: `const odmBranch = require("./knowledge-odm-seed").odmBranch;`.)

- [ ] **Step 2: Concat the branch into each `*All` array**

Change the branch-composition block to include `odmBranch`:

```typescript
const sectorsAll: Sector[] = [...sectors, ...utilityBranch.sectors, ...odmBranch.sectors];
const industriesAll: Industry[] = [...industries, ...utilityBranch.industries, ...odmBranch.industries];
const companiesAll: Company[] = [...companies, ...utilityBranch.companies, ...odmBranch.companies];
const functionsAll: LibraryFunction[] = [...functions, ...utilityBranch.functions, ...odmBranch.functions];
const workflowsAll: LibraryWorkflow[] = [...workflows, ...utilityBranch.workflows, ...odmBranch.workflows];
```

- [ ] **Step 3: Append the ODM use-case seeds before the `withParents` map**

Find where `useCaseSeeds` is mapped through `withParents` (e.g. `[...useCaseSeeds, ...utilityBranch.useCaseSeeds].map(withParents)`). Add `...odmBranch.useCaseSeeds`:

```typescript
const useCases: KnowledgeUseCase[] = [
  ...useCaseSeeds,
  ...utilityBranch.useCaseSeeds,
  ...odmBranch.useCaseSeeds,
].map(withParents);
```
(Match the exact existing expression; the only change is adding the `...odmBranch.useCaseSeeds` spread.)

- [ ] **Step 4: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/content/knowledge-seed.ts
git commit -m "feat(knowledge): compose ODM branch into the knowledge seed"
```

---

## Task 4: Branch integrity test

**Files:**
- Create: `src/content/knowledge-odm-seed.test.ts`

- [ ] **Step 1: Write the test**

```typescript
import { describe, it, expect } from "vitest";
import { odmBranch } from "./knowledge-odm-seed";
import { ARCHETYPE_IDS } from "./archetypes";
import { INTERACTION_IDS } from "./interactions";
import { A2A_PATTERN_IDS } from "./a2a-patterns";

const TECH_TAGS = ["AI/ML", "GenAI", "Analytics", "Optimization"];
const MATURITIES = ["proven", "emerging", "pilot"];

describe("ODM knowledge branch", () => {
  it("declares the tmt-odm industry under the existing TMT sector and no new sector", () => {
    expect(odmBranch.sectors).toEqual([]);
    expect(odmBranch.industries).toHaveLength(1);
    expect(odmBranch.industries[0]).toMatchObject({ id: "tmt-odm", sectorId: "tmt" });
    expect(odmBranch.companies).toEqual([
      expect.objectContaining({ id: "apex-odm", industryId: "tmt-odm" }),
    ]);
  });

  it("has 5 functions and 5 workflows all parented to apex-odm", () => {
    expect(odmBranch.functions).toHaveLength(5);
    expect(odmBranch.workflows).toHaveLength(5);
    const fnIds = new Set(odmBranch.functions.map((f) => f.id));
    for (const f of odmBranch.functions) expect(f.companyId).toBe("apex-odm");
    for (const w of odmBranch.workflows) expect(fnIds.has(w.functionId)).toBe(true);
  });

  it("has exactly 10 use cases with unique odm-uc-NN ids", () => {
    const ids = odmBranch.useCaseSeeds.map((u) => u.id);
    expect(ids).toHaveLength(10);
    expect(new Set(ids).size).toBe(10);
    for (const id of ids) expect(id).toMatch(/^odm-uc-\d{2}$/);
  });

  it("every use case points at a real ODM workflow and uses valid enum values", () => {
    const wfIds = new Set(odmBranch.workflows.map((w) => w.id));
    for (const uc of odmBranch.useCaseSeeds) {
      expect(wfIds.has(uc.workflowId)).toBe(true);
      expect(TECH_TAGS).toContain(uc.techTag);
      expect(MATURITIES).toContain(uc.maturity);
      for (const a of uc.archetypes) expect(ARCHETYPE_IDS).toContain(a);
      if (uc.interactionMode) expect(INTERACTION_IDS).toContain(uc.interactionMode);
      if (uc.a2aPattern) expect(A2A_PATTERN_IDS).toContain(uc.a2aPattern);
      expect(uc.kpis.length).toBeGreaterThan(0);
      expect(uc.references.length).toBeGreaterThan(0);
    }
  });

  it("is fully sanitized (no Compal references)", () => {
    const blob = JSON.stringify(odmBranch);
    expect(blob.toLowerCase()).not.toContain("compal");
  });
});
```

- [ ] **Step 2: Confirm the exported id constants exist**

Run: `grep -n "ARCHETYPE_IDS\|INTERACTION_IDS\|A2A_PATTERN_IDS" src/content/archetypes.ts src/content/interactions.ts src/content/a2a-patterns.ts`
Expected: each constant is exported. If a file exports the list under a different name (e.g. `archetypes` array of objects), adjust the test import to map to ids: e.g. `const ARCHETYPE_IDS = archetypes.map(a => a.id)`.

- [ ] **Step 3: Run the test**

Run: `npx vitest run src/content/knowledge-odm-seed.test.ts`
Expected: PASS (5 tests).

- [ ] **Step 4: Commit**

```bash
git add src/content/knowledge-odm-seed.test.ts
git commit -m "test(knowledge): ODM branch integrity tests"
```

---

## Task 5: Injector script (taxonomy + use cases + sanitized artifacts)

**Files:**
- Create: `scripts/seed-odm-knowledge.ts`

- [ ] **Step 1: Write the injector**

Key differences vs `seed-utility-knowledge.ts`: filter by **industry `tmt-odm`** (not sector, since ODM shares `tmt`), and additionally attach sanitized markdown artifacts.

```typescript
/**
 * Inject the ODM branch of the Knowledge library into an existing database, and
 * attach each source deep-dive markdown as a sanitized, downloadable artifact.
 *
 * `ensureKnowledgeSeeded()` only seeds a fresh DB, so an existing DB never picks
 * up a newly-added branch. This back-fills idempotently (INSERT OR IGNORE) and
 * is safe to re-run. ODM shares the existing `tmt` sector, so taxonomy/use-cases
 * are scoped by the `tmt-odm` industry — never by sector.
 *
 * Run with: `npx tsx scripts/seed-odm-knowledge.ts`
 */
import path from "node:path";
import fs from "node:fs";
import Database from "better-sqlite3";
import { knowledgeSeed } from "../src/content/knowledge-seed";
import { writeArtifactFile } from "../src/lib/artifact-storage";
import type {
  Company,
  Industry,
  KnowledgeUseCase,
  LibraryFunction,
  LibraryWorkflow,
} from "../src/content/knowledge";

const INDUSTRY_ID = "tmt-odm";
const DB_PATH = process.env.PLAYBOOK_DB_PATH ?? path.resolve(process.cwd(), "data/playbook.db");
const SRC_DIR = path.resolve(process.cwd(), "data/odm/use-cases");
const SANITIZE = (s: string): string =>
  s.replace(/Compal Electronics/g, "Apex Electronics (ODM)").replace(/Compal/g, "Apex Electronics");

// Maps each ODM use-case id to its source markdown basename.
const SOURCE_FILES: Record<string, string> = {
  "odm-uc-01": "01-agentic-material-planning-demand-supply.md",
  "odm-uc-02": "02-agentic-production-scheduling-control.md",
  "odm-uc-03": "03-genai-engineering-change-impact-analysis.md",
  "odm-uc-04": "04-agentic-npi-phase-gate-orchestration.md",
  "odm-uc-05": "05-agentic-supplier-risk-performance.md",
  "odm-uc-06": "06-genai-rfq-response-should-cost.md",
  "odm-uc-07": "07-agentic-yield-optimization-process-engineering.md",
  "odm-uc-08": "08-genai-quality-defect-analysis-8d.md",
  "odm-uc-09": "09-agentic-purchase-order-shortage-prediction.md",
  "odm-uc-10": "10-genai-engineering-knowledge-copilot.md",
};

type TaxonomyType = "sector" | "industry" | "company" | "function" | "workflow";
interface TaxonomyInsert { id: string; type: TaxonomyType; parentId: string | null; sort: number; data: unknown; }

function buildTaxonomyRows(): TaxonomyInsert[] {
  const { industries, companies, functions, workflows } = knowledgeSeed;
  const industry = industries.filter((i: Industry) => i.id === INDUSTRY_ID);
  const company = companies.filter((c: Company) => c.industryId === INDUSTRY_ID);
  const companyIds = new Set(company.map((c) => c.id));
  const fns = functions.filter((f: LibraryFunction) => companyIds.has(f.companyId));
  const fnIds = new Set(fns.map((f) => f.id));
  const flows = workflows.filter((w: LibraryWorkflow) => fnIds.has(w.functionId));
  return [
    ...industry.map((i): TaxonomyInsert => ({ id: i.id, type: "industry", parentId: i.sectorId, sort: i.sort, data: i })),
    ...company.map((c): TaxonomyInsert => ({ id: c.id, type: "company", parentId: c.industryId, sort: c.sort, data: c })),
    ...fns.map((f): TaxonomyInsert => ({ id: f.id, type: "function", parentId: f.companyId, sort: f.sort, data: f })),
    ...flows.map((w): TaxonomyInsert => ({ id: w.id, type: "workflow", parentId: w.functionId, sort: w.sort, data: w })),
  ];
}

async function buildArtifact(uc: KnowledgeUseCase, ts: number) {
  const fileName = SOURCE_FILES[uc.id];
  if (!fileName) return null;
  const srcPath = path.join(SRC_DIR, fileName);
  if (!fs.existsSync(srcPath)) return null;
  const bytes = Buffer.from(SANITIZE(fs.readFileSync(srcPath, "utf8")), "utf8");
  const artifactId = `odm-art-${uc.id.slice(-2)}`;
  const storagePath = await writeArtifactFile(uc.id, artifactId, fileName, bytes);
  const artifact = {
    id: artifactId,
    useCaseId: uc.id,
    title: `${uc.name} — Deep Dive`,
    kind: "file" as const,
    type: "playbook",
    status: "published" as const,
    owner: "ODM Reference Library",
    file: { fileName, mimeType: "text/markdown", sizeBytes: bytes.length, storagePath },
    createdAt: ts,
    updatedAt: ts,
    changelog: [{ at: ts, author: "ODM Reference Library", note: "Imported from ODM deep-dive library" }],
  };
  return artifact;
}

async function main(): Promise<void> {
  const db = new Database(DB_PATH);
  db.pragma("journal_mode = WAL");

  const taxonomyRows = buildTaxonomyRows();
  const useCases = knowledgeSeed.useCases.filter((uc: KnowledgeUseCase) => uc.industryId === INDUSTRY_ID);
  if (taxonomyRows.length === 0 || useCases.length === 0) {
    throw new Error(`No '${INDUSTRY_ID}' branch found in knowledgeSeed — nothing to seed.`);
  }

  const insertTaxonomy = db.prepare(
    `INSERT OR IGNORE INTO knowledge_taxonomy (id, type, parent_id, sort, data)
     VALUES (@id, @type, @parentId, @sort, @data)`,
  );
  const insertUseCase = db.prepare(
    `INSERT OR IGNORE INTO knowledge_use_cases
       (id, workflow_id, sector_id, industry_id, company_id, function_id,
        maturity, tech_tag, name, validation_status, data)
     VALUES (@id, @workflowId, @sectorId, @industryId, @companyId, @functionId,
        @maturity, @techTag, @name, @validationStatus, @data)`,
  );
  const insertArtifact = db.prepare(
    `INSERT OR IGNORE INTO knowledge_artifacts (id, use_case_id, kind, type, status, updated_at, data)
     VALUES (@id, @useCaseId, @kind, @type, @status, @updatedAt, @data)`,
  );

  // Build artifacts (async file writes) before the sync transaction.
  const ts = Date.now();
  const artifacts = (await Promise.all(useCases.map((uc) => buildArtifact(uc, ts)))).filter(Boolean) as Array<ReturnType<typeof Object> & { id: string; useCaseId: string; kind: "file"; type: string; status: string; updatedAt: number }>;

  const run = db.transaction(() => {
    let tax = 0;
    for (const row of taxonomyRows) tax += insertTaxonomy.run({ ...row, data: JSON.stringify(row.data) }).changes;
    let uc = 0;
    for (const u of useCases) {
      uc += insertUseCase.run({
        id: u.id, workflowId: u.workflowId, sectorId: u.sectorId, industryId: u.industryId,
        companyId: u.companyId, functionId: u.functionId, maturity: u.maturity, techTag: u.techTag,
        name: u.name, validationStatus: u.validation.status, data: JSON.stringify(u),
      }).changes;
    }
    let art = 0;
    for (const a of artifacts) {
      art += insertArtifact.run({
        id: a.id, useCaseId: a.useCaseId, kind: a.kind, type: a.type, status: a.status,
        updatedAt: a.updatedAt, data: JSON.stringify(a),
      }).changes;
    }
    return { tax, uc, art };
  });

  const { tax, uc, art } = run();
  db.close();
  console.log(
    `ODM knowledge branch seeded into ${DB_PATH}\n` +
      `  taxonomy rows inserted: ${tax}/${taxonomyRows.length}\n` +
      `  use cases inserted:     ${uc}/${useCases.length}\n` +
      `  artifacts inserted:     ${art}/${artifacts.length}\n` +
      `  (already-present rows are skipped via INSERT OR IGNORE)`,
  );
}

main();
```

- [ ] **Step 2: Verify it typechecks**

Run: `npx tsc --noEmit`
Expected: no errors. (If the `artifacts` cast is awkward, define a small `interface OdmArtifact` mirroring the object in `buildArtifact` and type both the return and the array with it.)

- [ ] **Step 3: Commit**

```bash
git add scripts/seed-odm-knowledge.ts
git commit -m "feat(knowledge): ODM branch injector with sanitized markdown artifacts"
```

---

## Task 6: Run the injector and verify live

**Files:** none (operational)

- [ ] **Step 1: Run the injector**

Run: `npx tsx scripts/seed-odm-knowledge.ts`
Expected: prints `taxonomy rows inserted: 8/8`, `use cases inserted: 10/10`, `artifacts inserted: 10/10` (counts may be lower on a re-run — that's fine, idempotent).

- [ ] **Step 2: Verify via the API (dev server on :3000)**

Run:
```bash
curl -s http://localhost:3000/api/knowledge | \
  python3 -c "import sys,json; d=json.load(sys.stdin)['data']; ucs=[u for u in d['useCases'] if u['companyId']=='apex-odm']; print('apex-odm use cases:', len(ucs)); [print(' -', u['id'], u['name']) for u in ucs]"
```
Expected: 10 use cases listed for `apex-odm`.

- [ ] **Step 3: Verify one use case exposes its artifact**

Run:
```bash
curl -s http://localhost:3000/api/knowledge/use-cases/odm-uc-01/artifacts | \
  python3 -c "import sys,json; a=json.load(sys.stdin)['data']; print('artifacts:', len(a)); [print(' -', x['title'], x['file']['fileName'], x['status']) for x in a]"
```
Expected: 1 artifact, title ends "— Deep Dive", fileName the source `.md`, status `published`.

- [ ] **Step 4: Confirm the artifact file on disk is sanitized**

Run: `grep -ric "compal" data/artifacts/odm-uc-01 || echo "0 (sanitized)"`
Expected: `0 (sanitized)`.

- [ ] **Step 5: Run the full knowledge + content test suites**

Run: `npx vitest run src/content src/app/knowledge src/app/api/knowledge`
Expected: all pass.

- [ ] **Step 6: Final typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

---

## Self-review notes

- **Spec coverage:** taxonomy (Task 1), 10 use cases (Task 2), composition (Task 3), integrity test incl. sanitization (Task 4), injector with industry-scoped filter + sanitized artifacts (Task 5), live verification (Task 6). All spec sections covered.
- **Type consistency:** `odmBranch` shape matches `KnowledgeBranch`; injector filters by `industryId`/`companyId` consistent with the seed ids (`tmt-odm`, `apex-odm`); artifact JSON matches `KnowledgeArtifact` and the `knowledge_artifacts` columns.
- **Known adjustment points (resolve during execution, don't guess):** exact import style of the utility branch in `knowledge-seed.ts` (Step 3.1/3.2/3.3 — match it), and the exact exported names for archetype/interaction/a2a id lists (Task 4 Step 2).
```

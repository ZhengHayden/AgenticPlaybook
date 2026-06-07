# ODM Asset Library — Design

**Date:** 2026-06-07
**Status:** Approved (pending spec review)
**Author:** Claude + Hayden

## Goal

Add an **ODM (electronics contract manufacturing) asset library** to the Knowledge module, derived from the 10 deep-dive use-case files under `app/data/odm/use-cases/`. "Asset library" means both:

1. The **use-case library** — taxonomy (industry → company → functions → workflows) + 10 use cases, mirroring the Energy & Utilities library (commit `9f836a1`).
2. The **assets** — each source markdown attached to its use case as a downloadable file artifact.

The source content is Compal-specific; it is **sanitized** to a reference company **"Apex Electronics (ODM)"** throughout authored content and attached files.

## Source material

`app/data/odm/use-cases/01..10-*.md` + `README.md`. Each file has frontmatter (`title`, `domain`, `workflow`, `ai_type`, `horizon`, `priority`) and sections: Key Features & Business Impact (→ `description`, `kpis`, `businessObjectives`), High-Level Design / multi-agent architecture (→ `archetypes`, `interactionMode`, `a2aPattern`), Reference Summary / vendors + case studies (→ `references`), Sources.

## Taxonomy

Placed under the **existing TMT sector** (`id: tmt`). The ODM branch does **not** re-declare the TMT sector.

- **Industry:** `tmt-odm` — "ODM / Electronics Manufacturing" (`sectorId: tmt`, sort after `tmt-telecom`)
- **Company:** `apex-odm` — "Apex Electronics (ODM)" (`industryId: tmt-odm`)
- **5 functions** (grouped by domain) → **5 workflows** (one per function) → **10 use cases**:

| Function (`id`) | Workflow (`id`) | Use cases (priority) |
|---|---|---|
| Procurement & Supply Chain (`odm-fn-proc`) | Procurement & Supply Chain Orchestration (`odm-wf-proc`) | #1 Material Planning, #5 Supplier Risk, #9 PO Execution |
| Manufacturing Operations (`odm-fn-mfg`) | Production & Process Operations (`odm-wf-mfg`) | #2 Production Scheduling, #7 Yield Optimization |
| R&D / Engineering (`odm-fn-rnd`) | Engineering & NPI (`odm-wf-rnd`) | #3 ECN Impact Analysis, #4 NPI Phase-Gate, #10 Engineering Copilot |
| Sales & Commercial (`odm-fn-sales`) | Customer Program & RFQ Management (`odm-wf-sales`) | #6 RFQ Response & Should-Cost |
| Quality Assurance & Service (`odm-fn-qa`) | Quality & Service Resolution (`odm-wf-qa`) | #8 Quality Defect Analysis & 8D |

Use-case ids: `odm-uc-01` … `odm-uc-10` (numbered by source priority).

## Per-use-case field mapping

| # | techTag | maturity | notes |
|---|---|---|---|
| 1 Material Planning | Optimization | emerging | agentic demand-supply orchestration |
| 2 Production Scheduling | Optimization | emerging | agentic multi-program scheduling |
| 3 ECN Impact Analysis | GenAI | emerging | |
| 4 NPI Phase-Gate | AI/ML | pilot | H2 horizon |
| 5 Supplier Risk | AI/ML | emerging | |
| 6 RFQ / Should-Cost | GenAI | emerging | |
| 7 Yield Optimization | Optimization | emerging | |
| 8 Quality 8D | GenAI | emerging | |
| 9 PO Execution | Optimization | emerging | |
| 10 Engineering Copilot | GenAI | emerging | |

- `techTag`: GenAI files → `GenAI`; agentic planning/scheduling/yield/PO → `Optimization`; agentic risk/NPI → `AI/ML`. (Model has no "Agentic" tag.)
- `maturity`: H1 → `emerging`, H2 (NPI) → `pilot`. (Consistent with treating these as cutting-edge, not broadly `proven`.)
- `description`: 2–4 sentence sanitized summary from "Key Features"/"ODM-Specific Value".
- `kpis`: 2–4 quantified metrics from each file's impact table.
- `businessObjectives`: from objectives implied by the file (e.g. "Working Capital", "Cost Reduction", "Time-to-Market", "Quality", "Productivity").
- `archetypes` / `interactionMode` / `a2aPattern`: derived from each file's multi-agent design section (e.g. orchestrator + specialist agents → `["orchestrator","analyst","retriever","executor"]`, `interactionMode: "copilot"` graduating to `"autopilot"`, `a2aPattern: "hierarchical"`).
- `references`: named vendors + case studies as `{ name, detail }`.
- `validation`: `DEFAULT_VALIDATION` (`{ status: "notYet", note: "" }`), matching the E&U library.

## Components / files

Mirrors the E&U commit pattern.

1. **`src/content/knowledge-odm-seed.ts`** (new) — exports `odmBranch: KnowledgeBranch`.
   - `sectors: []` (TMT already exists), `industries: [tmt-odm]`, `companies: [apex-odm]`, `functions` (5), `workflows` (5), `useCaseSeeds` (10).
   - All content sanitized: no "Compal".

2. **`src/content/knowledge-seed.ts`** (edit) — import `odmBranch` and concat into `sectorsAll/industriesAll/companiesAll/functionsAll/workflowsAll` and the `useCaseSeeds` list (so the single `withParents` pass resolves the denormalized ids). `tmt-odm.sectorId = "tmt"` resolves against the existing base sector.

3. **`scripts/seed-odm-knowledge.ts`** (new) — idempotent injector for existing DBs (`npx tsx scripts/seed-odm-knowledge.ts`). Differences from the utility injector:
   - **Filter by industry/company, not sector** — ODM shares the `tmt` sector with Vodafone, so filtering by `sector_id` would wrongly scope existing use cases. Filter taxonomy/use-cases by `industryId === "tmt-odm"` (and its descendant company/functions/workflows).
   - **Also attaches artifacts** (below).
   - `INSERT OR IGNORE` for both taxonomy and use cases (safe re-run, won't resurrect user-deleted rows).

4. **Artifact attachment** (in the injector): for each use case, read its source markdown, **sanitize** "Compal"/"Compal Electronics" → "Apex Electronics (ODM)", write bytes via the existing `writeArtifactFile(useCaseId, artifactId, fileName, bytes)` convention, and `INSERT OR IGNORE` a `knowledge_artifacts` row.
   - Deterministic artifact id `odm-art-01..10` → idempotent.
   - Artifact JSON (`data`): `kind: "file"`, `type: "playbook"`, `status: "published"`, `owner: "ODM Reference Library"`, `title: "<use case> — Deep Dive"`, `file: { fileName: "<nn>-...md", mimeType: "text/markdown", sizeBytes, storagePath }`, `changelog: [{ at, author, note: "Imported from ODM deep-dive library" }]`.
   - Filenames retain the source basename; `text/markdown` is in `ALLOWED_ARTIFACT_MIME`.

5. **`src/content/knowledge-odm-seed.test.ts`** (new) — integrity tests:
   - Exactly 10 use-case seeds; ids `odm-uc-01..10` unique.
   - Every `workflowId` resolves to an ODM workflow; every workflow → ODM function → `apex-odm` → `tmt-odm` → `tmt`.
   - Every `techTag`, `maturity`, `archetypes`, `interactionMode`, `a2aPattern` is a valid union member.
   - Each use case has ≥1 KPI and ≥1 reference.
   - No "Compal" substring anywhere in the branch.

## Data flow

- **Fresh DB:** `ensureKnowledgeSeeded()` loads `knowledgeSeed` (now including `odmBranch`) → ODM taxonomy + 10 use cases present. (Artifacts are runtime file data, not part of static seed — same limitation as E&U.)
- **Existing DB (current dev):** run `scripts/seed-odm-knowledge.ts` → backfills ODM taxonomy + use cases + the 10 sanitized markdown artifacts.

## Sanitization rule

Replace, case-insensitively, "Compal Electronics" and standalone "Compal" with "Apex Electronics (ODM)" / "Apex Electronics" in: authored use-case fields (`description`, `kpis`, `references`) and the attached markdown bytes. Generic scale figures ("~$30B revenue", "51-workflow inventory") are retained as reference context. The seed test asserts no "Compal" remains in the branch module.

## Out of scope

- No UI changes (the Knowledge browser already renders any sector/industry/company).
- No changes to the existing TMT/Vodafone, Financial Services, Industrials, or E&U data.
- No re-sanitization of the original files under `data/odm/` (only the attached copies are sanitized).

## Testing

- `knowledge-odm-seed.test.ts` (above).
- Existing `knowledge-utility-seed.test.ts` pattern as reference.
- After injector run: verify via API (`/api/knowledge`) that `apex-odm` has 10 use cases and each exposes 1 published artifact; `tsc --noEmit` clean; existing suites green.

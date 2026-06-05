# Two-Mode Impact Scoring — Design

**Date:** 2026-06-06
**Scope:** Add a use-case grain beneath workflows and let a project prioritize either by workflow (today) or by use case, across the Impact-Sizing funnel.
**Status:** Approved for planning

## Problem

Today the Impact-Sizing module is **candidate-centric**: a `Candidate` (effectively a
*workflow* — one business process) is screened, funneled (ODS/ORS), scored
(VM · DDI · Risk → Priority), ranked in the portfolio, and gated into Design. There
is exactly one score per workflow.

Real engagements don't always work at that grain. Teams often arrive with **use-case
ideas already mapped to workflows** — one workflow may contain several discrete
agentic opportunities, each with its own value, decision density, and risk. Those
teams want to document the ideas during the readiness check and then prioritize at
the **use-case** level, not just the workflow level.

So we need two prioritization granularities:

- **Workflow-based** — score the process as one unit (today's behavior, unchanged).
- **Use-case-based** — score each use case; the workflow's rank rolls up from its use cases.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Mode scope | **Strictly per-project** — one `project.scoringMode` for the whole project; no per-workflow override |
| Use case ↔ Knowledge Library | **Independent now** — project use cases are free-standing; reserve an optional `knowledgeUseCaseId` field but build no link UI yet |
| Workflow rollup (use-case mode) | **Max + count above floor** — workflow ranks by its best use case's Priority; surface "k of n use cases ≥ 3.0" |
| Funnel & Gate grain | **Workflow-level** — Readiness Screen, 2×2 Funnel (ODS/ORS), and Gate stay on the workflow; only detailed value scoring + portfolio ranking go to the use-case grain |
| Persistence | **Reuse project JSON blob** — nest `ProjectUseCase[]` in the candidate, add `scoringMode` to the project; no new tables or routes |
| Back-compat | `scoringMode` undefined ⇒ behaves exactly as today ("workflow") |

## Conceptual Model

| Entity | Meaning | Representation |
|---|---|---|
| **Workflow** | A business process / automation target | existing `Candidate` |
| **Use Case** | A discrete agentic opportunity *within* a workflow (1 workflow → 1…N) | **new** `ProjectUseCase`, nested in `Candidate.useCases` |

`project.scoringMode: "workflow" | "useCase"` decides which grain is *active*. The
inactive grain's data is retained but not used for ranking, so switching modes is
non-destructive.

## Data Model

New project-scoped type (distinct from the cross-project `KnowledgeUseCase` in the
Knowledge Library):

```ts
// src/content/sample-data.ts
export type ScoringMode = "workflow" | "useCase";

export interface ProjectUseCase {
  id: string;
  candidateId: string;          // parent workflow
  name: string;
  description: string;
  impactRationale: string;      // captured during the Readiness check
  expectedKpis?: string[];
  // Layer-3 scoring at the use-case grain — reuses the existing rubric types verbatim.
  // Present only once the use case has been scored.
  vm?: VmScores;
  ddi?: DdiCounts;
  totalSteps?: number;
  risk?: RiskAssessment;
  scoringNotes?: string;
  solutionProposal?: SolutionProposal;
  knowledgeUseCaseId?: string;  // reserved for a future Knowledge-Library link; no UI yet
}

export interface Candidate {
  /* …existing fields… */
  useCases?: ProjectUseCase[];  // additive; absent on legacy candidates
}

export interface Project {
  /* …existing fields… */
  scoringMode?: ScoringMode;    // default "workflow"
}
```

A use case is **"scored"** iff `vm`, `ddi`, `totalSteps`, and `risk` are all present.

## Scoring Math (no rubric changes)

All four primitives in `scoring-rubric.ts` are reused unchanged:
`computeVm`, `computeDdiRaw`, `computeRiskPenalty`, `computeRas`, `computePriority`,
with `PRIORITY_FLOOR = 3.0`.

The only new logic is **cohort selection** and **rollup**, extracted into pure,
unit-tested helpers:

- **DDI normalization cohort** — `DDI_normalized = DDI_raw / maxDdiRaw(cohort)`:
  - workflow mode → cohort = all eligible candidates (today's behavior).
  - use-case mode → cohort = **all scored use cases project-wide**.
- **Workflow rollup** (use-case mode):
  ```
  workflow.priority   = max(scored use-case priorities)   // 0 when none scored
  workflow.total      = count of scored use cases
  workflow.aboveFloor = count of use-case priorities ≥ 3.0
  ```

New helpers (in `scoring-rubric.ts`):

```ts
export interface ScorableUnit { vm: VmScores; ddi: DdiCounts; totalSteps: number; risk: RiskAssessment; }
export function cohortMaxDdiRaw(units: ReadonlyArray<ScorableUnit>): number;
export function computeUnitPriority(unit: ScorableUnit, maxDdiRaw: number): number;
export interface WorkflowRollup { priority: number; total: number; aboveFloor: number; }
export function rollupWorkflow(useCasePriorities: ReadonlyArray<number>): WorkflowRollup;
```

The existing inline normalization in `scoring-editor.tsx` is refactored to call
`cohortMaxDdiRaw` + `computeUnitPriority` so both modes share one code path.

## Flow & Grain

```
Readiness Screen      ── workflow-level (6 binary gates)  + NEW "Use-case ideas" panel per workflow
2×2 Funnel (ODS/ORS)  ── workflow-level (unchanged)
Detailed Scoring      ── follows project.scoringMode:
                           • workflow → score the candidate           (today)
                           • useCase  → score each scored ProjectUseCase
Portfolio             ── ranks workflows; in use-case mode each workflow row expands to its ranked use cases
Gate                  ── workflow / project-level (unchanged)
Design                ── Workflow entity gains optional useCaseId back-reference
```

## UI Changes

1. **Project mode switch** — a single "Score by: Workflow ⇄ Use case" segmented
   control (reuse `seg-tabs.tsx`) in the Impact-Sizing header, writing
   `project.scoringMode`. Switching shows a non-destructive notice ("the other
   mode's scores are kept but inactive").

2. **Readiness (`screen-matrix.tsx`)** — a per-workflow **Use-case ideas** sub-panel:
   add / edit / remove rows of `name · description · impactRationale · expectedKpis`.
   Available in both modes; in use-case mode it is the required input for scoring.

3. **Scoring (`scoring-editor.tsx`)** — read `project.scoringMode`:
   - workflow mode → exactly today's editor.
   - use-case mode → each workflow card expands into its use cases; each use case
     opens the **same VM/DDI/Risk sub-editor** (extracted to a shared component);
     the card header shows the rollup score + "k of n ≥ 3.0" badge. Empty state:
     "Add use-case ideas in Readiness first."

4. **Portfolio (`portfolio-view.tsx`)** — rows rank by the active mode's score; in
   use-case mode a row expands to its use cases ranked by Priority with their own
   disposition; Design picks specific use cases.

5. **Design** — `Workflow.useCaseId?` back-reference so a built workflow traces to the
   use case that motivated it (parallel to the existing `candidateId`).

## Persistence

No new tables or routes. Additions ride the existing
`useProjectSave` → `PATCH /api/projects/:id` → `projects-repo` (shallow-merge into the
JSON `data` blob) path:

- `src/db/validation.ts`: add `projectUseCaseSchema`, add `useCases` to
  `candidateSchema`, add `scoringMode` + `useCaseId` (on workflow) to the relevant
  schemas. `projectPatchSchema` stays `projectFieldsSchema.partial()`.

## i18n

All new labels added to `src/lib/i18n.ts` under both `en` and `zh` (mode toggle,
use-case panel fields, rollup badge, empty states).

## Out of Scope (v1)

- Per-workflow mode override (locked to per-project).
- Knowledge-Library link UI (field reserved only).
- Use-case-level ODS/ORS funnel or use-case-level gate.
- Migrating existing projects (legacy projects stay in workflow mode until toggled).

## Non-Functional

- **Immutability** — all updates produce new objects (project coding-style rule).
- **Back-compat** — undefined `scoringMode`/`useCases` must render identically to today.
- **Test coverage** — pure helpers and validation ≥ 80% lines; UI via RTL smoke + flow tests.

# Two-Mode Impact Scoring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a project-scoped use-case grain beneath workflows and let a project prioritize either by workflow (today) or by use case. The Readiness check captures use-case ideas; the Scoring module scores at the active grain; the Portfolio ranks workflows with use-case drill-down.

**Architecture:** Follow existing Impact-Sizing patterns exactly — project state lives in the `Project` JSON blob in SQLite, edited through client components via `useProjectSave` → `PATCH /api/projects/:id`, validated by zod in `src/db/validation.ts`. Scoring math stays in `src/content/scoring-rubric.ts` (pure functions). No new tables or API routes.

**Tech Stack:** Next.js 16, React 19, TypeScript, better-sqlite3 + drizzle-orm, zod v4, Vitest + @testing-library/react (harness already present).

**Spec:** `docs/superpowers/specs/2026-06-06-two-mode-impact-scoring-design.md`

**Locked decisions:** mode is **strictly per-project** (`project.scoringMode`); use cases are **independent** of the Knowledge Library (reserve `knowledgeUseCaseId`, no link UI); rollup is **max + count above floor**; the **Funnel and Gate stay workflow-level**.

---

## File Structure

**Created:**
- `src/content/scoring-rollup.test.ts` — tests for cohort + rollup helpers.
- `src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.tsx` — Readiness capture panel.
- `src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.test.tsx`
- `src/app/projects/[id]/impact-sizing/scoring/score-unit-editor.tsx` — shared VM/DDI/Risk sub-editor (extracted).
- `src/app/projects/[id]/impact-sizing/scoring/use-case-scoring.tsx` — use-case-mode scoring view.
- `src/app/projects/[id]/impact-sizing/_components/scoring-mode-switch.tsx` — project mode toggle.
- `src/app/projects/[id]/impact-sizing/scoring/scoring-editor.test.tsx` — mode-aware render tests.
- `src/db/validation-usecase.test.ts` — schema tests for the new fields.

**Modified:**
- `src/content/sample-data.ts` — `ScoringMode`, `ProjectUseCase`, `Candidate.useCases`, `Project.scoringMode`, `Workflow.useCaseId`.
- `src/content/scoring-rubric.ts` — `ScorableUnit`, `cohortMaxDdiRaw`, `computeUnitPriority`, `WorkflowRollup`, `rollupWorkflow`.
- `src/db/validation.ts` — `projectUseCaseSchema`; `useCases` on candidate; `scoringMode` on project; `useCaseId` on workflow.
- `src/app/projects/[id]/impact-sizing/scoring/page.tsx` — pass `scoringMode` + full candidates.
- `src/app/projects/[id]/impact-sizing/scoring/scoring-editor.tsx` — mode branch + shared sub-editor + helper-based normalization.
- `src/app/projects/[id]/impact-sizing/screen/` (screen-matrix host page/component) — mount the use-case ideas panel.
- `src/app/projects/[id]/impact-sizing/portfolio/portfolio-view.tsx` — mode-aware ranking + use-case drill-down.
- `src/lib/i18n.ts` — new keys (en + zh).

---

## Task 0: Confirm harness + baseline green

- [ ] **Step 1: Run the suite**

Run: `npm test`
Expected: all current tests pass (baseline before changes).

- [ ] **Step 2: Note the scoring entrypoints**

Confirm `scoring-editor.tsx` computes `maxDdiRaw` inline (≈ lines 126–135) and `page.tsx` filters eligible candidates by the binary screen threshold. These are the two seams this plan refactors.

---

## Task 1: Domain types (ScoringMode + ProjectUseCase)

**Files:**
- Modify: `src/content/sample-data.ts`

This task is types only (no runtime behavior), so it is verified by `tsc`/build, not a unit test.

- [ ] **Step 1: Add the types**

After the existing `RiskAssessment`/`SolutionProposal` declarations add:
```ts
export type ScoringMode = "workflow" | "useCase";

/**
 * A discrete agentic opportunity within a workflow (one workflow → 1…N).
 * Distinct from the cross-project KnowledgeUseCase in the Knowledge Library.
 * Layer-3 scoring fields are present only once the use case has been scored.
 */
export interface ProjectUseCase {
  id: string;
  candidateId: string;
  name: string;
  description: string;
  impactRationale: string;
  expectedKpis?: string[];
  vm?: VmScores;
  ddi?: DdiCounts;
  totalSteps?: number;
  risk?: RiskAssessment;
  scoringNotes?: string;
  solutionProposal?: SolutionProposal;
  /** Reserved for a future Knowledge-Library link; no UI in v1. */
  knowledgeUseCaseId?: string;
}
```

- [ ] **Step 2: Extend `Candidate`, `Workflow`, `Project`**

- On `Candidate`, add: `useCases?: ProjectUseCase[];`
- On `Workflow`, add: `/** The use case this workflow was built from (use-case mode). */ useCaseId?: string;`
- On `Project`, add: `/** Active prioritization grain; undefined ⇒ "workflow". */ scoringMode?: ScoringMode;`

- [ ] **Step 3: Type-check**

Run: `npx tsc --noEmit`
Expected: no new errors.

- [ ] **Step 4: Commit**
```bash
git add src/content/sample-data.ts
git commit -m "feat(impact): ProjectUseCase + ScoringMode domain types"
```

---

## Task 2: Cohort + rollup helpers (TDD)

**Files:**
- Modify: `src/content/scoring-rubric.ts`
- Test: `src/content/scoring-rollup.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/content/scoring-rollup.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { cohortMaxDdiRaw, computeUnitPriority, rollupWorkflow, PRIORITY_FLOOR } from "./scoring-rubric";

const unit = (vmLevel: 1|2|3|4|5, judgment: number) => ({
  vm: { costSavings: vmLevel, qualityImprovement: vmLevel, speedImprovement: vmLevel, strategicAlignment: vmLevel },
  ddi: { binary: 0, multi: 0, judgment },
  totalSteps: 10,
  risk: { implementation: "L", adoption: "L", compliance: "L", dependency: "L" } as const,
});

describe("cohortMaxDdiRaw", () => {
  it("returns the max raw DDI across units and is positive even when all zero", () => {
    expect(cohortMaxDdiRaw([unit(3, 0)])).toBeGreaterThan(0);
    expect(cohortMaxDdiRaw([unit(3, 1), unit(3, 5)])).toBeCloseTo((5 * 3) / 10, 5);
  });
});

describe("computeUnitPriority", () => {
  it("rises with value magnitude", () => {
    const max = cohortMaxDdiRaw([unit(5, 2), unit(1, 2)]);
    expect(computeUnitPriority(unit(5, 2), max)).toBeGreaterThan(computeUnitPriority(unit(1, 2), max));
  });
  it("treats a zero-DDI cohort as no DDI boost (no divide-by-zero)", () => {
    const p = computeUnitPriority(unit(4, 0), cohortMaxDdiRaw([unit(4, 0)]));
    expect(Number.isFinite(p)).toBe(true);
  });
});

describe("rollupWorkflow", () => {
  it("takes the max priority and counts those at/above the floor", () => {
    const r = rollupWorkflow([2.0, 4.5, 3.0]);
    expect(r.priority).toBe(4.5);
    expect(r.total).toBe(3);
    expect(r.aboveFloor).toBe(2); // 4.5 and 3.0 (>= PRIORITY_FLOOR)
  });
  it("is zero/empty when there are no scored use cases", () => {
    expect(rollupWorkflow([])).toEqual({ priority: 0, total: 0, aboveFloor: 0 });
  });
  it("uses PRIORITY_FLOOR as the threshold", () => {
    expect(rollupWorkflow([PRIORITY_FLOOR - 0.01]).aboveFloor).toBe(0);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/content/scoring-rollup.test.ts`
Expected: FAIL — helpers not exported.

- [ ] **Step 3: Implement the helpers in `src/content/scoring-rubric.ts`**

Append (reusing the existing `computeVm`/`computeDdiRaw`/`computeRiskPenalty`/`computeRas`/`computePriority`):
```ts
import type { VmScores, DdiCounts, RiskAssessment } from "./sample-data";

/** A unit that can be scored on the Layer-3 rubric (a candidate or a use case). */
export interface ScorableUnit {
  vm: VmScores;
  ddi: DdiCounts;
  totalSteps: number;
  risk: RiskAssessment;
}

/** Max raw DDI across a cohort; floored to a tiny positive to avoid /0. */
export function cohortMaxDdiRaw(units: ReadonlyArray<ScorableUnit>): number {
  return Math.max(0.0001, ...units.map((u) => computeDdiRaw(u.ddi, u.totalSteps)));
}

/** Full Priority for one unit, normalized against the cohort's max raw DDI. */
export function computeUnitPriority(unit: ScorableUnit, maxDdiRaw: number): number {
  const vm = computeVm(unit.vm);
  const ddiNormalized = maxDdiRaw > 0 ? computeDdiRaw(unit.ddi, unit.totalSteps) / maxDdiRaw : 0;
  const ras = computeRas(vm, computeRiskPenalty(unit.risk));
  return computePriority(ras, ddiNormalized);
}

export interface WorkflowRollup {
  priority: number;   // max of use-case priorities (0 when none)
  total: number;      // scored use cases
  aboveFloor: number; // count >= PRIORITY_FLOOR
}

/** Roll a workflow's use-case priorities up to a single ranking record. */
export function rollupWorkflow(useCasePriorities: ReadonlyArray<number>): WorkflowRollup {
  if (useCasePriorities.length === 0) return { priority: 0, total: 0, aboveFloor: 0 };
  return {
    priority: Math.max(...useCasePriorities),
    total: useCasePriorities.length,
    aboveFloor: useCasePriorities.filter((p) => p >= PRIORITY_FLOOR).length,
  };
}
```
> Note: importing the three `…Scores`/`…Counts`/`…Assessment` types from `sample-data` is type-only; `scoring-rubric.ts` already defines the underlying id unions, so there is no runtime cycle.

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- src/content/scoring-rollup.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/content/scoring-rubric.ts src/content/scoring-rollup.test.ts
git commit -m "feat(impact): cohort DDI + workflow rollup helpers (max + count above floor)"
```

---

## Task 3: Validation schemas (TDD)

**Files:**
- Modify: `src/db/validation.ts`
- Test: `src/db/validation-usecase.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/db/validation-usecase.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { projectPatchSchema } from "./validation";

const baseCandidate = {
  id: "c1", name: "Inv", description: "", sourceSystem: "SAP", volumePerMonth: 100, pain: "high",
  screen: { documentability:{yes:true}, dataAccessibility:{yes:true}, executionVolume:{yes:true},
            processOwner:{yes:true}, outputQuality:{yes:true}, processStability:{yes:true} },
  ods: { outputStructure:2, correctnessVerifiability:2, varianceTolerance:2, groundTruth:2 },
  ors: { sponsorAuthority:2, teamReceptivity:2, integrationComplexity:2, changeHistory:2 },
  rationale: { ods:{}, ors:{} },
  vm: { costSavings:3, qualityImprovement:3, speedImprovement:3, strategicAlignment:3 },
  ddi: { binary:1, multi:1, judgment:1 }, totalSteps: 10,
  risk: { implementation:"L", adoption:"L", compliance:"L", dependency:"L" },
  recommendation: "",
};

describe("project use-case validation", () => {
  it("accepts scoringMode and nested useCases", () => {
    const parsed = projectPatchSchema.safeParse({
      scoringMode: "useCase",
      candidates: [{ ...baseCandidate, useCases: [
        { id:"u1", candidateId:"c1", name:"Auto-match", description:"d", impactRationale:"r" },
      ] }],
    });
    expect(parsed.success).toBe(true);
  });

  it("accepts a fully-scored use case", () => {
    const parsed = projectPatchSchema.safeParse({
      candidates: [{ ...baseCandidate, useCases: [{
        id:"u1", candidateId:"c1", name:"X", description:"d", impactRationale:"r",
        vm: baseCandidate.vm, ddi: baseCandidate.ddi, totalSteps: 10, risk: baseCandidate.risk,
      }] }],
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid scoringMode", () => {
    expect(projectPatchSchema.safeParse({ scoringMode: "nope" }).success).toBe(false);
  });

  it("rejects a use case missing required fields", () => {
    const parsed = projectPatchSchema.safeParse({
      candidates: [{ ...baseCandidate, useCases: [{ id:"u1", candidateId:"c1", name:"X" }] }],
    });
    expect(parsed.success).toBe(false);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- src/db/validation-usecase.test.ts`
Expected: FAIL — `scoringMode`/`useCases` not allowed (or unknown-key/parse mismatch).

- [ ] **Step 3: Add the schemas in `src/db/validation.ts`**

Add a `scoringModeSchema` and `projectUseCaseSchema` (reuse the existing
`vmScoresSchema`, `ddiCountsSchema`, `riskAssessmentSchema`, `solutionProposalSchema`):
```ts
const scoringModeSchema = z.enum(["workflow", "useCase"]);

const projectUseCaseSchema = z.object({
  id: z.string().min(1),
  candidateId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  impactRationale: z.string(),
  expectedKpis: z.array(z.string()).optional(),
  vm: vmScoresSchema.optional(),
  ddi: ddiCountsSchema.optional(),
  totalSteps: z.number().int().positive().optional(),
  risk: riskAssessmentSchema.optional(),
  scoringNotes: z.string().optional(),
  solutionProposal: solutionProposalSchema.optional(),
  knowledgeUseCaseId: z.string().optional(),
});
```
Then:
- In `candidateSchema`, add: `useCases: z.array(projectUseCaseSchema).optional(),`
- In `workflowSchema`, add: `useCaseId: z.string().optional(),`
- In `projectFieldsSchema`, add: `scoringMode: scoringModeSchema.optional(),`

- [ ] **Step 4: Run to verify it passes**

Run: `npm test -- src/db/validation-usecase.test.ts`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add src/db/validation.ts src/db/validation-usecase.test.ts
git commit -m "feat(impact): zod schemas for useCases + scoringMode + workflow useCaseId"
```

---

## Task 4: Readiness — Use-case ideas panel (TDD)

**Files:**
- Create: `src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.tsx`
- Create: `src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.test.tsx`
- Modify: the Readiness screen host (`screen-matrix.tsx` and/or its page) to mount the panel per candidate.

The panel is a controlled component: it receives a candidate's `useCases` and an
`onChange(useCases)` callback; the host persists via `useProjectSave`. Keep it pure
and immutable (return new arrays, never mutate).

- [ ] **Step 1: Write the failing test**

Create `use-case-ideas-panel.test.tsx` (wrap in `LocaleProvider` as the knowledge tests do):
```tsx
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { UseCaseIdeasPanel } from "./use-case-ideas-panel";

const wrap = (ui: React.ReactNode) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe("UseCaseIdeasPanel", () => {
  it("renders existing use-case ideas", () => {
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={[
      { id:"u1", candidateId:"c1", name:"Auto-match", description:"d", impactRationale:"r" },
    ]} onChange={() => {}} />);
    expect(screen.getByDisplayValue("Auto-match")).toBeInTheDocument();
  });

  it("adds a new idea via the add button", () => {
    const onChange = vi.fn();
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={[]} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /add use case/i }));
    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0][0]).toHaveLength(1);
    expect(onChange.mock.calls[0][0][0].candidateId).toBe("c1");
  });

  it("removes an idea immutably (new array, original untouched)", () => {
    const onChange = vi.fn();
    const original = [{ id:"u1", candidateId:"c1", name:"X", description:"", impactRationale:"" }];
    wrap(<UseCaseIdeasPanel candidateId="c1" useCases={original} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: /remove/i }));
    expect(onChange.mock.calls[0][0]).toHaveLength(0);
    expect(original).toHaveLength(1);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run: `npm test -- "src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.test.tsx"`
Expected: FAIL — module not found.

- [ ] **Step 3: Implement `use-case-ideas-panel.tsx`**

A small client component:
- Props: `{ candidateId: string; useCases: ProjectUseCase[]; onChange: (next: ProjectUseCase[]) => void }`.
- Renders a list of rows, each with inputs for `name`, `description`, `impactRationale`, and a comma/enter-driven `expectedKpis` editor; a "Remove" button per row.
- "Add use case" appends `{ id: newId(), candidateId, name:"", description:"", impactRationale:"" }`.
- Edits and removals produce **new** arrays via map/filter; call `onChange` with the result.
- Use the existing `Button` and field primitives; pull labels from `useLocale()`/i18n (Task 8 adds the keys — use literal fallbacks until then or land Task 8 first).
- `newId()` helper: `id-${Math.random().toString(36).slice(2,8)}` (no `Date.now`, matching repo constraints in test env).

- [ ] **Step 4: Mount it in the Readiness screen**

In the screen host, render `<UseCaseIdeasPanel>` inside each candidate's expandable evidence area, wiring `onChange` to merge the candidate's `useCases` and call the existing project save. Keep it visible in both modes (documentation in workflow mode; required input in use-case mode).

- [ ] **Step 5: Run to verify it passes**

Run: `npm test -- "src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.test.tsx"`
Expected: PASS (3 tests).

- [ ] **Step 6: Commit**
```bash
git add "src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.tsx" \
        "src/app/projects/[id]/impact-sizing/_components/use-case-ideas-panel.test.tsx" \
        "src/app/projects/[id]/impact-sizing/screen/"
git commit -m "feat(impact): capture use-case ideas in the Readiness check"
```

---

## Task 5: Project scoring-mode switch

**Files:**
- Create: `src/app/projects/[id]/impact-sizing/_components/scoring-mode-switch.tsx`
- Modify: the Impact-Sizing header/layout to mount it.

- [ ] **Step 1: Implement the switch**

A client component using `seg-tabs.tsx`:
- Props: `{ projectId: string; mode: ScoringMode }`.
- Two options: "Workflow" / "Use case".
- On change, call `useProjectSave(projectId).save({ scoringMode })` then `router.refresh()`.
- Show a one-line notice: "Switching keeps the other mode's scores but ranks by the selected grain."

- [ ] **Step 2: Mount in the Impact-Sizing layout/header**

Place near the funnel/scoring nav so it governs the whole phase. Default display when `scoringMode` is undefined = "Workflow".

- [ ] **Step 3: Manual check**

Toggle in the running app; confirm the value persists across reload (PATCH round-trip).

- [ ] **Step 4: Commit**
```bash
git add "src/app/projects/[id]/impact-sizing/_components/scoring-mode-switch.tsx" \
        "src/app/projects/[id]/impact-sizing/"
git commit -m "feat(impact): per-project scoring-mode switch (workflow | use case)"
```

---

## Task 6: Mode-aware Scoring editor

**Files:**
- Create: `src/app/projects/[id]/impact-sizing/scoring/score-unit-editor.tsx` (shared VM/DDI/Risk editor)
- Create: `src/app/projects/[id]/impact-sizing/scoring/use-case-scoring.tsx`
- Modify: `scoring-editor.tsx`, `scoring/page.tsx`
- Test: `src/app/projects/[id]/impact-sizing/scoring/scoring-editor.test.tsx`

- [ ] **Step 1: Extract the shared sub-editor (refactor, behavior-preserving)**

Pull the VM radios / DDI inputs / Risk L-M-H controls + the per-unit priority readout
out of `scoring-editor.tsx` into `score-unit-editor.tsx`:
- Props: `{ value: ScorableUnit; maxDdiRaw: number; notes?: string; onChange(next): void; locale }`.
- Internally uses `computeUnitPriority(value, maxDdiRaw)` and `interpretPriority`.
- `scoring-editor.tsx` (workflow mode) now renders one `<ScoreUnitEditor>` per candidate and computes `maxDdiRaw = cohortMaxDdiRaw(eligibleCandidates)`.
Run `npm test` after the refactor to confirm nothing regressed.

- [ ] **Step 2: Write the failing mode test**

Create `scoring-editor.test.tsx`:
```tsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { LocaleProvider } from "@/lib/locale-context";
import { ScoringEditor } from "./scoring-editor";

const candidate = (id: string, useCases = []) => ({ /* minimal eligible candidate, see Task 3 baseCandidate */ id, useCases });
const wrap = (ui) => render(<LocaleProvider>{ui}</LocaleProvider>);

describe("ScoringEditor modes", () => {
  it("workflow mode shows one score block per candidate", () => {
    wrap(<ScoringEditor projectId="p" scoringMode="workflow" candidates={[candidate("c1")]} allCandidates={[candidate("c1")]} />);
    // assert a workflow-level VM control is present
  });

  it("use-case mode lists a workflow's use cases and prompts when empty", () => {
    wrap(<ScoringEditor projectId="p" scoringMode="useCase" candidates={[candidate("c1", [])]} allCandidates={[candidate("c1", [])]} />);
    expect(screen.getByText(/add use-case ideas in readiness/i)).toBeInTheDocument();
  });
});
```
> Adjust the assertions to the real labels you render; keep the two cases (workflow block vs use-case empty-state).

- [ ] **Step 3: Run to verify it fails**

Run: `npm test -- "src/app/projects/[id]/impact-sizing/scoring/scoring-editor.test.tsx"`
Expected: FAIL — `scoringMode` prop not handled / empty-state text absent.

- [ ] **Step 4: Implement mode branching**

- `scoring/page.tsx`: pass `scoringMode={project.scoringMode ?? "workflow"}` and the full candidate list (use-case mode scores within every workflow that has use cases, not only screen-eligible ones — confirm with product; default: keep the screen-eligibility gate for workflows in both modes).
- `scoring-editor.tsx`: when `scoringMode === "useCase"`, render `<UseCaseScoring>` instead of the per-candidate blocks.
- `use-case-scoring.tsx`:
  - Cohort = all scored use cases across all candidates → `maxDdiRaw = cohortMaxDdiRaw(scoredUseCases)`.
  - For each candidate (workflow): header shows `rollupWorkflow(itsUseCasePriorities)` → max priority + "k of n ≥ 3.0" badge; if it has no use cases, show the empty-state nudge linking to Readiness.
  - Each use case opens a `<ScoreUnitEditor>`; on change, update that use case immutably and `save({ candidates: mergedCandidates })`.

- [ ] **Step 5: Run to verify it passes**

Run: `npm test -- "src/app/projects/[id]/impact-sizing/scoring/scoring-editor.test.tsx"`
Expected: PASS.

- [ ] **Step 6: Commit**
```bash
git add "src/app/projects/[id]/impact-sizing/scoring/"
git commit -m "feat(impact): mode-aware scoring (workflow | per-use-case) with shared sub-editor"
```

---

## Task 7: Portfolio — mode-aware ranking + use-case drill-down

**Files:**
- Modify: `src/app/projects/[id]/impact-sizing/portfolio/portfolio-view.tsx` (+ its page to pass `scoringMode`)

- [ ] **Step 1: Rank by the active grain**

- workflow mode: unchanged (rank candidates by their Priority).
- use-case mode: rank workflows by `rollupWorkflow(...).priority`; render the
  "k of n ≥ 3.0" badge on each row; make rows expandable to their use cases sorted by
  Priority, each showing its score + disposition (`solutionProposal`).

- [ ] **Step 2: Design hand-off**

In use-case mode, the "send to Design" affordance selects a **use case** and stamps the
created/linked `Workflow.useCaseId` (alongside the existing `candidateId`). Workflow mode
is unchanged.

- [ ] **Step 3: Manual check + commit**

Verify ranking flips correctly when the mode toggles; expansion shows ranked use cases.
```bash
git add "src/app/projects/[id]/impact-sizing/portfolio/"
git commit -m "feat(impact): portfolio ranks by active grain with use-case drill-down"
```

---

## Task 8: i18n keys (en + zh)

**Files:**
- Modify: `src/lib/i18n.ts`

- [ ] **Step 1: Add keys under both locales**

Mode switch (`Workflow`/`Use case`, switch notice), use-case panel
(`Add use case`, `Use-case ideas`, `Impact rationale`, `Expected KPIs`, `Remove`),
scoring empty state (`Add use-case ideas in Readiness first`), rollup badge
(`{k} of {n} ≥ 3.0`). Keep `en` and `zh` in sync (the i18n test asserts parity if present).

- [ ] **Step 2: Replace literal fallbacks**

Swap any temporary literals in Tasks 4–7 for `t.*` lookups.

- [ ] **Step 3: Run tests + commit**

Run: `npm test`
```bash
git add src/lib/i18n.ts "src/app/projects/[id]/impact-sizing/"
git commit -m "feat(impact): i18n keys for two-mode scoring (en + zh)"
```

---

## Task 9: Verification + coverage

- [ ] **Step 1: Full suite**

Run: `npm test`
Expected: all green.

- [ ] **Step 2: Coverage of new logic**

Run: `npm run test:cov`
Expected: `scoring-rubric.ts` rollup helpers and the new validation ≥ 80% lines. Add cases if below (e.g. single-use-case rollup, all-below-floor, undefined `scoringMode` path).

- [ ] **Step 3: Manual E2E (running app)**

`npm run dev`, open a project's `/impact-sizing`:
- Document use-case ideas in Readiness for a workflow.
- Toggle the project to **Use case**; score two use cases under one workflow.
- Confirm the workflow's rollup = max priority and the "k of n ≥ 3.0" badge is right.
- Open Portfolio: workflow ranks by rollup; expand to see ranked use cases.
- Toggle back to **Workflow**: today's behavior returns; use-case scores are retained but inactive.

- [ ] **Step 4: Final commit**
```bash
git add -A
git commit -m "test(impact): coverage top-up + verification for two-mode scoring"
```

---

## Self-Review Notes (for the implementer)

- **Back-compat is the acceptance bar:** a project with `scoringMode` undefined and no `useCases` must render byte-for-byte like today. The mode branch defaults to `"workflow"`.
- **One scoring code path:** both modes route through `cohortMaxDdiRaw` + `computeUnitPriority`; do not duplicate the normalization. The only difference is the cohort set (eligible candidates vs all scored use cases).
- **Immutability:** every candidate/use-case update returns new objects; never mutate `props.useCases` or `allCandidates` (project coding-style rule).
- **Funnel/Gate untouched:** ODS/ORS and gate stay workflow-level by decision — do not thread `scoringMode` into `screen-matrix` funnel logic or the gate.
- **Knowledge-Library link:** `knowledgeUseCaseId` is reserved only; no resolver, no UI in v1.
- **Persistence:** all writes go through the existing `useProjectSave` → `PATCH /api/projects/:id` path; no new routes or tables.

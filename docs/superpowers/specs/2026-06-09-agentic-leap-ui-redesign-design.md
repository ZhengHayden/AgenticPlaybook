# Agentic Leap UI Redesign — Spec A: Foundations + Portfolio Home + Project Overview

**Date:** 2026-06-09
**Status:** Proposed — awaiting review
**Scope of this spec:** Spec A only. Specs B and C are sequenced follow-ons (see §9).

---

## 1. Background & Decision

The app currently follows an **SLDS-flat** design language (the `Req/Frontier Agentic AI Platform Professional UI-UX Design Proposal.md` spec, also captured in `docs/superpowers/specs/2026-06-07-slds-design-system-design.md`). A large amount of uncommitted work on this branch already implements it: `StatTile`, `StatusChip`, `ProjectsTable`, `OverviewAnalytics` + `charts/`, `EmptyState`, `PhasePath`, `PageHeader`, `SegTabs`, `PillTabs`, all wired to real `sample-data`.

The user has chosen to **pivot to the "Agentic Leap" reference look** (`Req/Agentic Leap/` — a standalone Vite+React mock, with `Req/Agentic Leap/docs/ui-design.md` as its full spec). This is a richer "Linear × Notion × Palantir Foundry" aesthetic: brighter primary blue, a **violet AI accent**, gradient KPI washes, `rounded-xl` cards, pipeline steppers, swimlanes, quadrant-bubble matrices.

**Confirmed decisions (from brainstorming):**
1. **Full reference look** — adopt the reference palette, typography, and component styling.
2. **Scope** — Portfolio Home + Project Overview + all project-level deep-dives (sequenced as Specs A/B/C). `/knowledge` is **not** redesigned.
3. **`/knowledge` inherits the new theme** — global token re-skin is acceptable; `/knowledge` will pick up the new palette/typography for free, with no layout/structure changes.
4. **Evolve, don't rebuild** — existing components already hold the hard parts (real-data wiring, i18n, a11y, charts). Restyle them into the reference look rather than replacing them.

### Non-goals
- No redesign of `/knowledge` page structure or layout.
- No data-model changes to `sample-data` or the repo/validation layer.
- No new routes or renamed routes (keep "Impact Sizing", EN/中/繁 i18n, existing URLs).
- Specs B (Impact Sizing deep-dives) and C (Design / Opportunity Scan / Artifacts) are **out of scope here**.

---

## 2. Design Tokens (Foundation)

Target file: `app/src/app/globals.css` (Tailwind v4 `@theme`).

### 2.1 Strategy
The reference uses Tailwind v3 + HSL tokens (`--primary`, `--accent-violet`, `--success`, `--q1..q4`, …). The app uses Tailwind v4 `@theme inline` + OKLCH with custom names (`brand-*`, `state-*`, `ink`, `surface`, `hairline`, `canvas`, `subtle`). To adopt the reference look **without breaking the ~20 components that reference the existing names**:

- **Add** the reference token set as the new source of truth, expressed in the v4 `@theme` (HSL is fine — `hsl(var(--x))` or direct OKLCH equivalents; we keep HSL values from the reference for fidelity).
- **Re-map legacy names onto the new values** so existing components shift automatically:
  - `brand-600/700/300/50/100/800` → reference `primary` / `primary-deep` / `ring` / `primary-soft` ramp.
  - `state-ready/warn/block/info/neutral` (+ `-bg`) → reference `success` / `warning` / `danger` / `info` / `q4` (+ `-soft`).
  - `ink` / `ink-muted` / `ink-faint` → reference `foreground` / `muted-foreground` / a derived tertiary.
  - `canvas` / `surface` / `subtle` / `hairline` / `hairline-strong` → reference `background` / `surface` / `surface-muted` / `border` / a derived strong border.
- **Add net-new tokens** with no legacy equivalent: `accent-violet` (+ `-soft`), `q1..q4` (+ `-soft`), `primary-deep`, `primary-soft`, `surface-muted`.

Net effect: one token system. Every page (including `/knowledge`) renders in the reference palette; redesigned pages additionally use the new layout primitives.

### 2.2 Palette (from `Req/Agentic Leap/src/index.css`)
Light + dark, semantic. Brand `primary 222 89% 55%`, `primary-deep 224 76% 38%`, `accent-violet 258 90% 66%`; `success/warning/danger/info` with `-soft` tints; `q1` green / `q2` blue / `q3` amber / `q4` slate (Quick Win / Sponsor & Align / Invest & Prove / Defer & Mature). Dark mode mirrors at `surface 222 47% 8/11/14%`. Full values are copied verbatim from the reference `index.css` `:root` and `.dark` blocks.

### 2.3 Typography & utilities
- Fonts via `next/font`: **Inter** (body), **Inter Tight** (display), **JetBrains Mono** (numerals/IDs). Wire into the root layout and `@theme` `--font-*`.
- Utility classes ported from the reference: `.font-display`, `.font-mono-num` (tabular-nums), `.tabular`, `.eyebrow` (11px uppercase tracked muted caption).
- Radius scale bumped to reference (`--radius: 0.625rem`; `lg/md/sm` derived). KPI tiles/modals use `xl`.

### 2.4 Acceptance
- Existing pages compile and render with the new palette; no component references a token that no longer resolves.
- `/styleguide` page updated to display the new palette + primitives (it already exists as a token gallery).

---

## 3. Shared Primitives

Location: `app/src/components/ui/` (and `app/src/components/charts/` for SVG viz), matching existing conventions. All `"use client"` only where interactive. All copy via i18n keys. All status colors via tokens (never raw hex).

### 3.1 Evolve existing
- **`StatTile` (KpiTile)** — add optional gradient top-wash by `accent` (`primary|violet|success|warning`), keep the existing `delta`/`hint` API and tabular value. Used by both pages.
- **`StatusChip`** — keep the 5-state icon+text core; **add quadrant variants** `q1..q4` and an `accent-violet` variant (dot + label, color-blind safe). Add a `dot`-only mode for non-status pills (domain/sponsor chips).
- **`PhasePath`** — restyle to the reference stepper visual where it's used as the project phase rail (see §5).

### 3.2 New primitives
- **`PipelineStepper`** — full-width segmented stepper with `done | current | next | disabled` states, chevron connectors, count + percentage per step, keyboard-navigable, horizontal-scroll on mobile. (Heavily used in Spec B; built here so Overview can preview the impact-sizing pipeline.)
- **`MiniPipeline`** — compact N-segment stage indicator for table rows (filled = completed stages, half = current).
- **`SectionHeader` / `Card`** — thin wrappers matching the reference (`rounded-xl border bg-surface`, title + sub + right-slot). Reconcile with the existing `card.tsx`.
- **`ScoreCell`**, **`EvidenceCard`**, **`QuadrantMatrix`**, **`RightDrawer`** — **defined here, consumed in Spec B**. Build only if cheap; otherwise stub the API and defer. (Decision recorded in the implementation plan; default = build `QuadrantMatrix` now since Overview uses a quadrant viz, defer `ScoreCell`/`EvidenceCard`/`RightDrawer` to Spec B.)

### 3.3 Charts
Keep `FunnelChart`, `StackedBar`, `ImpactEffortScatter`. Restyle to: labels **outside** funnel shapes (the reference's explicit fix for overlapping labels), quadrant background tints on the scatter, primary/violet/quadrant token fills. No new chart library; existing approach (custom SVG / current lib) retained.

---

## 4. App Shell

### 4.1 TopNav (`app/src/components/top-nav.tsx`)
Restyle to the reference 64px bar:
- Gradient logo mark (`primary → accent-violet`) + "Frontier" bold / "Agentic AI Platform" muted.
- Nav links (Projects · Scan · Benchmark · Knowledge · Settings) with underline-on-active in primary.
- Right cluster: **⌘K search affordance** (visual button + kbd hint; wiring a real command palette is deferred — button is non-functional placeholder with a tooltip, or opens existing search if trivial), notifications bell, dark-mode toggle, **existing EN/中/繁 switcher preserved verbatim**, avatar.
- Sticky; hairline bottom border appears on scroll (keep existing behavior).

### 4.2 Project sub-header (`app/src/app/projects/[id]/layout.tsx` + `project-tabs.tsx`)
- Breadcrumb (`Projects › <name>`) + project status chip.
- Tab strip restyled to the reference (underline-active in primary). **Labels/routes unchanged**: Overview · Impact Sizing · Design · Opportunity · Artifacts. Reuse `PillTabs`/`ProjectTabs`, restyled.

### 4.3 Main container
Widen to the reference `max-w-[1440px] px-6 py-8` for redesigned routes (keep `/knowledge` at its current container).

---

## 5. Project Overview (`overview-client.tsx` + `_components/`)

Two-column grid at ≥1280px (`xl:grid-cols-12`), single column below.

### Left (8/12)
1. **Project header card** (`project-header.tsx`) — restyle to the reference card: domain + sponsor chips + status chip, H1 display title, inline-editable description, `Edit` + overflow (`Archive`/`Transfer`/`Export PDF` — only `Delete` wired today; others are deferred menu items or omitted). **Preserve all existing edit/delete/confirm behavior and i18n.**
2. **Agentic Roadmap swimlane** (`workflow-portfolio.tsx`) — 5 columns = the project funnel stages, cards = workflows ranked by priority, color-coded by quadrant via `StatusChip q1..q4`. Empty stages get a dashed placeholder. `+ Add workflow` in accent-violet. Bind to real `project.workflows` (status → stage mapping); empty state when none.
3. **Portfolio Analytics** (`overview-analytics.tsx`) — keep the 3 charts, restyled per §3.3, in `Card`s with `SectionHeader`.

### Right (4/12)
- **Phase Progress** — vertical stepper from `project.phaseProgress`; current phase gets a 3px primary left bar + `Continue →` link (keep existing href logic: impactSizing → candidates, design → workflow). Restyle the existing block in `overview-client.tsx`.
- **Recent activity** — feed. If no activity source exists in `sample-data`, render a tasteful `EmptyState` rather than fabricating data. (Confirm during implementation; do **not** invent fake activity.)
- **Risks & blockers** — auto-aggregated from high-risk workflow assessments if available in `sample-data`; otherwise `EmptyState`.
- **TeamEditor** — keep, restyled to a `Card`.

**Data honesty rule:** every number/feed must trace to `sample-data`. Where the reference shows data we don't have (activity feed, risk aggregation, sparklines, trends), either derive it from real fields or show an `EmptyState` — never hardcode mock arrays into production pages.

---

## 6. Portfolio Home (`projects/page.tsx` + `_components/`)

`project-list-client.tsx` restyled:
- **Header** — H1 "Projects" (display font) + portfolio sentence (`N projects across M domains · K candidates`), `+ New Project` (primary) and `Import` (ghost; non-functional placeholder if no import flow exists — confirm, else omit).
- **KPI strip** — keep the 4 `StatTile`s (Projects / Candidates / In Design / In Production) with gradient washes; clickable-filter behavior is a nice-to-have, deferred unless trivial.
- **Filter bar** — keep stage/domain/search + `SegTabs` view switcher; **add a Kanban (by stage) view** alongside Table/Cards.
- **Table** (`projects-table.tsx`) — keep health dot + progress + relative time; **add**: domain pill (`StatusChip` dot-less), `MiniPipeline` stage column, owner avatars. Row click → Overview (already wired).
- **Cards view** — keep, restyle to reference card spacing/radius.
- **Kanban view (new)** — 5 columns by stage; cards show project + sponsor + progress. Reuse `filterProjects` output, group by `currentPhase`.

---

## 7. Responsive & Motion & A11y
- Breakpoints per reference §8: ≥1440 full 12-col; 1024–1439 right rail collapses; 768–1023 single column, KPIs 2×2, pipeline scrolls; <768 stacked, tables→cards.
- Motion: 150ms hover, 220ms drawer/modal, skeletons over spinners. Respect `prefers-reduced-motion`.
- A11y (keep current standard): status chips always glyph+label; visible focus rings; full keyboard nav; charts retain accessible captions/fallbacks already present.

---

## 8. Testing
- **Unit** (Vitest): extend/keep tests for `portfolio.ts`, `overview-analytics-data.ts`, `StatusChip` (new variants), `MiniPipeline`, `PipelineStepper`, Kanban grouping. Maintain existing passing tests (`status-chip.test.tsx`, `overflow-menu.test.tsx`, `confirm-dialog.test.tsx`, `portfolio.test.ts`, `overview-analytics-data.test.ts`, `phase-path.test.tsx`).
- **Visual smoke**: `/styleguide` renders all tokens + primitives.
- **Manual**: run the app; verify Portfolio Home + Overview in EN and 中, light + dark, at the four breakpoints; verify `/knowledge` still renders (inherits theme, no layout break).
- Target: keep the suite green; ≥80% coverage on new pure logic (grouping/derivation helpers).

---

## 9. Decomposition / Follow-on Specs
- **Spec A (this doc):** Foundations (tokens, fonts, primitives) + App Shell + Portfolio Home + Project Overview.
- **Spec B:** Impact Sizing deep-dives — `PipelineStepper` in anger, L1 Readiness (`EvidenceCard`, SOP upload, Understanding Agent), L2 Sizing, L3 three-pane scoring (`ScoreCell`, `RightDrawer`), Prioritization quadrant portfolio (`QuadrantMatrix`), Gate.
- **Spec C:** Design (workflow canvas chrome) / Opportunity Scan (two-column) / Artifacts (library + preview).

Each follow-on gets its own spec → plan → implementation cycle and reuses the Spec A foundation.

---

## 10. Risks & Open Questions
- **Custom Next.js fork**: `app/AGENTS.md` warns this is a non-standard Next.js with breaking changes — consult `node_modules/next/dist/docs/` before touching layout/font wiring. Low risk for token/Tailwind/CSS changes; higher for `next/font` + root layout.
- **Token re-map fidelity**: legacy OKLCH names re-pointed to reference HSL must preserve sufficient contrast (WCAG AA) in both modes — verify on the styleguide.
- **Deferred-but-shown affordances** (⌘K, Import, Archive/Transfer/Export, clickable KPI filters): render as disabled/tooltip placeholders or omit — decided per item in the plan, never as fake-functional.
- **`/knowledge` regression**: global re-skin could surface contrast/spacing issues there; manual check included in §8.

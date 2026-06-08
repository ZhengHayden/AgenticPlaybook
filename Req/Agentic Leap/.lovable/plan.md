# Frontier Agentic AI Platform — UI Design Specification

**Scope:** Visual & interaction redesign that preserves every existing feature (Projects, Roadmap Prioritization with its 4 layers + Gate, Design, Opportunity Scan, Artifacts, Knowledge, Scan, Benchmark, Settings, EN/中 toggle). Goal: make the platform feel like a polished enterprise product (Linear × Notion × Palantir Foundry) where executives track agentic transformation at a glance and analysts drill into evidence-grade scoring.

> This document is the deliverable. Once you switch to build mode I can save it to the repo (e.g. `docs/ui-design.md`) and/or start implementing the tokens and components below.

---

## 1. Design Principles
1. **Evidence over decoration.** Every number is traceable (SOP, rubric, KPI). Tooltips and "why this score?" popovers are first-class.
2. **One spine, many depths.** A single funnel — Scan → Prioritize → Design → MVP → Production — is always visible; each screen is a zoom level on that spine.
3. **Quiet UI, loud data.** Neutral chrome; color reserved for status semantics (pass/risk/priority quadrant).
4. **Dense but breathable.** Strict typographic hierarchy, 8-pt grid, generous row padding.
5. **Progressive disclosure.** Layered scoring (L1 Readiness → L2 Sizing → L3 Detailed) collapses by default.

## 2. Visual Language

### 2.1 Color Tokens (HSL, semantic — drop into `index.css`)
| Token | Light | Use |
|---|---|---|
| `--background` | `220 20% 98%` | App canvas |
| `--surface` | `0 0% 100%` | Cards, tables |
| `--surface-muted` | `220 16% 96%` | Table header, zebra |
| `--border` | `220 13% 91%` | Hairlines |
| `--foreground` | `222 47% 11%` | Primary text |
| `--muted-foreground` | `220 9% 46%` | Secondary text |
| `--primary` | `222 89% 55%` | Brand, primary CTA, active tab |
| `--primary-deep` | `224 76% 38%` | Hover, focused step |
| `--accent-violet` | `258 90% 66%` | AI / "Add workflow" / Understanding Agent |
| `--success` / `--success-soft` | `152 60% 40%` / `150 55% 94%` | Pass, Screened, Solid |
| `--warning` / `--warning-soft` | `35 92% 50%` / `38 95% 94%` | Med, M risk |
| `--danger` / `--danger-soft` | `0 78% 55%` / `0 85% 96%` | Fail, High, H risk |
| `--info` | `199 89% 48%` | Informational chips |
| `--q1..q4` | green / blue / amber / slate | Quick Win, Sponsor & Align, Invest & Prove, Defer & Mature |

Dark mode mirrors at surfaces `222 47% 8/11/14%`.

### 2.2 Typography
- **Display H1:** Inter Tight 28/34, -0.01em, 600
- **H2 section:** Inter 18/26, 600
- **H3 card:** Inter 14/20, 600
- **Body:** Inter 14/22, 400
- **Metric numerals:** Inter Tight 32/36, 600, tabular-nums
- **Mono (scores, formulas, IDs):** JetBrains Mono 12/18
- **Eyebrow / table header:** Inter 11/14, 600, uppercase, tracking 0.08em, muted

### 2.3 Spacing, Radius, Elevation
- 8-pt grid; card padding 24; table row 56; section gap 32.
- Radius: `sm 6`, `md 10`, `lg 14`, `xl 20` (KPI tiles, modals).
- Elevation: `e1 0 1 2 rgba(15,23,42,.04)` cards · `e2 0 8 24 rgba(15,23,42,.08)` popovers · `e3 0 20 48 rgba(15,23,42,.12)` modals. Hairlines over shadows in dense areas.

### 2.4 Iconography
Lucide, 16/20, stroke 1.5. Status uses filled dots, never emojis.

## 3. App Shell

```
[A] Frontier Agentic AI Platform   Projects  Scan  Benchmark  Knowledge  Settings    EN▾ ◐ ⌘K  Avatar
─────────────────────────────────────────────────────────────────────────────────────────────────────
Projects › UT-Golden Example
Overview | Roadmap Prioritization | Design | Opportunity Scan | Artifacts
─────────────────────────────────────────────────────────────────────────────────────────────────────
[page content]
```

- 64px top bar, white, hairline bottom. Underline-on-active nav in primary blue.
- **Command palette (⌘K):** jump to any project, candidate, workflow, use case, or KB entry.
- **Right-side context drawer (480px)** replaces full-page navigation for edits (candidate, use case, KB).

## 4. Screen-by-Screen

### 4.1 Projects (Portfolio Home)
- **Header:** H1 "Projects" + portfolio sentence ("5 projects across 4 domains · 206 candidates"). Replace the flat "Roadmap Prioritization → Design → MVP → Production" string with a **horizontal pipeline stepper** showing live counts per stage. Right: `+ New Project` (primary), `Import` (ghost).
- **KPI strip:** 4 tiles (Projects, Candidates, In Design, In Production). Each has eyebrow + big tabular numeral + sub line + trend chip + optional sparkline. Tiles are clickable filters.
- **Filter bar (sticky):** segmented `Table | Cards | Kanban (by stage)`, plus Stage / Domain / Owner / Updated filters + search.
- **Table:** `●` health dot · Project (title + sponsor; secondary = parent program e.g. CLP/NEXT) · Domain pill · **Mini pipeline** for Stage (5 segments, current filled) · thin progress bar + % · owner avatars · relative time (mono) · row `⋯`. Row click → Overview.
- **Kanban view (new):** 5 columns by stage; cards show project + sponsor + gate progress.

### 4.2 Project · Overview
Two columns on ≥1280px.

**Left (8/12):**
1. **Project header card** — title, domain & sponsor chips, inline-editable description, key dates, `Edit` + `⋯` (Archive, Transfer, Export PDF).
2. **Agentic Roadmap swimlane** — 5 columns = stages; cards = workflows ranked by Priority Score, color-coded by quadrant; empty stages get a quiet dashed placeholder + hint. `+ Add workflow` in accent violet.
3. **Portfolio Analytics** — 3 charts:
   - **Roadmap Funnel** (true trapezoid, labels OUTSIDE shapes — fixes overlapping "Screened : 13" tooltip from current screen; hover shows count + drop-off %).
   - **Candidates by Function** (stacked bar Screened vs Below threshold).
   - **Impact vs Effort** (scatter with quadrant background tints; bubble size = Priority).

**Right (4/12):**
- **Phase Progress** vertical stepper, current phase gets 3px primary left bar, `Continue →` per row.
- **Recent activity** feed.
- **Risks & blockers** auto-aggregated from H risks across workflows.

### 4.3 Roadmap Prioritization (core flow)

#### 4.3.1 Sub-header
Title + discreet "Variant C — Adaptive Layered" chip. `Score by: Workflow | Use case` segmented control with `(i)` tooltip explaining dual-grain.

#### 4.3.2 Pipeline Stepper (replaces current chip row)
`Candidates (13) → Readiness (13, 100%) → Impact & Risk (13, 100%) → Prioritization → Gate`
States: done (success-soft + check), current (primary fill), next (muted dashed). Chevron connectors show micro-percentage. Keyboard navigable; collapses to horizontal-scroll on mobile.

#### 4.3.3 KPI Strip
Candidates / Screened / Not Ready / Top Priority. Top Priority shows primary numeral + tiny sparkline of last 7 runs.

#### 4.3.4 Layer 1 — Binary Readiness Screen
- Helper: "6 binary gates · Pass ≥ 5/6 (1 exception requires mitigation)" + `Tool Reference` ghost button.
- Filters: Business function ▾ + search + density toggle.
- **Table:** sticky header; DOC/DATA/VOL/OWN/QLTY/STAB icons get persistent text labels under each and `(i)` tooltips. **Score cell:** `5/6` mono + 6-segment micro-bar (green/red). Status pill: PASS / REVIEW / FAIL.
- **Expanded row:** 3-column evidence grid (row1 Process documentability / Digital data accessibility / Execution volume · row2 Owner / Quality / Stability). Each card collapsible, Yes/No chip; "No" cards tint with `--danger-soft` and surface Gap + Mitigation fields. Header right: `Upload SOP (PDF)` (ghost) + `Run Understanding Agent` (accent violet, sparkle icon, progress state).
- **Use Cases** sub-section inside expanded row: card list (title + 1-line desc + KPIs + edit/delete). `+` adds inline.

#### 4.3.5 Layer 2 — Impact Sizing & Risk
Same table pattern with sliders; add a column summary row (mean/median).

#### 4.3.6 Layer 3 — Detailed Scoring (by use case) — three-pane
```
[ Workflow tree 280 ] [ Use-case scoring canvas (fluid) ] [ Priority sidecar 320 ]
```
- **Left tree:** search + grouped accordions (Generation, T&D, Retail, Enterprise); leaves show `name · UC count · best score`; group progress chip (e.g. `4/4`); selected leaf gets 3px primary left bar.
- **Center canvas:**
  - Breadcrumb (Generation › Generation Asset Management).
  - **Use-case tab strip** (horizontally scrollable pills; trailing `+`).
  - Stacked cards: **VM**, **DDI**, **RAS**. Each: title + mono formula right-aligned, factor rows with weight pill, level chip (Significant/Meaningful/Aligned…), helper text, and a 1–5 segmented score selector. Footer with composite (`VM composite 3.00 / 5.00`).
  - DDI inputs (Binary / Multi-option / Judgment / Total steps) as equal-width cards; DDI-normalized card highlighted with `--info-soft` and contextual sentence.
  - RAS dimensions in 2×2 grid with L/M/H segmented control, painted by selection.
- **Right sidecar:** **Priority Score** (48pt tabular numeral, `floor ≥ 3` micro-label, Solid/Watch/Below chip, 1-line recommendation). **Breakdown** mono rows + formula `Priority = RAS × (1 + 0.25 × DDI)`. **History** last 5 edits.
- Sticky page footer: `Save`, `Reset`, `Tool Reference`, autosave indicator.

#### 4.3.7 Prioritization (Portfolio view)
- Title `Prioritized Use-Case Portfolio` + autosave `Saved ✓` + export `PDF` / `XLSX`.
- **Quadrant matrix viz (2×2 with bubbles)** above the list; selecting a quadrant filters the table.
- **Table columns:** `#` · Use case · Workflow · **Quadrant pill** (color + dot — Quick Win / Sponsor & Align / Invest & Prove / Defer & Mature) · Priority (mono, color when ≥ floor) · **Solution** pill (RPA / Workflow / Copilot / Agent + eligibility tag).
- Expanded row: full description, KPIs, solution dropdown, owner, target gate date, comments.
- Bulk-action toolbar: Promote to Design, Change quadrant, Reassign owner.

#### 4.3.8 Gate
- Title `Phase 1 → Phase 2 Gate`; right `Reset to defaults`.
- Criteria rows: big checkbox + label + helper rationale on line 2 + hover `⋯`. Completed: strikethrough + success check.
- Inline `+ Add criterion…` at bottom.
- Footer: `2 / 5 criteria passed` with circular progress + `Mark Phase Complete` (primary; disabled until threshold; subtle pulse when ready).

### 4.4 Design
Canvas workflow editor (nodes/edges) + right properties panel. Inner tabs: Blueprint · Data Contracts · Guardrails · Evaluation · Cost Model. Top-right `Promote to MVP →`.

### 4.5 Opportunity Scan
Two-column: Sources (uploaded docs, interviews, system inventories) and Detected Opportunities (cards with citation chip, suggested workflow, "Add as Candidate"). Filters: confidence slider, source type, function, sector.

### 4.6 Artifacts
Document library: filter by type/gate/phase/owner; right-side preview.

### 4.7 Knowledge — codified KB across industry (upgraded to first-class explorer)
- **Left rail taxonomy tree:** Sector › Sub-sector › Value Chain Step, multi-select with counts.
- **Toolbar:** search, filters (Maturity, Solution type, Vendor, Geography), saved views, `+ Submit case`.
- **Card grid (3-up @ 1440):** thumb, title, sector + value-chain chips, **Maturity badge** (Pilot / Production / Scaled), KPI highlight, source count, `Use as template`.
- **Detail drawer:** problem, agentic approach, tools/agents, data deps, KPIs, references. Buttons: `Clone as Candidate` (drops into a project), `Add to comparison`, `Cite`.
- **Compare mode:** up to 4 cases side-by-side as a matrix.

### 4.8 Scan & Benchmark
- **Scan:** org-level capability scan (data readiness, tooling, governance) — radar + recommendations.
- **Benchmark:** percentile vs sector cohort across maturity dimensions; opt-in data-sharing badge.

### 4.9 Settings
Workspace · Members & Roles · SSO · Scoring Rubrics (editable weight presets) · Variants (A/B/C/Adaptive Layered) · Integrations · Audit Log · Billing.

## 5. Reusable Components
- **PipelineStepper** — pills + chevron connectors; done/current/next/disabled states; keyboard nav; responsive scroll.
- **KpiTile** — eyebrow + numeral + sub + trend + optional sparkline; clickable filter.
- **StatusChip** — pass/review/fail/screened/not-ready/info/priority-q1..q4; always dot + label (color-blind safe).
- **ScoreCell** — mono numeral + segmented micro-bar + formula tooltip.
- **EvidenceCard** — collapsible; Yes/No chip; "No" reveals Gap + Mitigation in danger-soft.
- **QuadrantMatrix** — tinted 2×2 with bubbles; lasso-select bulk-filters table.
- **Funnel** — custom SVG (labels OUTSIDE shapes; fixes current overlap bug).
- **RightDrawer** — 480px; sticky header/footer; replaces page navigation for edits.
- **EmptyState** — mono line-art + one-sentence what+why + one primary CTA.

## 6. Interaction & Motion
150ms ease-out hover; 220ms drawer/modal; spring (240/28) for stepper transitions. Skeletons over spinners. Optimistic score edits + toast with undo. Shortcuts: `⌘S` save, `Esc` close drawer, `/` focus search, `g p` Projects, `g k` Knowledge.

## 7. Accessibility
WCAG 2.2 AA. Status chips always pair glyph + label. Full keyboard nav with visible focus ring. Charts have data-table fallback toggle. EN/中 toggle preserved; all new copy via i18n keys.

## 8. Responsive
| Breakpoint | Layout |
|---|---|
| ≥1440 | Full 12-col, drawers float |
| 1024–1439 | 12-col, right rail collapses, drawers push |
| 768–1023 | Single column, KPIs 2×2, pipeline scrolls |
| <768 | Stacked; pipeline = vertical timeline; tables = cards |

## 9. Feature-Preservation Map (nothing removed)
| Existing | New home |
|---|---|
| Projects list (table/cards) | §4.1 + Kanban |
| Stage pipeline string | §4.1 header stepper |
| KPI counters | §4.1 / §4.3.3 |
| Overview workflows + Add workflow | §4.2 swimlane |
| Roadmap funnel / Candidates by function / Impact-vs-Effort | §4.2 Portfolio Analytics |
| Phase Progress + Continue | §4.2 right rail |
| Score by Workflow / Use case | §4.3.1 |
| Candidates → Readiness → Sizing → Prioritization → Gate | §4.3.2 stepper + §4.3.4–4.3.8 |
| L1 binary gates + evidence + SOP upload + Understanding Agent | §4.3.4 |
| Use-case CRUD inside readiness | §4.3.4 expanded row |
| L3 VM / DDI / RAS detailed scoring | §4.3.6 three-pane |
| Priority Score + breakdown + formula | §4.3.6 right sidecar |
| Prioritized Use-Case Portfolio + PDF/XLSX | §4.3.7 + matrix |
| Phase gate criteria + custom add + Mark Phase Complete | §4.3.8 |
| Knowledge base | §4.7 explorer |
| Scan / Benchmark / Settings / EN-中 | §4.8 / §4.9 / app shell |

## 10. Implementation Notes
- Tokens → `index.css` (§2.1) and `tailwind.config.ts` `extend.colors` as `hsl(var(--token))`.
- shadcn/ui-compatible new components: `PipelineStepper`, `KpiTile`, `ScoreCell`, `EvidenceCard`, `QuadrantMatrix`, `Funnel`, `RightDrawer`.
- Charts: Recharts; **funnel = custom SVG** (Recharts funnel mislabels — root cause of the screenshot overlap).
- Tables: TanStack Table v8 — sticky header, resize, density toggle, virtualization (needed for Knowledge + Prioritization).
- Autosave middleware so `Saved ✓` is consistent across pages.
- i18n keys for all new copy (EN / 中).

---

**Next step:** switch to build mode and I'll (a) save this as `docs/ui-design.md`, (b) install the token set + tailwind extension, and (c) build the reusable components in §5 so screens can adopt them incrementally without losing any feature.

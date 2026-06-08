> A design refinement brief for an enterprise SaaS platform that orchestrates the discovery, prioritization, design, and validation of Agentic AI use cases across business functions (R&D, Procurement, Manufacturing, Supply Chain, Marketing, etc.).

---

## 1. Product Context

**What the product does**  
The Frontier Agentic AI Platform is an internal enterprise tool for **portfolio-level governance of Agentic AI transformation**. It helps transformation offices, CoEs, and business owners:

1. **Scan** existing business workflows (SOPs, ELT scans) for agentic-AI opportunities.
2. **Score readiness** of each candidate workflow against a binary 6-criteria gate (Layer 1), then quantitative impact/risk (Layer 2).
3. **Prioritize a roadmap** through staged gates: Candidates → Readiness Check → Impact & Risk → Priority Ranking → Decision Gate.
4. **Design agents** (archetypes: Orchestrator, Executor, Analyst, Retriever, Evaluator; interaction modes; A2A patterns).
5. **Maintain a Knowledge Base** of canonical use cases per sector / industry / company (e.g., Telecom → Vodafone Idea → Churn Shield Platform).
6. **Manage artifacts & evidence** (playbooks, SOPs, validation status, references).

**Primary users**

- AI Transformation Lead / Chief AI Officer (portfolio view)
- Business Function Owners (R&D, Procurement, Supply Chain leads)
- Solution Architects / Agent Designers
- Validators / Auditors

**Primary jobs-to-be-done**

- "Which candidate workflows are _ready_ to be agentified next quarter?"
- "Show me, per business function, what is in flight and what is blocked."
- "Capture evidence and validation status against this use case."
- "Compare maturity across companies and sectors in our knowledge base."

---

## 2. Current State — Honest Assessment

Strengths in the existing screens:

- Information architecture is sound: clear 5-tab top nav (Projects / Scan / Baseline / Knowledge Base / Settings) and a logical 5-stage roadmap funnel.
- Bilingual support (EN / 简体 / 繁體) is already first-class.
- Domain language is precise (Layer 1 binary gating, evidence cards, archetypes).

Weaknesses to fix:

- **Visual hierarchy is flat.** Everything is body-weight text on white; primary metrics, status, and actions compete equally with labels.
- **Color is used decoratively, not semantically.** Pastel pill backgrounds (Roadmap / Design / MVP / Production) don't map to stage state; status colors (PASS green, L1 fail red) are correct but inconsistent in weight.
- **Density is uneven.** Project cards are airy; the Layer-1 evidence grid is cramped with 6 evenly-weighted textareas competing for attention.
- **No "at-a-glance" state.** A portfolio lead opening the Projects page cannot tell in 2 seconds _which project needs attention_.
- **Edit / Delete affordances are loud and red** in the top-right of every detail panel — destructive actions should not have the same visual weight as the primary CTA.
- **Knowledge Base browse → use-case detail is modal-heavy** with 5 nested tabs (概览/影响/智能体设计/知识资产/佐证); deep content lives behind clicks.
- **No data visualization.** A portfolio platform with funnel stages, scores, and KPIs has zero charts.

---

## 3. Design Principles (the north star)

1. **Enterprise calm, not consumer flash.** Linear / Vercel / Attio level of restraint. No gradients, no glass, no decorative illustration.
2. **Semantic color, not decorative color.** Color exists to communicate _state_ (ready / blocked / in-progress / validated) — never to differentiate sections.
3. **Density with breathing room.** This is a portfolio tool used 6+ hours/day; favor information density over whitespace, but with strong typographic hierarchy.
4. **Progressive disclosure.** Summary → detail → evidence. Never show 6 empty textareas before the user has decided to fill them.
5. **Bilingual-native.** Every component must look correct in EN, 简体中文, and 繁體中文 — including line-height, button padding, and table column widths.
6. **Keyboard-first.** Power users should be able to score readiness, advance stages, and open use cases without a mouse.

---

## 4. Visual Design System

### 4.1 Color tokens (OKLCH, semantic only)

```
/* Neutrals — the canvas */
--bg-canvas:        oklch(0.985 0.002 250)   /* page background */
--bg-surface:       oklch(1     0     0  )   /* card surface */
--bg-subtle:        oklch(0.970 0.004 250)   /* hover, table zebra */
--border-subtle:    oklch(0.925 0.006 250)
--border-strong:    oklch(0.870 0.010 250)
--text-primary:     oklch(0.205 0.020 255)
--text-secondary:   oklch(0.470 0.020 255)
--text-tertiary:    oklch(0.620 0.015 255)

/* Brand — used sparingly, primary actions only */
--brand:            oklch(0.520 0.180 255)   /* deep enterprise blue */
--brand-hover:      oklch(0.460 0.180 255)
--brand-subtle-bg:  oklch(0.965 0.025 255)
--brand-subtle-fg:  oklch(0.420 0.150 255)

/* Semantic — state, never decoration */
--state-ready:      oklch(0.620 0.150 155)   /* emerald — passed, validated */
--state-ready-bg:   oklch(0.965 0.035 155)
--state-warn:       oklch(0.720 0.150 75 )   /* amber — partial, attention */
--state-warn-bg:    oklch(0.975 0.040 80 )
--state-block:      oklch(0.580 0.200 25 )   /* red — failed L1, blocked */
--state-block-bg:   oklch(0.970 0.030 25 )
--state-info:       oklch(0.560 0.130 230)   /* blue — in progress */
--state-info-bg:    oklch(0.965 0.025 230)
--state-neutral:    oklch(0.620 0.015 255)   /* grey — not started */
```

> Rule: stage chips (Roadmap / Design / MVP / Production) must **not** each have their own hue. They share `--state-neutral` until they have data, then derive their color from progress %.

### 4.2 Typography

- **Latin:** Inter (UI) / Inter Display (numbers & headings ≥20px) — `font-feature-settings: "ss01","cv11","tnum"`.
- **CJK:** PingFang SC / PingFang TC fallback to Noto Sans SC/TC. Match Inter's optical size.
- **Numerals always tabular** (`tnum`) for tables, scores, dates.

Scale (8 steps, no in-between):

```
Display   28 / 36   600
H1        22 / 30   600
H2        18 / 26   600
H3        15 / 22   600
Body      14 / 20   400
Body-md   14 / 20   500
Small     13 / 18   400
Caption   12 / 16   500   uppercase tracking 0.04em
```

### 4.3 Spacing, radius, elevation

- **Spacing:** 4-pt grid (4, 8, 12, 16, 24, 32, 48, 64).
- **Radius:** `--r-sm 6 / --r-md 8 / --r-lg 10 / --r-pill 999`. Never larger than 10 for cards.
- **Elevation:** one shadow only — `0 1px 2px oklch(0.2 0.02 255 / 0.06), 0 1px 1px oklch(0.2 0.02 255 / 0.04)`. Modals get a second tier. No drop shadows on buttons.
- **Borders over shadows** for card delimitation on the canvas.

### 4.4 Iconography

- Lucide, 16/20 px, stroke 1.5. Icons always paired with text in primary nav and actions; standalone only in dense table rows.

---

## 5. Component-Level Refinements

### 5.1 Top navigation

- Left: logo + product name in 14/600.
- Center: tabs as **underline-on-active** (not pill background). 2-px brand underline, no fill.
- Right: language switcher collapses to a single `EN | 中` toggle with a dropdown for SC/TC.
- Sticky on scroll with a 1-px bottom border that appears only after scroll > 0.

### 5.2 Projects index (portfolio view) — _redesign_

Replace the current card grid with a **hybrid: KPI strip + filterable table**.

```
┌────────────────────────────────────────────────────────────────────────────┐
│  Portfolio                                            [+ New Project]      │
│  6 projects · 247 candidates · 12 in design · 1 in production              │
├────────────────────────────────────────────────────────────────────────────┤
│  [ Stage: All ▾ ] [ Domain: All ▾ ] [ Owner: All ▾ ]      🔍 Search ___    │
├──┬──────────────────────────┬──────────┬────────────┬──────────┬──────────┤
│  │ Project                  │ Domain   │ Stage      │ Progress │ Updated  │
├──┼──────────────────────────┼──────────┼────────────┼──────────┼──────────┤
│●│ NEXT ELT                  │ Supply…  │ Roadmap    │ ██░░ 14% │ 5h ago   │
│●│ ODM Agentic Transform.    │ Other    │ Design     │ ███░ 31% │ 15h ago  │
│●│ NEXT-MFG-P4               │ Mfg.     │ Roadmap    │ ██░░ 11% │ 4d ago   │
└──┴──────────────────────────┴──────────┴────────────┴──────────┴──────────┘
```

- Leading colored dot = stage state (semantic).
- Progress is a single thin bar with the **next gate** as a vertical tick.
- A secondary "Cards" view toggle keeps the existing layout for executive presentations.

### 5.3 Roadmap funnel (stage stepper)

- Replace the chevron blocks with a **horizontal segmented stepper**.
- Active step: brand fill, white text. Completed: brand text on subtle bg with check icon. Future: text-tertiary, no fill.
- Count badges (`43`, `6`, `6`…) shown as inline `tabular-nums` small caps after the label, not as separate pills.
- Add an inline conversion-rate annotation between steps (e.g., `43 → 6 (14%)`).

### 5.4 Layer-1 Readiness table

This is the most important screen of the product.

- Convert the 6 criteria from full text headers to **icon + abbreviation** with hover/click for full Chinese label and the `i` tooltip definition.
- Each criterion cell is a single 24-px tap target: `✓ green-bg` / `✕ red-bg` / `–` neutral. Score column on the right shows `5/6` in tabular display weight.
- **Inline expansion** (not modal): clicking a row expands it inline to show the 6 evidence cards in a 3×2 grid, but **only the cells that need evidence** (i.e., the failed one) are pre-opened; the rest are collapsed accordions labeled `证据 · Yes` to reduce visual noise.
- The `运行流程理解智能体` (Run Process Understanding Agent) button is the primary CTA inside the expanded row, styled brand-fill — currently it's the same weight as `上传 SOP`.

### 5.5 Knowledge Base browser

- Three-column layout: **left filters / center grouped list / right preview panel**.
- Replace modal-with-tabs (概览 / 影响 / 智能体设计 / 知识资产 / 佐证) with a **right-side slide-over panel** that uses a single scrollable canvas with sticky section headers — no nested tabs. Tabs hide content; the user wants to scan a use case end-to-end.
- Use-case status chip uses the same state palette as roadmap (Ready / Partial / Not Validated → emerald / amber / neutral).
- The 11 / 0 / 0 / 4 KPI row at the top becomes 4 small stat tiles with delta-from-last-week.

### 5.6 Use-case detail (impact / agent design / evidence)

- The two-column "Impact KPI" / "Business Goals" textareas: replace freeform textareas with **structured rows** — each KPI is a row of `metric name | baseline | target | unit | source`. Free-text mode kept as a "Notes" tab.
- Agent Design tab: render the selected archetypes as a small **agent topology diagram** (nodes + A2A edges) rather than five disconnected pill toggles. Use `react-flow` or a static SVG generated from the selection.
- Evidence references become a sortable list with source-type icons (vendor, analyst, internal).

### 5.7 Destructive actions

- Move `删除 / Delete` out of the header. Place under a `⋯` overflow menu next to `编辑`. Confirm modal required, with project name re-type for top-level deletes.
- `编辑` button stays brand-fill primary.

### 5.8 Empty states

Every list (Knowledge Assets, Evidence, References) needs a designed empty state: 1 line of guidance + the primary action button. Today the empty state for "Validation" is just an unlabeled textarea — disorienting.

### 5.9 Data visualization (new)

Add to the Project overview tab:

- **Funnel chart** for the 5 roadmap stages with conversion %.
- **Bar chart** of candidates by business function, stacked by status (Screened / L1 Failed / Pending).
- **Impact vs. Effort scatter** for the Layer-2 prioritization step (this is implied by the product but never drawn today).

Charts: Recharts or Visx. Colors from the semantic palette only. No legends with more than 4 entries; otherwise convert to small-multiples.

---

## 6. Bilingual & I18n Rules

- Reserve **+30% line length** for Chinese → English expansions in buttons and chips. Never use fixed-width buttons.
- For mixed CJK + Latin (e.g., `Layer 1 · 二元准备度筛选`), use a thin middot `·` with 4 px breathing space, never a hyphen.
- Numbers, percentages, and units stay Latin even in Chinese mode (`5/6`, `97%`, `~Rs 1,350 Cr/yr`).
- Status chips should be **icon + text**, not text-only — the icon survives any translation drift.

---

## 7. Interaction & Motion

- Transitions only on state change: 120 ms ease-out for hover, 180 ms for panels, 240 ms for slide-overs.
- No spring animations. No parallax. No skeleton shimmer — use a static muted placeholder.
- Focus rings: 2 px brand at 2 px offset, always visible (no `:focus-visible` for keyboard-only — accessibility default).

---

## 8. Accessibility

- WCAG 2.2 AA contrast minimums on every token combination above.
- All interactive elements ≥ 32 px hit target (40 px on touch).
- Color is never the only carrier of state — pair with icon and/or text.
- Tables get `<caption>`, `scope="col"`, and a visually-hidden row summary for screen readers.

---

## 9. Deliverables for Claude (refinement scope)

When handing this to Claude, ask it to deliver, in this order:

1. `styles.css` / Tailwind theme tokens implementing §4 exactly.
2. Refactored **TopNav**, **StageStepper**, **ProjectsTable**, **ReadinessTable**, **KnowledgeBrowser**, **UseCaseSlideOver** components.
3. New **EmptyState**, **StatTile**, **StatusChip**, **ConfirmDestructive** primitives.
4. Three Recharts wrappers: `<FunnelChart/>`, `<StackedBar/>`, `<ImpactEffortScatter/>`.
5. A `/styleguide` route rendering every token, component, and state for QA.
6. Storybook-style screenshots in both EN and 简体中文 to verify §6.

---

## 10. Out of Scope (intentionally)

- Dark mode (enterprise users overwhelmingly run light; revisit after v1).
- Mobile layout (desktop tool; tablet landscape ≥ 1024 px is the minimum viewport).
- Real-time collaboration cursors.
- Marketing/landing visuals.
# SLDS-Aligned Design System Refresh — Design

**Date:** 2026-06-07
**Status:** Approved for planning
**Scope:** Shared design system (tokens + core primitives + new PageHeader). Per-screen rework is explicitly out of scope for this pass.

## Goal

Make the app read as a professional, enterprise-grade product by leaning toward the Salesforce Lightning Design System (SLDS) visual language. The current "gameboard" style is playful and consumer-grade: heavy rounding, soft shadows, hover lift, an indigo/violet gradient brand, and a 12-color rainbow function palette. SLDS reads "professional" by doing the opposite — restrained single-accent color, tight geometry, flat surfaces, higher information density, and standardized page headers.

## Decisions (locked)

| Decision | Choice |
|---|---|
| Intensity | Strong SLDS lean |
| Scope (this pass) | Shared design system first |
| Dark mode | Light-first; keep `dark:` variants compiling but do not optimize |
| Function palette | Collapse decorative rainbow to neutral |
| Brand color | Switch to SLDS blue `#0176D3` |

**Color that encodes data meaning is retained.** Only the decorative function-identity rainbow (`FN_PALETTE`) collapses to neutral. Heatmap level colors (high/medium/low) and true status colors stay, consistent with SLDS reserving color for status/meaning.

## Non-Goals (YAGNI)

- No per-screen layout rework (Projects, Scan, Knowledge, Impact-Sizing screens keep their structure for now).
- No dark-mode redesign.
- No new data-table component library — the existing list/grid layouts stay; only their styling inherits from refreshed primitives.
- No live Salesforce integration; SLDS is a visual reference only.

## Design Tokens

Defined once in `app/src/app/globals.css` under `@theme` (Tailwind v4). Components reference these instead of hard-coded `indigo-*` / `rounded-2xl` values.

### Brand (SLDS blue ramp)

| Token | Hex | Use |
|---|---|---|
| `--color-brand-50` | `#EAF5FE` | active-nav tint, selected-row background |
| `--color-brand-100` | `#CFE9FE` | hover tint, subtle fills |
| `--color-brand-600` | `#0176D3` | primary buttons, links, active accents |
| `--color-brand-700` | `#014486` | primary hover/pressed |
| `--color-brand-800` | `#032D60` | darkest accent / focus ring base |

Focus ring: brand-based (`ring-2` with a brand-300-equivalent `#1B96FF`).

### Neutrals & surfaces

| Token | Value | Use |
|---|---|---|
| Page background | flat `#F3F3F3` (replaces slate-50→100 gradient) | `body` |
| Card surface | `#FFFFFF` | cards, panels |
| Border (hairline) | `slate-200 #E2E8F0` | card/section borders |
| Border (hover) | `slate-300` | interactive hover |

### Geometry & elevation

| Token | Now | Proposed |
|---|---|---|
| `--radius-card` | `rounded-2xl` (16px) | `6px` (≈ `rounded-md`) |
| `--radius-control` | `rounded-lg` (8px) | `4px` (≈ `rounded`) |
| Card shadow | `shadow-sm` + `.card-lift` hover | hairline border + `shadow-sm`, **no lift** |

The `.card-lift` class is removed (or neutralized to a border-color transition).

### Type scale

| Role | Now | Proposed |
|---|---|---|
| Page title (h1) | `text-2xl` | `text-xl font-semibold` |
| Section / card label | mixed | `text-xs font-semibold uppercase tracking-wide text-slate-500` |
| Body | ~14–16px | 13px base |
| Numerics | tabular | keep `tabular-nums` |

## Component Changes (before → after)

All components live under `app/src/components/`.

### `ui/card.tsx`
- `rounded-2xl` → `rounded-md`.
- `CardHeader`: remove `bg-gradient-to-r from-slate-50 to-white`; use flat white with a hairline bottom border and the uppercase-label type treatment.
- `Card`: remove `lift` prop behavior (keep prop as no-op or delete and update callers); hover communicated via border-color only.

### `ui/button.tsx`
- `primary` → brand-600 bg, brand-700 hover, white text, brand focus ring.
- `danger` stays rose; `secondary`/`ghost` keep structure, radius `rounded-lg` → `rounded`.
- Reduce shadow weight.

### `ui/badge.tsx`
- **`FN_PALETTE` collapses to neutral.** `IdBadge` default becomes neutral slate (`bg-slate-600` text-white, or `bg-slate-100 text-slate-700 border`); a single brand variant for the selected/active state.
- `fnPaletteColor(index)` retained as a function for API compatibility but returns a neutral token (avoids breaking the many call sites in one pass); a follow-up can remove call sites.
- `Badge` (status pill): neutral default; `ok` stays emerald. SLDS-style — color only for state.

### `ui/stat-card.tsx`
- Keep left accent bar; recolor to brand/neutral.
- `rounded-xl` → `rounded-md`, flat border, tighter padding.

### `ui/seg-tabs.tsx` & `ui/pill-tabs.tsx`
- `PillTabs` (route-level nav) → SLDS **underline tabs**: bottom-border accent on active, no pill background.
- `SegTabs` (in-page view toggle) → flattened segmented control: `rounded-xl` → `rounded`, active uses brand text + white surface, subtler container.

### `top-nav.tsx`
- Logo gradient tile → flat brand-600 tile (or keep mark but align to brand).
- Active link: brand-50 tint + brand-700 text; radius `rounded-lg` → `rounded`.
- Keep sticky + hairline bottom border; drop any gradient feel.

### `app/layout.tsx`
- `body` background: replace slate gradient with flat `#F3F3F3`; base font-size 13px; keep `dark:` classes intact.

### New: `ui/page-header.tsx`
SLDS signature element. Standardizes the top of every screen.

```
interface PageHeaderProps {
  icon?: ReactNode;          // small brand-tinted icon tile
  title: ReactNode;
  subtitle?: ReactNode;
  actions?: ReactNode;       // right-aligned buttons
  highlights?: Array<{ label: ReactNode; value: ReactNode }>; // optional key/value strip
}
```

Layout: `[icon] Title / subtitle ............ [actions]` with an optional highlights row beneath (label-over-value chips, hairline separators). Replaces hand-rolled `mb-6 flex justify-between` headers. Not yet wired into every screen this pass — ships as an available primitive plus one reference adoption (Projects list header) to prove the pattern.

## Architecture / Data Flow

Purely presentational. No data, state, or API changes. Tokens flow CSS → Tailwind utilities → components. Each primitive remains independently testable (props in, markup out).

## Testing

- Existing component/unit tests must continue to pass; update snapshot/class assertions where they pin removed classes (e.g. `rounded-2xl`, `bg-indigo-600`, `card-lift`).
- Add a render test for the new `PageHeader` (renders title, subtitle, actions, highlights).
- Visual/manual check of: TopNav, Projects list (PageHeader adoption), a Card-heavy screen, a SegTabs/PillTabs screen — light theme.
- Maintain ≥80% coverage on changed/added components.

## Risks & Mitigations

- **Wide blast radius:** every screen inherits primitive changes. Mitigation: scope limited to primitives + tokens; verify a representative set of screens; keep `fnPaletteColor` API stable to avoid editing all call sites at once.
- **Lost function wayfinding:** collapsing `FN_PALETTE` removes per-function color cues. Mitigation: retain meaning-bearing colors (heatmap levels, status); function identity now leans on labels/IDs and layout grouping.
- **Test churn:** class-based assertions will break. Mitigation: update tests alongside each primitive.

## Rollout

1. Tokens in `globals.css` + `body` in `layout.tsx`.
2. Refactor primitives one file at a time (card, button, badge, stat-card, tabs, top-nav), updating tests per file.
3. Add `PageHeader` + adopt on Projects list as reference.
4. Manual light-theme pass across representative screens.
5. Follow-up (separate pass): per-screen layout density + broader `PageHeader` adoption + `FN_PALETTE` call-site cleanup.

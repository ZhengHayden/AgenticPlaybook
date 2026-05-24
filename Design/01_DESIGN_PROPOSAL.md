# Agentic Workflow Playbook — Design Proposal

**Status**: Approved v1 — proceeding to V0 implementation
**Date**: 2026-05-23
**Scope**: Phase 1 (Impact Sizing) + Phase 2 (Design) only. Phases 3–4 (MVP, Production) deferred.

## Approved Decisions

| Question | Decision |
|---|---|
| App name | **Agentic Workflow Playbook** |
| Hosting | **Local only** (`npm run dev` on laptop; no Vercel for now) |
| Users | **Single user** (no auth in V1) |
| AI providers | Claude (default), OpenAI, Gemini — user-selectable per project |
| Claude auth | Uses laptop's existing Anthropic credentials via `ANTHROPIC_API_KEY` env (no key entry needed in UI) |
| OpenAI/Gemini auth | User enters API key + model name in **Settings → Providers** page; stored encrypted in local SQLite |
| AI cache scope | **Per-project only** — no cross-project corpus |
| Decision gate criteria | **Editable per project** — sensible defaults provided, user can add/remove/rename/check |

---

## 1. Product Vision

An online application that walks a 2-person consulting team (functional consultant + agentic architect) through the **Impact Sizing** and **Design** phases of an agentic-workflow engagement, producing client-ready deliverables in 1 week (Phase 1) and 2 weeks (Phase 2).

The app is **not** a generic project tracker. It is an **opinionated methodology engine** — each screen embeds a specific framework from the proposals, captures the inputs that framework requires, and emits the artifacts the framework prescribes.

### Core promises

| Promise | Mechanism |
|---|---|
| **Repeatable** | Every input is structured; every output uses a template; rubrics are versioned. |
| **Teachable** | The 5 archetypes, 3 interaction modes, 6 A2A patterns, 2x2 funnel are surfaced *inline* with selection criteria, not hidden in a separate doc. |
| **Decision-gate-driven** | Each phase ends in a gate screen with explicit pass/fail criteria; users cannot mark "done" without passing. |
| **AI-assisted, not AI-decided** | LLM drafts scores, archetype suggestions, and narrative — consultant always reviews and overrides. Every AI suggestion shows its rationale. |
| **Bilingual** | Per-project language toggle (EN / 中文) affects UI labels, LLM prompts, and exported deliverables. |

---

## 2. Methodology Variants Supported

The app implements **all three** Impact Sizing proposals and **all three** Design proposals as selectable variants per project.

### Phase 1 — Impact Sizing variants

| Variant | When to use | UI shape |
|---|---|---|
| **A — Sequential Precision** | Small candidate pool (<8), high-stakes ranking needed | Full 4-dimension scoring table → 2x2 classification → ranked portfolio |
| **B — Funnel-First Triage** | Large candidate pool (15+), speed-critical | Rapid intake → 2x2 funnel triage → streamlined 3-dim scoring on Q1/Q2 only |
| **C — Adaptive Layered** *(default)* | Standard engagement, 8–15 candidates | Layer 1 binary screen → Layer 2 2x2 funnel → Layer 3 detailed scoring on survivors |

### Phase 2 — Design variants

| Variant | When to use | UI shape |
|---|---|---|
| **A — Taxonomy-First** *(default)* | Standard workflow, multi-agent likely | Step-by-step classification grids: archetype × interaction mode × A2A pattern |
| **B — Decision-Tree Navigator** | Simple workflow, novice consultant | Branching wizard with complexity gate; decision log is the artifact |
| **C — Sprint Dual-Track** | Time-constrained, collaborative team | Parallel discovery + design tracks with 3 sync ceremonies |

The methodology variant is chosen at project creation and frozen for that project (changing methodology mid-engagement loses data integrity).

---

## 3. Information Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Top nav: [Projects]  [Knowledge]  [Settings]    🌐 EN/中文 │
└─────────────────────────────────────────────────────────────┘
       │
       ├── /projects                    Project list (cards)
       │
       ├── /projects/new                Create wizard
       │       ├─ Client + domain
       │       ├─ Phase 1 methodology variant
       │       ├─ Phase 2 methodology variant
       │       └─ Language
       │
       ├── /projects/[id]               Project workspace shell
       │       │
       │       ├── /overview            Stage tracker, gates, team
       │       │
       │       ├── /impact-sizing       Phase 1 workspace
       │       │       ├─ /candidates       Candidate intake table
       │       │       ├─ /screen           Layer 1 (variant C only)
       │       │       ├─ /funnel           2x2 funnel visual
       │       │       ├─ /scoring          Scoring rubric
       │       │       ├─ /portfolio        Ranked priority view
       │       │       └─ /gate             Phase 1 decision gate
       │       │
       │       ├── /design              Phase 2 workspace
       │       │       ├─ /workflow         Workflow & step mapping
       │       │       ├─ /complexity       Complexity gate (variant B)
       │       │       ├─ /archetypes       Step-to-archetype assignment
       │       │       ├─ /interactions     Interaction mode assignment
       │       │       ├─ /orchestration    A2A pattern design
       │       │       ├─ /hitl             HITL integration
       │       │       ├─ /architecture     Assembled architecture doc
       │       │       └─ /gate             Phase 2 decision gate
       │       │
       │       └── /artifacts           Generated deliverables (PDF/MD/XLSX)
       │
       └── /knowledge                   Methodology reference library
               ├── /archetypes              5 agent archetypes
               ├── /interactions            3 interaction modes
               ├── /a2a                     6 A2A patterns
               ├── /hitl                    HITL pattern catalog
               └── /rubrics                 Scoring rubrics + weights
```

---

## 4. Data Model (sketch)

Persisted in SQLite via Drizzle ORM. Tables:

```
projects                  id, name, client, domain, language, p1_variant, p2_variant, status, created_at
project_members           project_id, user_id, role (consultant | architect | reviewer)

# Phase 1
candidates                id, project_id, name, description, source_system, est_volume, current_pain
screen_results            candidate_id, q1..q6 (binary), passed (computed)
funnel_positions          candidate_id, determinism (1-5), readiness (1-5), quadrant (Q1..Q4), notes
scoring_results           candidate_id, variant, dim_scores (jsonb), composite_score, weights_used
recommendations           candidate_id, action (proceed | proceed_with_prework | conditional | deprioritize), rationale

# Phase 2
workflows                 id, project_id, candidate_id (link to chosen P1 candidate), description
workflow_steps            id, workflow_id, seq, name, description, inputs, outputs, decision_points
archetype_assignments     step_id, archetype (orchestrator|executor|analyst|retriever|evaluator), rationale
interaction_assignments   step_id, mode (autopilot|copilot|guardian), risk_tier, rationale
a2a_patterns              workflow_id, pattern (sequential|parallel|hierarchical|negotiation|broadcast|pipeline), config
hitl_checkpoints          step_id, type, trigger, sla, escalation
architecture_docs         project_id, version, content_md, generated_at

# Decision gates
gate_results              project_id, phase, criterion_id, passed, evidence, reviewer, reviewed_at

# AI suggestions
ai_suggestions            id, project_id, scope_type, scope_id, model, prompt_hash, suggestion (jsonb), accepted, overridden_to

# Artifacts
exports                   id, project_id, type (md|pdf|xlsx), phase, file_path, generated_at
```

---

## 5. Tech Stack

| Layer | Choice | Rationale |
|---|---|---|
| **Framework** | Next.js 15 (App Router) + TypeScript | User preference; SSR for shareable links; server actions for forms |
| **UI** | Tailwind CSS + shadcn/ui | Production-grade defaults, low styling overhead |
| **Charts/Viz** | Recharts (2x2 funnel, scoring radar, ranking bars) | Native React, simple API |
| **Drag-drop** | dnd-kit | For 2x2 funnel candidate placement, workflow step reordering |
| **Forms** | React Hook Form + Zod | Schema-validated input, matches our boundary-validation rule |
| **DB** | SQLite + Drizzle ORM | Zero-setup local file; easy to swap to Postgres later |
| **AI** | Provider abstraction — Anthropic SDK (Claude, default, auth via `ANTHROPIC_API_KEY` env) + OpenAI SDK + Google Generative AI SDK (Gemini); user supplies OpenAI/Gemini key+model in Settings | Per-project provider choice; project-scoped suggestion cache |
| **PDF export** | `@react-pdf/renderer` or Playwright print-to-PDF | Deliverable artifacts |
| **XLSX export** | `exceljs` | Portfolio rankings + scoring matrix |
| **i18n** | `next-intl` | Locale-aware routes, JSON dictionaries per phase |
| **Auth** | None in V1 (single-user local) | Multi-user deferred |
| **Deployment** | Local — `npm run dev` on laptop | Vercel deferred until V4+ |

### Repo layout

```
/Users/Hayden_Zheng/CodeRepo/00_Playbook/
├── Req/                        # existing requirements (unchanged)
├── Design/                     # this folder — proposal + mockup
│   ├── 01_DESIGN_PROPOSAL.md
│   └── 02_MOCKUP_WIREFRAMES.md
└── app/                        # the Next.js app (created after approval)
    ├── src/
    │   ├── app/                # App Router routes
    │   ├── components/         # shadcn + custom
    │   ├── lib/
    │   │   ├── db/             # Drizzle schema + migrations
    │   │   ├── methodology/    # variant-specific logic (pure functions)
    │   │   │   ├── impact-sizing/{variantA,variantB,variantC}.ts
    │   │   │   └── design/{variantA,variantB,variantC}.ts
    │   │   ├── ai/             # LLM provider abstraction + prompts
    │   │   ├── exports/        # PDF, MD, XLSX generators
    │   │   └── i18n/           # locale dictionaries
    │   └── content/            # taxonomy definitions (single source of truth)
    │       ├── archetypes.ts
    │       ├── interactions.ts
    │       ├── a2a-patterns.ts
    │       └── hitl-patterns.ts
    ├── tests/
    ├── package.json
    └── README.md
```

---

## 6. AI Assist (where and how)

The LLM is invoked at **specific, bounded** points — never as a free-form chat.

| Touchpoint | Input | Output | UX |
|---|---|---|---|
| Candidate description → first-draft scores | Workflow description + volume + pain | Suggested 1-5 score per scoring dimension | "Apply suggestions" button with diff preview |
| Workflow step → archetype suggestion | Step name + description + I/O | Top archetype + 2 alternatives with rationale | Inline chip with reasoning popover |
| Risk profile → interaction mode | Step + failure severity + reversibility | Recommended mode | One-click apply |
| Architecture review | Full architecture doc | Critique against 7 quality criteria | Annotation overlay |
| Deliverable narrative | Structured data | Executive summary in chosen language | Markdown editor with track-changes |

Every AI suggestion is **persisted with its prompt hash** so we can audit, cache, and re-run with newer models without re-prompting.

---

## 7. Exports & Deliverables

| Phase | Artifact | Format | Trigger |
|---|---|---|---|
| Phase 1 | Prioritized Workflow Portfolio | PDF + XLSX | Gate passed |
| Phase 1 | 2x2 Funnel poster | PDF (one-pager) | On demand |
| Phase 1 | Methodology log (rubric, weights, AI suggestions accepted/overridden) | MD | On demand |
| Phase 2 | Agent Architecture Document | PDF + MD | Gate passed |
| Phase 2 | Step-by-step Classification Matrix | XLSX | On demand |
| Phase 2 | MVP Handoff Package (architecture + acceptance criteria + risk register) | ZIP (MD + XLSX + PDF) | Gate passed |

---

## 8. Decision Gates (editable per project)

Each phase has a **default** set of gate criteria. On project creation, defaults are copied into the project's gate table. From the gate screen, the user can:

- ☑ Check / uncheck criterion (provides evidence note)
- ✎ Rename criterion text
- ➕ Add a custom criterion
- 🗑 Delete a criterion (with confirmation)
- ⤺ Reset to defaults

### Phase 1 → Phase 2 Gate — Defaults
- At least one candidate classified Q1 OR Q2 with composite score ≥ defined threshold
- Top-3 ranking has inter-criterion variance documented (no single-dimension dominance)
- Risk classification recommendations approved by sponsor
- Deliverable PDF generated and timestamped
- Top candidate selected for Design phase

### Phase 2 → MVP Gate — Defaults
- Every workflow step has exactly one archetype assigned
- Every step has exactly one interaction mode assigned
- A2A pattern selected with dependency rationale
- Acceptance criteria written in Given/When/Then for each agent
- HITL checkpoints have SLA + escalation path
- Architecture passes technical review checklist (7 items)

Gate screens **disable** the "mark complete" button until **all checked criteria pass** (criteria the user has deleted no longer block). Each criterion links to the screen where the supporting evidence lives.

---

## 9. Implementation Phasing

| Sprint | Scope | Output |
|---|---|---|
| **V0 — Mockup (3 days)** | Static screens, no DB, hard-coded sample data, no AI calls | Clickable Next.js prototype demonstrating IA and key interactions |
| **V1 — Phase 1 working (1 week)** | Impact Sizing variant C end-to-end, real DB, AI assist on scoring, PDF export | One consultant can run Impact Sizing for one project |
| **V2 — Phase 2 working (1.5 weeks)** | Design variant A end-to-end + knowledge library | Full handoff package for one project |
| **V3 — Methodology variants (1 week)** | Add Impact Sizing variants A, B + Design variants B, C | Project-level methodology selection |
| **V4 — Polish (1 week)** | Bilingual, exports polished, multi-user auth, deploy to Vercel | Production-ready for first real engagement |

V0 mockup is the immediate next step after this proposal is approved.

---

## 10. Settings → Providers Page (new)

Local-only single-user app, but we still need a place to configure non-default providers.

```
Settings › Providers
─────────────────────
Default provider:  ◉ Claude (Anthropic)    ○ OpenAI    ○ Gemini

Claude — uses ANTHROPIC_API_KEY from laptop environment.        ✓ detected
   Model: ▼ claude-opus-4-7   claude-sonnet-4-6   claude-haiku-4-5

OpenAI — paste key to enable
   API key: {sk-···································}     [Save]
   Model:   {gpt-4o-mini} (free-text — user enters model name)

Gemini — paste key to enable
   API key: {AIza···································}    [Save]
   Model:   {gemini-2.5-pro} (free-text)
```

Stored locally in SQLite, AES-encrypted at rest with a key derived from a machine-local secret in `~/.awp/secret`.

## 11. V0 Implementation Plan (next 3 days)

| Day | Deliverable |
|---|---|
| 1 | Next.js 15 scaffolding · Tailwind + shadcn · top nav + bilingual toggle · Drizzle/SQLite · Settings/Providers page · Project list (hard-coded sample) |
| 2 | New Project wizard · Project overview · Phase 1 candidate intake (no AI yet) · 2x2 funnel drag-drop · Scoring rubric form |
| 3 | Phase 2 workflow mapping · Archetype/Interaction assignment grids · Architecture doc auto-assembly · Editable gate checklists · Knowledge library (5 archetypes / 3 modes / 6 A2A) |

After V0 review with user → V1 wires up real AI calls and PDF/XLSX export.

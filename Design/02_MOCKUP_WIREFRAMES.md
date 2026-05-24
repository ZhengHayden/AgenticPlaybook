# Agentic Workflow Playbook — Mockup Wireframes

**Companion to**: `01_DESIGN_PROPOSAL.md`
**Style**: ASCII wireframes — to be rendered as clickable Next.js screens in V0.

Conventions: `[Button]` = action button · `{field}` = input · `▼` = dropdown · `█` = filled progress · `░` = empty progress · `◉/○` = radio · `☑/☐` = checkbox

---

## A. Project List — `/projects`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agentic Workflow Playbook                       [Projects] Knowledge  EN▼ │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Projects                                              [+ New Project]    │
│   ───────────────────────────────────────────────────────────              │
│                                                                             │
│   ┌─────────────────────────────────┐  ┌─────────────────────────────────┐ │
│   │ ACME Finance — AP Automation    │  │ Globex Supply Chain — Returns   │ │
│   │ Domain: Finance                 │  │ Domain: Supply Chain            │ │
│   │ Phase: Impact Sizing  ███░ 78%  │  │ Phase: Design        █░░░ 22%   │ │
│   │ Variant: Adaptive C / Taxonomy A│  │ Variant: Funnel B / Tree B      │ │
│   │ Updated: 2 hours ago            │  │ Updated: yesterday              │ │
│   │                       [Open →]  │  │                       [Open →]  │ │
│   └─────────────────────────────────┘  └─────────────────────────────────┘ │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## B. New Project Wizard — `/projects/new`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│   New Project — Step 1 of 3: Engagement Basics                              │
│   ───────────────────────────────────────────────────────────              │
│                                                                             │
│   Project name   {ACME Finance — AP Automation                          }  │
│   Client         {ACME Corp                                              } │
│   Domain         ▼ Finance                                                 │
│   Language       ◉ English   ○ 中文   ○ Bilingual                          │
│                                                                             │
│                                          [Cancel]   [Next: Methodology →]  │
└─────────────────────────────────────────────────────────────────────────────┘

──── Step 2 ────

┌─────────────────────────────────────────────────────────────────────────────┐
│   New Project — Step 2 of 3: Methodology                                    │
│   ───────────────────────────────────────────────────────────              │
│                                                                             │
│   Impact Sizing Variant                                                     │
│   ○ A — Sequential Precision     Full 4-dim scoring, then 2x2              │
│   ○ B — Funnel-First Triage      2x2 first, score Q1/Q2 only               │
│   ◉ C — Adaptive Layered  ⭐     3-layer progressive (Recommended)         │
│                                                                             │
│   Design Variant                                                            │
│   ◉ A — Taxonomy-First  ⭐       Classification grids (Recommended)        │
│   ○ B — Decision-Tree            Branching wizard with complexity gate     │
│   ○ C — Sprint Dual-Track        Parallel discovery + design tracks        │
│                                                                             │
│                                          [← Back]    [Next: Team →]        │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## C. Project Overview — `/projects/[id]/overview`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACME Finance — AP Automation              Lang: EN ⇄ 中文   ⋯ Settings   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Overview]  [Impact Sizing]  [Design]  [Artifacts]                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Phase Progress                                                            │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │ 1. Impact Sizing  ████████░░  78%   [Gate: 3/5 passed]   [Continue→] │ │
│   │ 2. Design          ░░░░░░░░░░   0%   Locked until Phase 1 gate       │ │
│   │ 3. MVP             ░░░░░░░░░░   0%   (deferred)                      │ │
│   │ 4. Production      ░░░░░░░░░░   0%   (deferred)                      │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   Team                                          Recent Activity             │
│   • Hayden — Functional Consultant              • Scored AP Invoice match  │
│   • (unassigned) — Agentic Architect            • Funnel: 3 in Q1, 2 in Q2 │
│                                                 • AI suggestion accepted   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## D. Phase 1 — Candidate Intake — `/projects/[id]/impact-sizing/candidates`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  ACME Finance · Impact Sizing                                Variant C ⓘ   │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Candidates]  Screen  Funnel  Scoring  Portfolio  Gate                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   Candidate Workflows (8)                       [+ Add]  [⇪ Import CSV]    │
│                                                                             │
│   ┌──────────────────────────────────────────────────────────────────────┐ │
│   │ # │ Name                       │ Volume/mo │ Pain  │ Status          │ │
│   ├───┼────────────────────────────┼───────────┼───────┼─────────────────┤ │
│   │ 1 │ AP Invoice Match           │ 12,000    │ High  │ ✓ Screened     │ │
│   │ 2 │ Vendor Onboarding KYC      │  1,200    │ Med   │ ⏳ Screening    │ │
│   │ 3 │ Expense Audit              │  8,500    │ High  │ ✓ Screened     │ │
│   │ 4 │ Travel Expense Approval    │  6,000    │ Low   │ ✗ Failed L1    │ │
│   │ 5 │ Bank Reconciliation        │ 30,000    │ High  │ — Pending      │ │
│   └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│   💡 AI Assist: Click [Suggest from description] on any row to draft       │
│      Layer-1 answers and an initial readiness/determinism estimate.        │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Add Candidate side-panel (drawer)

```
┌──────────────────────────────────────────────┐
│  Add Candidate Workflow                  [×] │
├──────────────────────────────────────────────┤
│  Name           {AP Invoice Match         }  │
│  Description    {3-way match of PO, GRN,  }  │
│                 {and invoice, exception   }  │
│                 {handling routed to AP    }  │
│                 {analyst                  }  │
│  Source system  {SAP S/4 + Coupa          }  │
│  Volume/month   {12000}                      │
│  Current pain   ◉ High  ○ Med  ○ Low         │
│                                              │
│  [🤖 AI: Suggest L1 + funnel from desc]      │
│                                              │
│              [Cancel]    [Save Candidate]    │
└──────────────────────────────────────────────┘
```

---

## E. Phase 1 — Layer 1 Binary Screen (Variant C) — `/impact-sizing/screen`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 1: Binary Readiness Screen                Variant C — Adaptive      │
│                                                                             │
│  6 binary gates · Pass threshold: 4 of 6 Yes                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│         AP Invoice  Vendor KYC  Expense    Travel       Bank Recon         │
│         Match       Onboarding  Audit      Approval                        │
│  ─────────────────────────────────────────────────────────────             │
│  Process clarity        ✓          ✓         ✓          ✗          ✓        │
│  Data access            ✓          ✗         ✓          ✓          ✓        │
│  Volume threshold       ✓          ✗         ✓          ✓          ✓        │
│  Sponsor identified     ✓          ✓         ✓          ✗          ✓        │
│  Outcome measurable     ✓          ✓         ✓          ✗          ✓        │
│  Timeline acceptable    ✓          ✓         ✗          ✗          ✓        │
│  ─────────────────────────────────────────────────────────────             │
│  Score                 6/6        4/6       5/6        2/6        6/6       │
│  Status                PASS       PASS      PASS       FAIL       PASS      │
│                                                                             │
│  4 of 5 advance to Layer 2 (2x2 Funnel)              [Continue to Funnel →]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## F. Phase 1 — 2x2 Funnel — `/impact-sizing/funnel`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 2: 2x2 Prioritization Funnel                                         │
│  Axes: Output Determinism × Organizational Readiness                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│              Output Determinism                                             │
│      Low ←──────────────────────→ High                                      │
│   H ┌─────────────────┬─────────────────┐                                   │
│   i │   Q3  HITL-Path │   Q1  Proceed   │   Q1: AP Invoice Match  ⬤        │
│   g │                 │                 │       Expense Audit     ⬤        │
│   h │     (empty)     │  ⬤  ⬤  ⬤      │       Bank Recon        ⬤        │
│   ↑ │                 │                 │                                    │
│   R ├─────────────────┼─────────────────┤   Q2: Vendor KYC        ⬤        │
│   e │   Q4  Defer     │   Q2 Pre-Work   │                                    │
│   a │                 │                 │   Drag candidates to reposition.   │
│   d │     (empty)     │      ⬤         │                                    │
│   ↓ │                 │                 │   AI initial placement shown      │
│   L └─────────────────┴─────────────────┘   with 📍 marker.                 │
│   o                                                                          │
│                                                                             │
│  Selected: AP Invoice Match                                                 │
│    Determinism rationale: {3-way match is rule-based, dollar tolerances }  │
│    Readiness rationale:   {AP lead is sponsor; SAP team allocated 0.5FTE}  │
│                                                                             │
│  [Suggest with AI 🤖]                          [Continue to Scoring →]      │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## G. Phase 1 — Detailed Scoring (Layer 3) — `/impact-sizing/scoring`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Layer 3: Detailed Scoring  ·  Q1/Q2 candidates only                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Editing: AP Invoice Match                                          [Next ▶]│
│                                                                             │
│  Value Magnitude (VM)                          AI suggests            Used  │
│    Cost savings      {★★★★☆ 4}                  ⬤ 4 (rationale)    [✓]   │
│    Quality           {★★★★★ 5}                  ⬤ 4               [override]│
│    Speed             {★★★★☆ 4}                  ⬤ 5               [override]│
│    Strategy          {★★★☆☆ 3}                  ⬤ 3               [✓]   │
│  ─ VM composite: 4.0                                                        │
│                                                                             │
│  Agentic Complexity (AC) — Decision Density Index                           │
│    Decision count    {12}    Tool diversity {6}    Planning need  {Med}    │
│  ─ AC composite: 3.6                                                        │
│                                                                             │
│  Implementation Velocity (IV)                                               │
│    Data readiness    {★★★★☆ 4}     APIs available  {★★★★☆ 4}              │
│    Team capacity     {★★★☆☆ 3}                                             │
│  ─ IV composite: 3.7                                                        │
│                                                                             │
│  Risk-Adjusted Return (RAR)                                                 │
│    Risk penalty      {1.2}        Computed: (VM × IV) / (1 + RP) = 6.73    │
│                                                                             │
│  ╭──────────────────────────────────────────╮                              │
│  │  Priority Score = RAR × (1 + 0.25 × AC') │   = 8.21  ●●●●●●●●░░         │
│  ╰──────────────────────────────────────────╯                              │
│                                                                             │
│  Other Q1/Q2 candidates: 3                              [Save & Next ▶]    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## H. Phase 1 — Portfolio — `/impact-sizing/portfolio`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Prioritized Workflow Portfolio                          [Export PDF] [XLSX]│
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   #│ Workflow            │ Quadrant │ Priority │ Recommendation             │
│  ──┼─────────────────────┼──────────┼──────────┼───────────────────────────│
│   1│ AP Invoice Match    │   Q1     │   8.21   │ Proceed to Design          │
│   2│ Bank Reconciliation │   Q1     │   7.85   │ Proceed to Design          │
│   3│ Expense Audit       │   Q1     │   6.92   │ Proceed to Design          │
│   4│ Vendor KYC          │   Q2     │   5.10   │ Proceed w/ change pre-work │
│  ──┼─────────────────────┼──────────┼──────────┼───────────────────────────│
│   5│ Travel Approval     │ FAIL L1  │   —      │ Deprioritize — revisit Q3 │
│                                                                             │
│  Visualization:                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │   AP Invoice Match     ████████░░  8.21                              │  │
│  │   Bank Reconciliation  ███████░░░  7.85                              │  │
│  │   Expense Audit        ██████░░░░  6.92                              │  │
│  │   Vendor KYC           █████░░░░░  5.10                              │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│                                                  [Proceed to Phase 1 Gate →]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## I. Phase 1 — Decision Gate — `/impact-sizing/gate`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Phase 1 → Phase 2 Decision Gate                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ☑  At least one Q1 candidate with Priority ≥ 6.0                          │
│       AP Invoice Match (8.21)  ✓                                            │
│                                                                             │
│  ☑  Top-3 ranking variance documented                                       │
│       View variance report ↗                                                │
│                                                                             │
│  ☑  Risk classifications approved by sponsor                                │
│       Approved by Jane (CFO) on 2026-05-22  ✓                              │
│                                                                             │
│  ☐  Deliverable PDF generated and timestamped                               │
│       → Generate now                                                        │
│                                                                             │
│  ☐  Top candidate selected for Design phase                                 │
│       → Choose top candidate                                                │
│                                                                             │
│  ───────────────────────────────────────────────────────────               │
│  3 of 5 criteria passed.                              [Mark Phase Complete] │
│                                                       (disabled)            │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## J. Phase 2 — Workflow Mapping — `/design/workflow`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Design · Workflow: AP Invoice Match                  Variant A — Taxonomy │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Workflow]  Archetypes  Interactions  Orchestration  HITL  Architecture   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Workflow Steps (drag to reorder)                          [+ Add Step]    │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ ⠿ 1. Receive invoice from vendor portal                              │ │
│  │    Inputs: PDF/EDI invoice    Outputs: parsed line items             │ │
│  │    Decision points: 1   Volume: 12k/mo                               │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ ⠿ 2. Match against PO and GRN                                        │ │
│  │    Inputs: invoice, PO, GRN   Outputs: match-result + variance       │ │
│  │    Decision points: 3                                                 │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ ⠿ 3. Route exceptions to AP analyst                                  │ │
│  ├──────────────────────────────────────────────────────────────────────┤ │
│  │ ⠿ 4. Post matched invoices to GL                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  💡 AI: I detected 4 steps from the candidate description. Review & edit.   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## K. Phase 2 — Archetype Assignment — `/design/archetypes`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Step → Archetype Classification                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step                              Archetype           AI suggests          │
│  ──────────────────────────────────────────────────────────────────────    │
│  1. Receive invoice from portal    ▼ Retriever         ⬤ Retriever       ✓ │
│  2. Match PO/GRN                   ▼ Executor          ⬤ Executor        ✓ │
│  3. Route exceptions               ▼ Orchestrator      ⬤ Orchestrator    ✓ │
│  4. Post to GL                     ▼ Executor          ⬤ Executor        ✓ │
│                                                                             │
│  ───────────────────────────────────────────────────────────               │
│  ╭── Selected: Step 3 ──────────────────────────────────────────╮          │
│  │  Archetype: Orchestrator                                      │          │
│  │  Selection rationale (auto-drafted, editable):                │          │
│  │    "Step coordinates routing to one of 4 analyst queues       │          │
│  │     based on variance type and dollar amount; maintains       │          │
│  │     state across analyst response."                           │          │
│  │                                                               │          │
│  │  Why not Executor? Coordination > single action.              │          │
│  │  Why not Analyst?  Decision is routing, not synthesis.        │          │
│  ╰───────────────────────────────────────────────────────────────╯          │
│                                                                             │
│  [Knowledge: 5 Archetypes Reference ↗]            [Continue to Interactions]│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## L. Phase 2 — Interaction Mode — `/design/interactions`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Step → Human-Agent Interaction Mode                                        │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Step                  Failure cost  Reversible  Mode       Rationale       │
│  ──────────────────────────────────────────────────────────────────────    │
│  1. Receive invoice    Low           Yes         Autopilot  high-volume    │
│  2. Match PO/GRN       Med           Yes         Autopilot  rule-based     │
│  3. Route exceptions   Med           Yes         Co-Pilot   analyst review │
│  4. Post to GL         High          No          Guardian   human sign-off │
│                                                                             │
│  Visual: Risk → Mode mapping                                                │
│   ┌──── Failure Severity ────┐                                              │
│   │ Low      Med       High  │                                              │
│   │  ○        ◉         ●   │  ● = Guardian (human decides)                │
│   │  ○        ●         ●   │  ◉ = Co-Pilot (human refines)                │
│   │  ●        ●         ●   │  ○ = Autopilot (agent executes)              │
│   │   ↑ Irreversible ↑      │                                              │
│   └─────────────────────────┘                                               │
│                                                                             │
│  💡 Recommend Guardian for any High-severity + Irreversible combination.    │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## M. Phase 2 — A2A Orchestration — `/design/orchestration`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agent-to-Agent Orchestration Pattern                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Pattern selection                                                          │
│  ○ Sequential    ◉ Pipeline    ○ Parallel    ○ Hierarchical                │
│  ○ Negotiation   ○ Broadcast                                                │
│                                                                             │
│  Why Pipeline? Dependency analysis shows step output → next step input,    │
│  with branching only at step 3 (exception routing).                         │
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │                                                                      │ │
│  │  [Retriever] ─→ [Executor] ─→ [Orchestrator] ─┬─→ [Executor] (post)│ │
│  │   Step 1         Step 2         Step 3        │                     │ │
│  │                                                └─→ Human Analyst    │ │
│  │                                                    (Co-Pilot)       │ │
│  │                                                                      │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [Knowledge: A2A Pattern Catalog ↗]                  [Continue to HITL →]   │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## N. Phase 2 — Architecture Document — `/design/architecture`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Agent Architecture Document  ·  v0.3 draft                  [Export PDF] │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  Auto-assembled from prior steps. Edit narrative; structured data is locked.│
│                                                                             │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │ # AP Invoice Match — Agent Architecture                              │ │
│  │                                                                      │ │
│  │ ## 1. Executive Summary                  [📝 AI: regenerate]         │ │
│  │ {narrative editable area}                                            │ │
│  │                                                                      │ │
│  │ ## 2. Workflow Architecture                                          │ │
│  │ {auto-generated diagram from §M}                                     │ │
│  │                                                                      │ │
│  │ ## 3. Agent Specifications                                           │ │
│  │ ### Agent 1: Invoice Retriever                                       │ │
│  │   Archetype: Retriever · Mode: Autopilot                             │ │
│  │   Capabilities: {auto-drafted from step 1}                           │ │
│  │   Tools: {editable list}                                             │ │
│  │   Acceptance criteria (Given/When/Then):                             │ │
│  │     Given: invoice PDF/EDI on vendor portal                          │ │
│  │     When:  retriever polls or receives webhook                       │ │
│  │     Then:  parsed line items written to staging table                │ │
│  │ ### Agent 2: ... (continues)                                         │ │
│  │                                                                      │ │
│  │ ## 4. Orchestration Design                                           │ │
│  │ ## 5. HITL Integration                                               │ │
│  │ ## 6. Acceptance Criteria                                            │ │
│  │ ## 7. MVP Scope                                                      │ │
│  │ ## 8. Risk Register                                                  │ │
│  │ ## 9. Handoff Package                                                │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│                                                                             │
│  [🤖 AI: Review against 7 quality criteria]    [Proceed to Phase 2 Gate →] │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## O. Knowledge Library — `/knowledge/archetypes`

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  Knowledge › Agent Archetypes                                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  [Archetypes]  Interactions  A2A Patterns  HITL  Rubrics                    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   The 5 Agent Archetypes                                                    │
│                                                                             │
│   ┌─────────────┐  Orchestrator                                             │
│   │      🎯     │  Decomposes tasks, routes work, maintains state           │
│   │ Orchestrator│  Selection trigger: coordinates multiple sub-tasks        │
│   └─────────────┘  Example: AP exception router                             │
│                                                                             │
│   ┌─────────────┐  Executor                                                 │
│   │      ⚙️     │  Performs specific operations via tools/APIs              │
│   │  Executor   │  Selection trigger: well-defined action with clear I/O    │
│   └─────────────┘  Example: GL posting agent                                │
│                                                                             │
│   (3 more cards: Analyst, Retriever, Evaluator)                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Bilingual Toggle Behaviour

When the user toggles **EN ⇄ 中文** in the top nav:

1. All static UI labels swap instantly (via `next-intl` dictionary).
2. AI-generated artifacts already saved keep their original language until regenerated.
3. The "Regenerate in {target language}" button appears on every AI artifact card.
4. Exports respect the project's default language; the toggle only affects the live view.

---

## V0 Mockup Scope (clickable but not functional)

For the first sprint (3 days), render screens **A, B, C, D, F, H, J, K, N, O** with:
- Hard-coded sample data (ACME Finance project pre-populated)
- Working navigation between screens
- Drag-and-drop on the 2x2 funnel (state lost on refresh — V0 only)
- Language toggle wired to static labels
- No DB, no AI calls, no exports

This proves the IA and the methodology fit before we invest in persistence and AI integration.

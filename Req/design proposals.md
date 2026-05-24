# Proposals: Design Methodology

## Evidence Synthesis

The research reveals strong convergence across major vendors (Google, IBM, Microsoft, AWS) on agent archetypes, orchestration patterns, and HITL integration. Five structural roles recur consistently. Six A2A patterns are well-documented with clear selection criteria. Three HITL tiers map cleanly to risk levels. Design sprint methodologies from adjacent fields (GV Design Sprint, architecture decision sprints) provide proven process templates adaptable to agent design.

Key tensions to resolve:
- **Taxonomy granularity**: IBM uses 3 reasoning categories (Reactive/Deliberative/Cognitive) while role-based taxonomies use 5 structural roles. These are orthogonal dimensions, not competing schemes.
- **Process duration**: Full design sprints are 5 phases, but the 2-week constraint requires compression. The architecture sprint variant (Week 1: discover + design, Week 2: prototype + validate) fits.
- **Practitioner accessibility**: Selection criteria must be concrete enough for functional consultants without requiring deep technical understanding of agent internals.

## Surprising Findings

1. **Microsoft's "start simple" principle** challenges the assumption that multi-agent design is always needed. Many workflows may be served by a single agent with tools — the methodology must include a complexity gate that prevents over-engineering.
2. **Domain patterns are highly predictable** — regulated industries consistently favor case-oriented + HITL patterns while high-volume domains favor autonomous + event-driven. This suggests the methodology can include domain-specific "fast start" templates.
3. **Google's A2A Protocol** enables cross-vendor agent interoperability, suggesting the design methodology should be framework-agnostic at the architecture level, with implementation patterns as a separate concern.

## Creative Exploration

- Could the design method be structured as a decision tree rather than a linear process? Each branching point narrows the design space.
- What if the archetype taxonomy includes a "complexity escalation ladder" — start with simplest viable agent type, add complexity only when validated as necessary?
- The HITL patterns could be expressed as "trust contracts" between human and agent, making the interaction design more tangible for business stakeholders.

---

## Proposal A: Taxonomy-First Design Method

**Category**: Structured Framework

### Summary

A methodology that leads with definitive taxonomies — five agent archetypes, three Agent-Human interaction modes, and six A2A orchestration patterns — as the primary design instruments. The design process is a systematic classification exercise: practitioners map each workflow step to the appropriate archetype, assign an interaction mode, select orchestration patterns, then assemble the architecture from these building blocks.

### Core Idea

The design methodology is fundamentally a **classification problem**. Given well-defined taxonomies with clear selection criteria, a functional consultant can "design" an agent architecture by systematically classifying each workflow step along three dimensions:

1. **What type of agent?** (5 archetypes with selection heuristics)
2. **How does it interact with humans?** (3 interaction modes with risk-based selection)
3. **How do agents coordinate?** (6 orchestration patterns with dependency-based selection)

### The Five Agent Archetypes

| # | Archetype | Core Function | Selection Trigger |
|---|-----------|--------------|-------------------|
| 1 | Orchestrator | Decomposes tasks, routes work, maintains state | Step requires coordination of multiple sub-tasks |
| 2 | Executor | Performs specific operations via tools/APIs | Step is a well-defined action with clear I/O |
| 3 | Analyst | Synthesizes information, makes recommendations | Step requires reasoning over multiple inputs |
| 4 | Retriever | Provides context from knowledge bases | Step requires finding/surfacing relevant information |
| 5 | Evaluator | Validates outputs, enforces quality/safety | Step requires judgment on quality or compliance |

### The Three Interaction Modes

| # | Mode | Agent Autonomy | Selection Criterion |
|---|------|----------------|---------------------|
| 1 | Autopilot | Full (execute + log) | Low-risk, reversible, high-volume |
| 2 | Co-Pilot | Shared (agent proposes, human refines) | Medium-risk, judgment-dependent |
| 3 | Guardian | Limited (agent prepares, human decides) | High-risk, irreversible, regulated |

### Design Process (6 Steps, 10 Days)

1. Workflow Mapping (Days 1-2)
2. Step Classification — assign archetypes (Days 3-4)
3. Interaction Mode Assignment — risk-based (Days 4-5)
4. Orchestration Design — dependency-based (Days 5-7)
5. Architecture Assembly (Days 7-8)
6. Validation & Decision Gate (Days 9-10)

### Strengths

- Highly teachable: taxonomies learned in hours
- Repeatable: same workflow yields similar designs across practitioners
- Complete coverage: every step gets classified
- Auditable: decisions traceable to criteria

### Risks

- May be too rigid for novel workflows
- Could lead to over-engineering if complexity gate is absent

### Feasibility

~75 person-hours (40 consultant + 35 architect) within 2-week sprint.

---

## Proposal B: Decision-Tree Design Navigator

**Category**: Decision Support Tool

### Summary

A methodology structured as branching decision trees that progressively narrow the design space. Rather than presenting all taxonomies upfront, the method guides practitioners through sequential decision points — each answer eliminates options and converges on the appropriate architecture.

### Core Idea

Design is navigation, not classification. The methodology provides a **decision tree** where each node asks a concrete question, and each answer eliminates inappropriate patterns. The architecture emerges from the path taken.

### Key Innovation: Complexity Gate

```
Q1: Can the entire workflow be handled by a single agent with tools?
├── YES → Single-Agent Design (skip multi-agent complexity)
└── NO → Multi-Agent Design (proceed to full trees)
```

This implements Microsoft's "start at lowest complexity" principle as a hard gate, potentially saving 3-4 days for simple workflows.

### Decision Trees

- **Tree A (Agent Type)**: Routes based on primary step function
- **Tree B (Interaction Mode)**: Routes based on worst plausible failure severity
- **Tree C (Orchestration)**: Routes based on dependency structure

### Design Process (5 Phases)

1. Workflow Discovery (Days 1-3)
2. Navigate Complexity Gate (Day 3)
3. Step-by-Step Tree Navigation (Days 4-7)
4. Architecture Synthesis (Days 7-9)
5. Validation Sprint (Days 9-10)

### Primary Deliverable: Decision Log

A traceable record of each question asked, answer given, and design implication — making the architecture fully auditable.

### Strengths

- Progressive disclosure: practitioners see only relevant options
- Built-in complexity gate prevents over-engineering
- Self-documenting: decision log IS the rationale
- Stakeholder-friendly: business leaders can follow the tree
- Fast-track for simple workflows

### Risks

- Decision trees may not cover all edge cases
- Binary branching may oversimplify nuanced decisions

### Feasibility

~65 person-hours (35 consultant + 30 architect) — faster due to fast-tracking simple cases.

---

## Proposal C: Sprint-Adapted Dual-Track Process

**Category**: Process Methodology

### Summary

A methodology adapting the design sprint format into a dual-track 2-week process: Track 1 (Discovery, consultant-led) runs in parallel with Track 2 (Design, architect-led), with structured synchronization points. Both tracks converge at defined integration ceremonies.

### Core Idea

The 2-week constraint is binding. Rather than sequential discovery-then-design, run them in **parallel dual tracks**:
- **Discovery Track** (consultant): Workflow understanding, stakeholder alignment, risk mapping, acceptance criteria
- **Design Track** (architect): Architecture patterns, agent specifications, orchestration, testability

Three "integration ceremonies" synchronize the tracks.

### Sprint Structure

- **SYNC 1** (Day 3): Discovery shares findings + risk. Design shares architecture hypothesis. Joint complexity decision.
- **SYNC 2** (Day 7): Discovery shares acceptance criteria. Design shares architecture v1. Gap analysis.
- **SYNC 3 / Gate** (Day 10): Full architecture walkthrough. Go/No-Go for MVP.

### Design Deliverable Template

1. Executive Summary
2. Workflow Architecture (visual + step-by-step)
3. Agent Specifications (per agent)
4. Orchestration Design
5. HITL Integration
6. Acceptance Criteria (Given/When/Then)
7. MVP Scope
8. Risk Register
9. Handoff Package

### Strengths

- Time-efficient: parallel tracks maximize the 2-week window
- Clear role ownership reduces confusion
- Structured handoffs prevent track divergence
- Stakeholder-inclusive throughout
- Comprehensive deliverable template

### Risks

- Requires two skilled practitioners simultaneously
- Parallel tracks may diverge if syncs are skipped
- At the 80 person-hour limit (tight)

### Feasibility

~80 person-hours (45 consultant + 35 architect) — at the 2-week limit. Single-track variant available for resource-constrained engagements (+3-5 days).

# H1: Impact Sizing Framework + Prioritization Funnel

**Parent**: `agentic-workflow-delivery/problem.md`

## Context

The parent problem seeks a complete delivery methodology for agentic workflow transformations. Impact Sizing is Phase 0 (Week 0) — the critical first gate where candidate workflows are identified, assessed for agentic potential, and prioritized. Beyond basic prioritization, this phase must also **front-load downstream risk assessment** by screening for two key failure modes that would otherwise surface late in the engagement:

1. **Output determinism risk** (proxy for H3.1): Can correctness be objectively defined for this workflow's outputs?
2. **Organizational readiness risk** (proxy for H4.1): Is the process owner/team receptive and the integration landscape manageable?

This dual function — scoring + risk screening — is what distinguishes this from a generic process assessment. The scoring ranks candidates; the funnel determines *how* (or whether) to proceed with each.

## Core Question

**What framework systematically identifies, scores, and prioritizes candidate workflows for agentic transformation within a single-week assessment by a 2-person team — including a 2x2 prioritization funnel that screens for downstream delivery risk — producing a defensible priority ranking with conditional entry paths that prevent committing to processes destined to fail in MVP or Production?**

## Scope

**In Scope**:
- Value stream mapping methodology adapted for agentic potential assessment
- Quantitative scoring dimensions and weighting model for workflow prioritization
- **2x2 prioritization funnel** with two axes:
  - Axis 1: Output Determinism (can correctness be defined? → screens for H3.1 risk)
  - Axis 2: Organizational Readiness (is adoption feasible? → screens for H4.1 risk)
- Conditional entry paths per quadrant (proceed / proceed with pre-work / deprioritize)
- Minimum viable data collection protocol (what to gather from client in Week 0)
- Deliverable template: prioritized workflow portfolio with risk classification
- Decision gate criteria: what determines "proceed to Design" vs. "proceed with conditions" vs. "deprioritize"
- Applicability testing across process domains (finance, supply chain, customer service)

**Out of Scope**:
- Detailed process mapping (that is Design phase work)
- Agent architecture decisions (handled by sibling: design-methodology)
- Technology selection or platform assessment
- Business case financial modeling (belongs in client-specific commercial discussions)
- Full change readiness program design (Production phase); only the *screening indicator* is in scope here

## Success Criteria

- [ ] Scoring framework produces consistent top-3 rankings when applied by different assessors to the same workflow set (inter-rater reliability)
- [ ] Framework distinguishes between high-potential and low-potential workflows with at least 3 clearly differentiated scoring dimensions
- [ ] 2x2 funnel correctly classifies processes into 4 quadrants with actionable entry conditions per quadrant
- [ ] Funnel axes are assessable within Week 0 timeframe (indicators are observable, not requiring deep discovery)
- [ ] Quadrant assignment correlates with actual downstream success/failure (validated against known automation deployments)
- [ ] Complete assessment (scoring + funnel) is executable within 80 person-hours (2 people x 5 days)
- [ ] Framework applies without structural modification to workflows in finance, supply chain, and customer service domains
- [ ] Deliverable template includes both the priority ranking AND the risk classification with conditional recommendations

## Sub-Hypotheses to Test

### H1.1: Agentic value stream mapping produces better prioritization than generic process assessment
- **Test**: Define what "agentic potential" dimensions VSM should capture (decision density, data availability, error rates, volume, current automation level) and compare against standard BPM selection criteria
- **Data needed**: Case examples of workflow selection; criteria distinguishing high vs. low agentic potential; failure cases where wrong workflows were selected

### H1.2: A quantitative scoring model is necessary for repeatability
- **Test**: Design a scoring rubric with defined dimensions and scales; assess whether it produces convergent results across assessors vs. qualitative "expert judgment"
- **Data needed**: Scoring dimensions from analogous prioritization frameworks (RPA candidate assessment, automation opportunity scoring); weight calibration approaches

### H1.3: A 2x2 prioritization funnel after scoring screens out high-risk candidates before Design commitment
- **Test**: Define two axes — Output Determinism and Organizational Readiness — and validate that the resulting quadrants predict downstream success/failure
- **Mechanism**:
  - **Q1** (High Determinism × High Readiness): Proceed to Design immediately
  - **Q2** (High Determinism × Low Readiness): Proceed with explicit change management pre-work scoped into Design
  - **Q3** (Low Determinism × High Readiness): Proceed only if HITL validation pattern can substitute for deterministic correctness criteria
  - **Q4** (Low Determinism × Low Readiness): Deprioritize — revisit after organizational maturity improves
- **Data needed**: Failure post-mortems from automation projects; correlation between early risk indicators and downstream failure modes; observable proxy indicators for each axis

### H1.4: Week 0 is sufficient time for scoring + funnel with adequate rigor
- **Test**: Map minimum viable activities against 80 person-hours; include time for funnel assessment (stakeholder interviews for readiness, output analysis for determinism)
- **Data needed**: Activity time estimates from lean assessments; typical client readiness for providing needed inputs

## Research Priorities

| Priority | Question | Why It Matters |
|----------|----------|----------------|
| Must | What dimensions reliably predict agentic workflow potential? | Without validated dimensions, the scoring framework is arbitrary |
| Must | What observable indicators in Week 0 predict output determinism and organizational readiness? | The 2x2 funnel only works if axes are assessable early |
| Must | How do existing automation assessment frameworks handle prioritization + risk screening? | Adjacent methodologies provide proven patterns |
| Must | What are common failure modes in automation projects, and which are predictable from early indicators? | Validates the funnel's filtering power |
| Should | What scoring approaches maximize inter-rater reliability in consulting contexts? | Repeatability is a core success criterion |
| Should | How do process domains differ in agentic potential indicators? | Cross-domain applicability |
| Could | What is the minimum viable data collection for both scoring and funnel assessment? | Timeline feasibility |

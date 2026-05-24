# Solution Proposals: Impact Sizing Framework

## Evidence Synthesis

The research reveals a convergence around multi-dimensional scoring approaches for automation prioritization, with key differentiators being:

1. **Scoring dimensionality**: Frameworks range from 4 dimensions (Business Value, Automation Suitability, Agentic Fit, Risk Burden) to 6+ dimensions. More dimensions increase precision but reduce inter-rater reliability and assessment speed.

2. **Agentic differentiation**: Decision Density Index (DDI) emerges as the critical differentiator between RPA and agentic candidates, measuring cognitive complexity per workflow step.

3. **Risk integration approaches**: Risk can be treated as a separate screening gate (pass/fail before scoring), as a modifier to the composite score (penalty/bonus), or as an independent axis in a 2x2 classification.

4. **Time-feasibility tension**: McKinsey evidence shows comprehensive assessment correlates with success, but the Week 0 constraint (80 hours) forces trade-offs between rigor and speed.

5. **Organizational factors**: McKinsey surveys consistently show organizational readiness (strategic alignment, governance, workforce management) as stronger predictors of success than technical factors alone.

## Surprising Findings

- Direct labor savings account for only 40-50% of total automation ROI; frameworks that focus solely on FTE reduction systematically undervalue the best candidates
- Over 40% of agentic AI projects will be canceled by end of 2027 due to escalating costs, unclear business value, or inadequate risk controls — validating the need for risk-screening at the prioritization stage
- Organizations with successful automation are nearly 5x more likely to have enterprise-wide scope, suggesting the framework should encourage breadth of assessment even within time constraints
- Cohen's kappa below 0.60 indicates inadequate agreement — most consulting scoring rubrics never measure this, creating false confidence in rankings

## Creative Exploration

Three distinct philosophical approaches emerge from the evidence:

1. **Precision-first**: Maximize scoring accuracy with detailed quantitative models, accept slower throughput and higher assessor training requirements
2. **Speed-first**: Optimize for Week 0 time constraint, use rapid heuristics and binary gates, accept lower precision in exchange for coverage
3. **Risk-first**: Lead with risk screening (the 2x2 funnel) before investing time in detailed scoring, ensuring no effort is wasted on doomed candidates

---

## Proposal A: Sequential Precision Model

**Category**: Quantitative-first approach

### Approach

Lead with comprehensive 4-dimension quantitative scoring producing an Agentic Priority Index, then apply the 2x2 funnel as secondary classification.

**Stage 1: Quantitative Scoring (Days 1-3)** — Apply 4-dimension model to all candidates:
- Business Value (V): `V = 0.5 × Impact + 0.25 × Volume + 0.25 × Inefficiency`
- Automation Suitability (S): `S = 0.3 × Standardization + 0.3 × DataQuality + 0.2 × Integration + 0.2 × Repeatability`
- Agentic Fit (A): `A = 0.3 × DecisionCount + 0.3 × DecisionComplexity + 0.2 × ToolDiversity + 0.2 × PlanningNeed`
- Risk Burden (R): `RiskBurden = (ErrorCost × RegulatoryExposure) / max(ControlStrength, 1)`

**Composite**: `API = V × Feasibility × (1 + 0.3 × (A_normalized - 0.5))`

**Stage 2: 2x2 Funnel (Days 3-4)** — Classify scored workflows on Output Determinism × Organizational Readiness (each 1-5, threshold at 3.0)

**Stage 3: Portfolio Ranking (Days 4-5)** — Rank within quadrants by API score

### Trade-offs
- (+) Maximum quantitative rigor; defensible rankings; strong audit trail
- (-) Time pressure for 10+ workflows; scoring fatigue; funnel is confirmatory not eliminatory

---

## Proposal B: Funnel-First Triage Model

**Category**: Risk-screening-first approach

### Approach

Lead with the 2x2 prioritization funnel as a rapid triage gate. Only survivors receive detailed scoring.

**Stage 1: Rapid Intake (Day 1)** — Identify 10-20 candidates with basic attributes

**Stage 2: 2x2 Funnel Triage (Days 2-3)** — Score each axis via 4 binary/ternary indicators (Yes=2, Partial=1, No=0). Range 0-8, threshold ≥5 for "High". Q4 candidates eliminated immediately.

**Stage 3: Streamlined Scoring (Days 3-4)** — Only Q1/Q2 candidates scored on 3 dimensions:
- Value Potential (VP): anchored 1-5 scale
- Agentic Fit (AF): simplified DDI
- Implementation Feasibility (IF): 1-5 scale
- `Priority = VP × 0.5 + AF × 0.3 + IF × 0.2`

**Stage 4: Portfolio Assembly (Day 5)** — Combine quadrant + priority scores

### Trade-offs
- (+) Maximum time efficiency; prevents wasted effort; client-friendly 2x2 visual
- (-) May prematurely eliminate candidates; less quantitative rigor; arbitrary thresholds

---

## Proposal C: Adaptive Layered Assessment

**Category**: Hybrid progressive-depth approach

### Approach

Three-layer progressive assessment where each layer increases depth but decreases breadth.

**Layer 1: Binary Readiness Screen (Day 1)** — 6 binary questions (process clarity, data access, volume, sponsor, outcome measurability, timeline). Gate: minimum 4/6 Yes. Eliminates 30-40%.

**Layer 2: 2x2 Funnel Classification (Days 2-3)** — Weighted indicators for Output Determinism (4 indicators, weighted) and Organizational Readiness (4 indicators, weighted). Score 1.0-5.0, threshold 3.0. Routes to quadrant-specific paths.

**Layer 3: Detailed Scoring (Days 4-5)** — Full 4-dimension scoring for Q1/Q2 only:
- Value Magnitude (VM): cost savings + quality + speed + strategy
- Agentic Complexity (AC): Decision Density Index
- Implementation Velocity (IV): data readiness, APIs, capacity
- Risk-Adjusted Return (RAR): `(VM × IV) / (1 + RiskPenalty)`
- `PriorityScore = RAR × (1 + 0.25 × AC_normalized)`

**Time Budget**: Layer 1 (19%) → Layer 2 (28%) → Layer 3 (31%) → Deliverable (22%)

### Trade-offs
- (+) Best rigor/time balance; progressive narrative; explicit time budgets; resources concentrated on highest-potential candidates
- (-) Three-stage complexity; potential for inconsistent depth; requires disciplined scope management

---

## Comparative Summary

| Criterion | Proposal A | Proposal B | Proposal C |
|-----------|-----------|-----------|-----------|
| Time efficiency | Low-Medium | High | Medium-High |
| Scoring rigor | High | Medium | High (for survivors) |
| Risk screening | Secondary | Primary | Layered |
| Inter-rater reliability | High (calibration) | High (binary items) | High (mixed) |
| Client communication | Complex formulas | Intuitive 2x2 | Progressive narrative |
| Coverage breadth | All candidates scored | Selective scoring | Progressive filtering |
| Execution complexity | Medium | Low | High |

# Prioritization Matrix (ODS × ORS) — Detailed Guide

## Purpose

The 2×2 matrix classifies workflows that passed the Binary Readiness Screen into four strategic categories based on two dimensions: how verifiable the outputs are (ODS) and how ready the organization is to adopt change (ORS). Each quadrant prescribes a different action path and timeline position within a 1-2 year agentic transformation roadmap.

---

## Axis Definitions

### Output Determinism Score (ODS) — X-Axis

ODS measures how objectively verifiable the workflow's outputs are. High ODS means you can programmatically check whether the agent got it right; Low ODS means correctness requires human judgment.

| Indicator | Weight | Score 0 | Score 1 | Score 2 |
|-----------|--------|---------|---------|---------|
| **Output Structure** | 0.30 | Unstructured (free-text, creative) | Semi-structured (template with variable sections) | Fully structured (form fields, fixed schema) |
| **Correctness Verifiability** | 0.30 | Requires expert subjective review | Partially checkable (some rules + some judgment) | Fully rule-checkable (deterministic pass/fail) |
| **Variance Tolerance** | 0.20 | Zero tolerance (must be exact) | Low tolerance (minor variations acceptable) | High tolerance (multiple valid outputs) |
| **Ground Truth Availability** | 0.20 | No historical examples exist | Partial dataset (< 50 labeled examples) | Complete dataset (100+ labeled examples) |

**ODS = Σ (weight × score)** — Range: 0.0 to 2.0

**Threshold**: 1.2 separates "High ODS" from "Low ODS"

**Interpretation**:
- **High ODS (≥ 1.2)**: The agent's outputs can be validated automatically or with minimal human review. MVP testing will be efficient because you can build automated evaluation pipelines.
- **Low ODS (< 1.2)**: Outputs require significant human judgment to evaluate. MVP testing will require human-in-the-loop evaluation panels, which is slower and more expensive.

---

### Organizational Readiness Score (ORS) — Y-Axis

ORS measures the environment's capacity to absorb an agentic workflow change. High ORS means the organization is structurally prepared for adoption; Low ORS means significant change management work is required.

| Indicator | Weight | Score 0 | Score 1 | Score 2 |
|-----------|--------|---------|---------|---------|
| **Sponsor Authority** | 0.30 | No sponsor identified | Sponsor exists but limited budget/authority | Mandating sponsor with budget and decision power |
| **Team Receptivity** | 0.25 | Active resistance ("this will replace us") | Neutral/cautious ("show me it works") | Enthusiastic ("we've been asking for this") |
| **Integration Complexity** | 0.25 | 5+ systems, no APIs, custom connectors needed | 2-4 systems, some APIs available | 1-2 systems, well-documented APIs |
| **Change History** | 0.20 | No prior automation; last change initiative failed | Mixed history; some automation exists | Recent successful automation; strong change muscle |

**ORS = Σ (weight × score)** — Range: 0.0 to 2.0

**Threshold**: 1.2 separates "High ORS" from "Low ORS"

**Interpretation**:
- **High ORS (≥ 1.2)**: The organization can absorb this change within the engagement timeline. Deployment will follow standard progression without extraordinary change management.
- **Low ORS (< 1.2)**: Deployment will face adoption barriers. Additional trust-building, stakeholder management, or technical integration work is required beyond the standard playbook.

---

## The Four Quadrants

```
                        High ORS (≥ 1.2)
                             │
    ┌────────────────────────┼────────────────────────┐
    │                        │                        │
    │   INVEST & PROVE       │     QUICK WIN          │
    │   (Low ODS, High ORS)  │   (High ODS, High ORS) │
    │                        │                        │
    │   Timeline: Month 3-6  │   Timeline: Month 1-3  │
    │                        │                        │
────┼────────────────────────┼────────────────────────┼──── ODS
    │                        │                        │     Threshold
    │   DEFER & MATURE       │  SPONSOR & ALIGN       │     (1.2)
    │   (Low ODS, Low ORS)   │  (High ODS, Low ORS)   │
    │                        │                        │
    │   Timeline: Month 9-18 │   Timeline: Month 4-9  │
    │                        │                        │
    └────────────────────────┼────────────────────────┘
                             │
                        Low ORS (< 1.2)
```

---

### Quick Win (High ODS, High ORS)

**What it means**: The workflow has objectively verifiable outputs AND the organization is ready to adopt. These are the ideal first candidates — lowest risk, fastest time-to-value, and highest probability of success.

**Strategic rationale**: Start here to build organizational confidence and demonstrate ROI. Success on Quick Wins creates political capital and proof points that accelerate harder candidates later.

**Action path**:
- Proceed directly to Depth Layer scoring (Days 3-5)
- Fast-track through Design and MVP phases
- Use as the engagement's "lighthouse" case study

**Timeline position**: **Month 1-3** — First wave of implementation. These workflows should be in production within the initial engagement window.

**Examples**:
- Invoice matching with structured PO data, enthusiastic finance team, and API-connected ERP
- Standard customer onboarding with defined checklists, supportive ops manager, and CRM integration
- Compliance screening with clear rules, mandating regulatory sponsor, and available audit trail

---

### Sponsor & Align (High ODS, Low ORS)

**What it means**: The workflow's outputs are objectively verifiable (the technical challenge is manageable), BUT the organization isn't ready — weak sponsorship, resistant teams, or complex integration landscape.

**Strategic rationale**: These workflows will succeed technically but fail on adoption without investment in change management. The bottleneck is organizational, not technical. They become viable once Quick Wins demonstrate success and build trust.

**Action path**:
- Proceed to Depth Layer with explicit **change management flag**
- Design phase must include adoption risk mitigation (trust-building plan, stakeholder mapping)
- Production deployment uses Trust-Led profile (extended shadow/parallel running)
- Pair with a completed Quick Win as evidence ("look what we achieved in Process X")

**Timeline position**: **Month 4-9** — Second wave. Begin Design after Quick Wins are in production, leveraging their success as proof. Allow 1-2 months of organizational warming before deployment.

**Examples**:
- Claims processing with clear rules but a skeptical adjuster team worried about job loss
- Data entry automation with structured inputs but 6 legacy systems requiring custom connectors
- Report generation with deterministic outputs but no single process owner (shared across 3 teams)

---

### Invest & Prove (Low ODS, High ORS)

**What it means**: The organization is ready and willing, BUT the workflow's outputs are hard to verify objectively. Success requires investing in human-in-the-loop validation and building evaluation infrastructure that doesn't yet exist.

**Strategic rationale**: The organization's enthusiasm is an asset, but the technical validation challenge means MVP will take longer and cost more. These workflows need a Guardian interaction mode and carefully designed human evaluation protocols.

**Action path**:
- Proceed to Depth Layer only if **Human-in-the-Loop validation pattern** is confirmed viable
- Design phase must default to Guardian or Co-Pilot interaction mode (never Autopilot)
- MVP phase requires human evaluation panels (budget 2x the testing time)
- Build explicit feedback loops to gradually train evaluation criteria

**Timeline position**: **Month 3-6** — Start Design in parallel with Quick Win production deployment. The organizational readiness means you won't face adoption resistance, but allow extra time for validation infrastructure.

**Examples**:
- Customer email response drafting (quality is subjective, but the support team is eager to try)
- Research summarization for analysts (no single "correct" summary, but the team loves the idea)
- Proposal first-draft generation (creative output, but sales team is technology-forward)

---

### Defer & Mature (Low ODS, Low ORS)

**What it means**: Both the technical validation challenge AND the organizational readiness are insufficient. These workflows are not viable within the current engagement window. Forcing them forward leads to failed implementations that damage future agentic adoption.

**Strategic rationale**: These are not "never" candidates — they are "not yet" candidates. The right action is to define what must change (organizationally or technically) before they become viable, and revisit after those preconditions are met.

**Action path**:
- **Eliminate** from the current engagement scope
- Document specific maturity gaps and prerequisites for future viability
- Define trigger conditions for re-evaluation (e.g., "revisit when new CRM is deployed" or "revisit after org restructure completes")
- Include in the 12-18 month transformation roadmap as future-state candidates

**Timeline position**: **Month 9-18** — Third wave at earliest. Requires both organizational maturation (change management investments, sponsor development) AND technical preparation (evaluation framework development, system integration projects).

**Examples**:
- Creative campaign ideation (subjective quality + marketing team is resistant to AI)
- Strategic planning support (judgment-heavy + no clear sponsor or process structure)
- Cross-department coordination (undefined quality criteria + political complexity across silos)

---

## 1-2 Year Transformation Roadmap

| Wave | Timeline | Quadrant | Objective | Success Metric |
|------|----------|----------|-----------|----------------|
| **Wave 1** | Month 1-3 | Quick Win | Prove value, build confidence | 1-2 workflows in production, measurable ROI |
| **Wave 2** | Month 4-9 | Sponsor & Align | Expand with change management | 2-3 additional workflows deployed with adoption > 70% |
| **Wave 2b** | Month 3-6 | Invest & Prove | Validate HITL patterns | 1 workflow with human evaluation infrastructure operational |
| **Wave 3** | Month 9-18 | Defer & Mature | Scale after maturity | Deferred candidates re-assessed, 50% pass readiness screen |

### Roadmap Visualization

```
Month:  1   2   3   4   5   6   7   8   9  10  11  12  13  14  15  16  17  18
        ├───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┼───┤
Quick   ████████████
Win     [Design→MVP→Prod]

Invest  ········████████████
& Prove         [Design→MVP(extended)→Prod]

Sponsor ············████████████████
& Align             [Change Mgmt→Design→MVP→Prod]

Defer &                         ·····················████████████████
Mature                          [Maturity Building→Re-assess→Design→MVP→Prod]
```

---

## Scoring Worksheet

Use this table to score each workflow that passed the Binary Readiness Screen:

### ODS Scoring

| Workflow | Output Structure (×0.30) | Correctness Verifiability (×0.30) | Variance Tolerance (×0.20) | Ground Truth (×0.20) | **ODS Total** | High/Low |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |

### ORS Scoring

| Workflow | Sponsor Authority (×0.30) | Team Receptivity (×0.25) | Integration Complexity (×0.25) | Change History (×0.20) | **ORS Total** | High/Low |
|----------|:---:|:---:|:---:|:---:|:---:|:---:|
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |
| | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | 0 / 1 / 2 | | ≥1.2? |

### Quadrant Assignment

| Workflow | ODS | ORS | Quadrant | Action | Timeline |
|----------|-----|-----|----------|--------|----------|
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |
| | | | | | |

---

## Inter-Rater Protocol for 2×2 Scoring

1. Both team members score ODS and ORS independently (no discussion during scoring)
2. Compare scores — if gap exceeds 0.4 on either axis, discuss evidence and re-score
3. Final score is the agreed value (not an average)
4. Target: Cohen's kappa ≥ 0.70 on quadrant assignment across all candidates
5. If kappa < 0.70, conduct a 30-minute calibration session with anchor examples before re-scoring

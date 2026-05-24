# Detailed Scoring Guide — Business Case Development

## Purpose

This guide provides specific, calibrated anchors for every scoring dimension used in the Depth Layer (Days 3-5). Each score from 1 to 5 has a concrete description so that two independent assessors arrive at the same number when evaluating the same workflow. Ambiguity in scoring is the primary source of inter-rater disagreement — this guide eliminates it.

---

## Value Magnitude (VM) Scoring

**Composite formula**: VM = (Cost Savings × 0.35) + (Quality Improvement × 0.25) + (Speed Improvement × 0.20) + (Strategic Alignment × 0.20)

---

### Dimension 1: Cost Savings Potential (Weight: 0.35)

Measures the annual monetary savings achievable through agentic automation — combining labor cost reduction, error cost elimination, and compliance penalty avoidance.

| Score | Label | Annual Savings | Description | Example |
|:-----:|-------|---------------|-------------|---------|
| **1** | Minimal | < $50K | Saves less than 1 FTE-equivalent; minor efficiency gain | Automating a weekly 2-hour report compilation (104 hours/year × $50/hr = $5,200) |
| **2** | Moderate | $50K–$200K | Saves 1-2 FTE-equivalent or eliminates a recurring cost line | Automating invoice data entry that currently requires 1.5 dedicated staff |
| **3** | Significant | $200K–$500K | Saves 3-5 FTE-equivalent or eliminates meaningful error/penalty costs | Automating claims processing for a mid-size team, reducing error-driven rework by 60% |
| **4** | High | $500K–$1M | Saves 5-10 FTE-equivalent or eliminates a major compliance/SLA cost | Automating end-to-end order processing, eliminating late-delivery penalties and manual reconciliation |
| **5** | Transformative | > $1M | Saves 10+ FTE-equivalent or fundamentally changes cost structure | Automating a 15-person operations center to 3 oversight roles; eliminating $800K in annual regulatory fines |

**How to score**: Calculate the annualized cost of the current process (FTE hours × loaded rate + error costs + penalty exposure). Estimate the percentage automatable (typically 60-85% for agentic workflows). The difference is the savings.

**Domain calibrations**:
- **Finance**: Include compliance penalty avoidance (audit findings × average penalty)
- **Supply Chain**: Include inventory carrying cost reductions and stockout/overstock savings
- **Customer Service**: Use (handle time reduction × volume × cost per minute)

---

### Dimension 2: Quality Improvement (Weight: 0.25)

Measures the reduction in errors, rework, and quality failures that agentic automation enables.

| Score | Label | Error Reduction | Description | Example |
|:-----:|-------|----------------|-------------|---------|
| **1** | Marginal | < 10% | Current error rate is already low (< 2%); minimal room for improvement | A well-optimized process with 1.5% error rate dropping to 1.3% |
| **2** | Noticeable | 10–30% | Reduces common errors but doesn't eliminate error categories | Reducing data entry typos from 8% to 5% through automated validation |
| **3** | Meaningful | 30–50% | Eliminates one or more error categories entirely | Eliminating all format/routing errors (5% of total) while reducing judgment errors by 20% |
| **4** | Substantial | 50–75% | Eliminates most error categories; residual errors are edge cases only | Reducing claims processing errors from 12% to 3%, with remaining errors only in complex multi-party cases |
| **5** | Near-elimination | > 75% | Achieves near-zero error rates on automatable portions | Reducing invoice matching errors from 15% to < 1% through deterministic rule application |

**How to score**: Identify the current error rate (from quality reports, rework logs, customer complaints). Classify errors by cause: format errors (highly automatable), rule-application errors (automatable), judgment errors (partially automatable), novel-situation errors (rarely automatable). Estimate the reduction based on which categories the agent addresses.

---

### Dimension 3: Speed Improvement (Weight: 0.20)

Measures the reduction in end-to-end cycle time — from process trigger to final output delivery.

| Score | Label | Cycle Time Reduction | Description | Example |
|:-----:|-------|---------------------|-------------|---------|
| **1** | Marginal | < 20% | Minor time savings; the process is already relatively fast | Reducing a 2-hour process to 1.5 hours (mostly waiting time that agents don't fix) |
| **2** | Noticeable | 20–40% | Meaningful acceleration; removes manual bottlenecks but retains human checkpoints | Reducing a 5-day approval cycle to 3 days by automating preparation and routing |
| **3** | Significant | 40–60% | Major acceleration; agents handle most sequential steps in parallel or instantly | Reducing an 8-hour research + draft process to 3 hours with agent-driven research and templating |
| **4** | Dramatic | 60–80% | Near-real-time execution of previously multi-day processes | Reducing a 3-day compliance review to same-day completion via automated screening + escalation |
| **5** | Real-time | > 80% | Process becomes effectively instantaneous relative to current state | Reducing a 48-hour customer onboarding to 2-hour automated setup with human approval only at final gate |

**How to score**: Map the current process timeline (trigger to completion, including wait times). Identify which steps an agent executes instantly vs. which retain human cycle time. Calculate: (current time - projected time) / current time.

**Important**: Include queue/wait times in "current time" — agents don't wait in queues. This is often the largest source of speed improvement.

---

### Dimension 4: Strategic Alignment (Weight: 0.20)

Measures how directly the workflow automation supports the organization's stated strategic priorities and transformation objectives.

| Score | Label | Alignment Level | Description | Example |
|:-----:|-------|----------------|-------------|---------|
| **1** | Tangential | Operational convenience only | Useful but not connected to any strategic initiative; wouldn't be mentioned to executives | Automating internal meeting scheduling |
| **2** | Supportive | Indirectly enables a strategic goal | Contributes to a broader initiative but isn't a headline capability | Automating data preparation for a strategic analytics platform |
| **3** | Aligned | Directly supports a named strategic priority | Appears in the annual plan or OKRs as a contributing workstream | Automating customer onboarding to support the "digital-first experience" strategic pillar |
| **4** | Central | Core to a strategic initiative's success | The strategic initiative partially depends on this automation; exec visibility is high | Automating compliance monitoring to meet a regulatory deadline mandated by the board |
| **5** | Flagship | Defines the organization's transformation narrative | This is THE case study that leadership will present to the board/market as proof of transformation | Automating the core underwriting workflow as the centerpiece of the "AI-first insurance" strategy |

**How to score**: Review the organization's strategic plan, OKRs, or board priorities. Ask: "If this automation succeeds, which executive mentions it in their next quarterly review?" The higher the organizational level that cares, the higher the score.

---

## Decision Density Index (DDI)

DDI measures how much meaningful decision logic exists in the workflow — indicating agentic fit. Processes with high DDI benefit most from intelligent agents; processes with low DDI may be better served by simple RPA.

### Step 1: Map Decision Points

Walk through the workflow step-by-step. At each decision point, classify its complexity:

| Decision Type | Weight | Description | Example |
|---------------|:------:|-------------|---------|
| **Binary** | 1 | Two possible outcomes based on a simple condition | "Is amount > $10,000? → Route to senior approver" |
| **Multi-option** | 2 | Three or more possible paths based on multiple factors | "Based on customer segment + order size + payment history → select from 5 pricing tiers" |
| **Judgment** | 3 | Requires reasoning, context interpretation, or weighing trade-offs | "Evaluate this supplier proposal against 8 criteria and decide whether to negotiate, accept, or reject" |

### Step 2: Calculate DDI

```
DDI_raw = Σ (decision_weight) / total_process_steps
DDI_normalized = DDI_raw / max(DDI_raw across all candidates)
```

**Range**: 0.0 to 1.0 (after normalization)

### Interpretation

| DDI Range | Agentic Fit | Implication |
|-----------|-------------|-------------|
| 0.0–0.2 | Low | Process is mostly sequential execution; RPA may be sufficient. Agent adds limited value over deterministic automation. |
| 0.2–0.4 | Moderate | Some decision logic exists; agent adds value at specific decision points. Consider Co-Pilot mode at decision nodes. |
| 0.4–0.6 | Good | Meaningful decision density; agent provides clear advantage over rule-based automation. Standard agentic fit. |
| 0.6–0.8 | High | Decision-rich process where agent reasoning is the primary value driver. Strong agentic candidate. |
| 0.8–1.0 | Very High | Nearly every step involves non-trivial decisions. Highest agentic potential but also highest validation complexity. |

---

## Risk Assessment Scoring

Four risk categories, each scored as Low / Medium / High:

### Implementation Risk

Based on: DDI × Integration Complexity

| Level | Criteria | Description |
|-------|----------|-------------|
| **Low** | DDI < 0.4 AND ≤ 2 systems | Simple workflow with minimal integrations; standard agent patterns apply |
| **Medium** | DDI 0.4-0.7 OR 3-4 systems | Moderate complexity; some custom development required but patterns exist |
| **High** | DDI > 0.7 AND 5+ systems | Complex decision logic across multiple poorly-integrated systems; high technical risk |

### Adoption Risk

Based on: ORS score (carried forward from 2×2)

| Level | Criteria | Description |
|-------|----------|-------------|
| **Low** | ORS ≥ 1.6 | Strong sponsor, enthusiastic team, successful change history — adoption is likely |
| **Medium** | ORS 1.2–1.6 | Adequate sponsorship and neutral team — standard change management sufficient |
| **High** | ORS < 1.2 | Weak sponsor, resistant team, or failed prior changes — significant adoption intervention required |

### Compliance Risk

Based on: Regulatory exposure × Error cost

| Level | Criteria | Description |
|-------|----------|-------------|
| **Low** | No regulatory oversight; errors cost < $1K each | Internal process with no external reporting requirement; mistakes are cheap to fix |
| **Medium** | Light regulation OR moderate error cost ($1K-$50K) | Some regulatory visibility but not audit-critical; errors cause rework but not fines |
| **High** | Heavy regulation AND high error cost (> $50K) | Audit-critical process where agent errors could trigger regulatory action, fines, or legal liability |

### Dependency Risk

Based on: Count and reliability of external systems

| Level | Criteria | Description |
|-------|----------|-------------|
| **Low** | 0-1 external dependencies, all with SLA > 99.5% | Self-contained or single reliable integration; agent downtime is under your control |
| **Medium** | 2-3 external dependencies, mixed reliability | Multiple integrations with occasional outages; need retry/fallback logic |
| **High** | 4+ external dependencies OR any dependency with SLA < 99% | Agent operation depends on multiple external systems; single dependency failure cascades |

### Risk-Adjusted Score Calculation

```
RiskPenalty = count of "High" risk categories (0, 1, 2, 3, or 4)
RAS = VM × (1 - 0.15 × RiskPenalty)
```

| High-Risk Count | Penalty | Effect on VM=4.0 |
|:---:|:---:|:---:|
| 0 | 0% | RAS = 4.00 |
| 1 | 15% | RAS = 3.40 |
| 2 | 30% | RAS = 2.80 |
| 3 | 45% | RAS = 2.20 |
| 4 | 60% | RAS = 1.60 |

---

## Final Priority Score

```
PriorityScore = RAS × (1 + 0.25 × DDI_normalized)
```

**Range**: 0.0 to 6.25 (theoretical maximum with VM=5.0, no risk, DDI=1.0)

**Hard-floor for Design entry**: PriorityScore ≥ 3.0

### Interpretation Guide

| Score Range | Interpretation | Action |
|:-----------:|----------------|--------|
| < 2.0 | Insufficient value or too risky | Park — not viable for this engagement |
| 2.0–3.0 | Marginal candidate | Park unless no better candidates exist; requires explicit sponsor justification |
| 3.0–4.0 | Solid candidate | Proceed to Design; standard approach applies |
| 4.0–5.0 | Strong candidate | High-priority; allocate best resources; consider for flagship case |
| > 5.0 | Exceptional candidate | Rare; ensure scoring is calibrated and not inflated; proceed with confidence |

---

## Complete Scoring Worksheet

| Dimension | Workflow A | Workflow B | Workflow C | Workflow D | Workflow E |
|-----------|:---------:|:---------:|:---------:|:---------:|:---------:|
| **Cost Savings (1-5)** | | | | | |
| **Quality Improvement (1-5)** | | | | | |
| **Speed Improvement (1-5)** | | | | | |
| **Strategic Alignment (1-5)** | | | | | |
| **VM (weighted composite)** | | | | | |
| | | | | | |
| **DDI_raw** | | | | | |
| **DDI_normalized** | | | | | |
| | | | | | |
| **Implementation Risk** | L / M / H | L / M / H | L / M / H | L / M / H | L / M / H |
| **Adoption Risk** | L / M / H | L / M / H | L / M / H | L / M / H | L / M / H |
| **Compliance Risk** | L / M / H | L / M / H | L / M / H | L / M / H | L / M / H |
| **Dependency Risk** | L / M / H | L / M / H | L / M / H | L / M / H | L / M / H |
| **RiskPenalty (0-4)** | | | | | |
| **RAS** | | | | | |
| | | | | | |
| **PriorityScore** | | | | | |
| **Rank** | | | | | |
| **Decision** | Pass / Park | Pass / Park | Pass / Park | Pass / Park | Pass / Park |

---

## Calibration Protocol

Before scoring begins, both team members must complete a 2-hour calibration session:

1. **Review anchors** (30 min): Walk through each 1-5 scale together, discuss boundary cases
2. **Practice scoring** (60 min): Independently score 2-3 example workflows (from prior engagements or synthetic cases), then compare
3. **Resolve disagreements** (30 min): Where scores differ by > 1 point, discuss reasoning and align on interpretation

**Target**: Intraclass Correlation Coefficient ≥ 0.75 on PriorityScore across all candidates

**If calibration fails**: Re-do the practice round with different examples. If disagreement persists on a specific dimension, document the interpretation conflict and escalate to the engagement lead for a binding ruling.

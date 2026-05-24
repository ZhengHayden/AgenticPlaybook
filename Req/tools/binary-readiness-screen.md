# Binary Readiness Screen — Detailed Guide

## Purpose

The Binary Readiness Screen is a Day 1 gate that eliminates structurally unready candidates before any quantitative scoring begins. Each criterion tests a hard precondition for agentic feasibility — if the answer is No, the workflow cannot succeed within the engagement's time and resource constraints regardless of its business value.

**Gate Rule**: 5 of 6 Yes answers required to proceed. One allowed exception must be documented with a mitigation plan.

---

## Criteria Definitions

### 1. Process Documentability

> **Question**: Is the process documented or describable in under 2 hours?

**What this means**: A knowledgeable process participant can walk through the end-to-end workflow — triggers, steps, decisions, outputs, exceptions — in a structured 2-hour interview. Alternatively, existing documentation (SOPs, runbooks, Visio diagrams) covers at least 80% of the process logic.

**Why it matters**: If the process requires more than 2 hours of discovery just to understand what it does, the Design phase cannot complete within its 80-hour budget. Hidden tribal knowledge indicates the process is not yet mature enough for agentic automation.

**Pass examples**:
- Process has a maintained SOP document updated within the last 12 months
- Process owner can whiteboard the flow in 90 minutes with decision points identified
- An existing training guide covers all major paths and exceptions

**Fail examples**:
- "Only Maria knows how this really works, and she's been here 15 years"
- Multiple conflicting documents exist with no authoritative version
- The process has 20+ undocumented exception paths discovered only during execution

---

### 2. Digital Data Accessibility

> **Question**: Is input data digitally accessible?

**What this means**: The data the agent would consume (documents, records, signals, triggers) exists in a system that can be accessed programmatically via API, database query, file share, or structured export. The data does not require manual scanning, transcription, or physical handling as a prerequisite.

**Why it matters**: Agents operate on digital inputs. If data exists only on paper, in someone's email, or in a system with no integration path, the implementation cannot proceed without a separate digitization project that exceeds the engagement scope.

**Pass examples**:
- Data lives in an ERP/CRM with REST API access
- Input documents arrive as structured emails or PDFs in a monitored folder
- Source systems have existing ETL pipelines or webhook capabilities

**Fail examples**:
- Input arrives as handwritten forms that must be manually keyed
- Data exists only in a legacy mainframe with no API and terminal-only access
- Critical information lives in unstructured Slack threads or verbal approvals

---

### 3. Execution Volume

> **Question**: Does the process execute more than 50 times per month?

**What this means**: The workflow runs at sufficient frequency that automating it produces measurable time/cost savings within the engagement timeline (3-4 months). Volume is counted as discrete end-to-end executions, not individual steps.

**Why it matters**: Low-volume processes cannot generate enough ROI to justify the implementation investment within the engagement window. At fewer than 50 executions/month, even a process that takes 1 hour per execution saves less than 50 hours/month — often insufficient to justify the design, build, and validation effort.

**Pass examples**:
- Invoice processing: 200-500 invoices per month
- Customer onboarding: 80-150 new accounts per month
- Compliance checks: runs daily across 100+ transactions

**Fail examples**:
- Quarterly board report preparation (4x per year)
- Annual audit coordination (1x per year)
- Monthly executive briefing (12x per year)

**Edge case**: If a process runs fewer than 50 times/month but each execution takes 8+ hours and carries significant error cost, document this as the allowed exception with ROI justification.

---

### 4. Identifiable Process Owner

> **Question**: Is there an identifiable, willing process owner?

**What this means**: A named individual with authority over the process (can approve changes, allocate team time for testing, sign off on the future-state design) has explicitly agreed to participate in the engagement. "Willing" means they will attend weekly alignment ceremonies, provide SME access, and make decisions within 48 hours.

**Why it matters**: Agentic workflows change how people work. Without an empowered sponsor who actively participates, the Design phase cannot validate requirements, the MVP phase cannot get test data, and Production deployment fails on adoption. The process owner is the engagement's single point of accountability on the client side.

**Pass examples**:
- Department head has allocated 4 hours/week to the engagement
- VP of Operations has designated a senior manager with decision authority
- Process owner has signed the engagement charter with time commitment

**Fail examples**:
- "We think it's the ops team but nobody owns it formally"
- The nominal owner is a junior analyst with no authority to approve changes
- The owner agrees in principle but has no bandwidth ("check back next quarter")

---

### 5. Definable Output Quality

> **Question**: Can "good output" be defined or shown via examples?

**What this means**: The process produces outputs where quality can be evaluated — either through explicit rules (format compliance, numerical accuracy, completeness checks) or through example-based comparison (golden samples of correct outputs exist). The evaluation does not require purely subjective human judgment with no articulable criteria.

**Why it matters**: MVP Validation requires a correctness model. If you cannot define what "correct" looks like, you cannot test whether the agent produces correct outputs. This doesn't require 100% determinism — but it requires that at least 70% of output quality can be assessed without irreducible subjective judgment.

**Pass examples**:
- "A correctly processed invoice matches PO amount ±$0.01, has all 12 required fields, and routes to the correct approver based on amount thresholds"
- 100+ historically approved outputs exist as a reference dataset
- Output quality is already measured by existing KPIs (accuracy rate, SLA compliance)

**Fail examples**:
- "Good creative copy is whatever the CMO likes that day"
- Quality is entirely relationship-dependent ("it's good if the client doesn't complain")
- No historical examples exist because the process is brand new

---

### 6. Process Stability

> **Question**: Is the process stable (no redesign planned within 6 months)?

**What this means**: The workflow's core logic, systems, and organizational context will remain substantially unchanged for at least 6 months. Minor tweaks (threshold adjustments, new exception types) are acceptable. Major changes (system migration, reorganization, regulatory overhaul) are disqualifying.

**Why it matters**: Building an agentic workflow against a moving target wastes implementation effort. If the process is scheduled for redesign, the agent architecture may be invalidated before it reaches production. Wait for the redesign to complete, then automate the stable new process.

**Pass examples**:
- Process has been stable for 2+ years with only parameter updates
- No system migrations or org changes planned in the next 12 months
- Regulatory framework is settled (no pending rule changes affecting this process)

**Fail examples**:
- ERP migration to SAP S/4HANA scheduled for Q3 (4 months away)
- Team is being restructured — half the roles may not exist in 6 months
- New regulation takes effect in 5 months that fundamentally changes the process logic

---

## Fact Collection Table

Use this table during process owner interviews (30 minutes each). Fill one row per candidate workflow.

| # | Workflow Name | C1: Documentability | C2: Data Access | C3: Volume (per month) | C4: Process Owner | C5: Output Quality | C6: Stability | Score (Y count) | Pass/Fail |
|---|-------------|--------------------|-----------------|-----------------------|-------------------|--------------------|--------------|-----------------:|-----------|
| 1 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 2 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 3 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 4 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 5 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 6 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 7 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 8 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 9 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |
| 10 | | ☐ Yes ☐ No | ☐ Yes ☐ No | ☐ Yes (___/mo) ☐ No | ☐ Yes: _________ ☐ No | ☐ Yes ☐ No | ☐ Yes ☐ No | /6 | |

### Evidence Notes

For each "No" answer, document the specific gap and whether mitigation is feasible:

| Workflow | Failed Criterion | Gap Description | Mitigation Feasible? | Notes |
|----------|-----------------|-----------------|---------------------|-------|
| | | | ☐ Yes ☐ No | |
| | | | ☐ Yes ☐ No | |
| | | | ☐ Yes ☐ No | |

### Interview Protocol

**Duration**: 30 minutes per process owner
**Interviewer**: Both team members (for inter-rater calibration)

1. Open (5 min): "Walk me through what triggers this process and what the final output looks like"
2. Probe each criterion (20 min): Ask the question, then ask for a specific example or evidence
3. Close (5 min): "Is there anything about this process that's about to change in the next 6 months?"

**Tip**: Do not explain the pass/fail threshold during the interview. Process owners who know the gate may unconsciously bias their answers toward Yes.

# Systematic Delivery Framework for Agentic Workflow Transformations

## Context

### Situation

Enterprises across industries are adopting agentic workflows — multi-step processes where AI agents execute tasks autonomously, collaborate with other agents, and interact with humans at defined checkpoints. The demand for consulting engagements that deliver these transformations is growing, yet no standardized delivery methodology exists. Most implementations proceed ad hoc, with high variance in outcomes, unclear phase gates, and no repeatable quality criteria.

The user has developed initial thinking around a phased delivery model with four stages: Impact Sizing (Week 0), Design (2 weeks), MVP (2-4 weeks), and Production (1-2 months). This model identifies key activities and resource profiles per phase but lacks the concrete frameworks, decision gates, templates, and quality criteria that would make it a repeatable, teachable methodology. The gap is between "activity description" and "executable playbook."

### Trigger

Three factors make this problem urgent now:

1. **Market demand**: Enterprises are actively requesting agentic workflow implementations, creating immediate need for a structured delivery approach that can be staffed and repeated across engagements.
2. **Quality variance**: Without a codified methodology, delivery quality depends entirely on individual consultant expertise, creating unacceptable risk as engagements scale.
3. **Competitive differentiation**: A rigorous, framework-backed methodology creates defensible positioning against competitors who offer generic "AI consulting" without structured delivery guarantees.

### Stakeholders

| Stakeholder | Role | Key Interests |
|-------------|------|---------------|
| Consulting leadership | Decision-maker | Scalable methodology that enables parallel engagements, predictable outcomes, staffing efficiency |
| Functional consultants | Practitioner | Clear frameworks, templates, and decision criteria that reduce ambiguity in client engagements |
| Agentic architects | Practitioner | Technical decision frameworks for agent design, tool selection, interaction patterns |
| Agentic engineers | Practitioner | Clear handoff criteria from design, testable acceptance criteria, production readiness checklists |
| Enterprise clients | Buyer / Beneficiary | Predictable timelines, transparent progress indicators, measurable value delivery |
| Client process owners | Affected | Minimal disruption during transition, clear HITL (Human-in-the-Loop) expectations, adoption support |

## Problem Definition

### Core Question

**What concrete frameworks, decision gates, deliverable templates, and quality criteria should govern each phase of an agentic workflow delivery engagement to make the methodology repeatable, teachable, and outcome-predictable across different enterprise processes?**

This question decomposes into four phase-specific sub-questions:

1. **Impact Sizing (Week 0)**: What framework systematically identifies, sizes, and prioritizes candidate workflows for agentic transformation?
2. **Design (2 weeks)**: What structured method translates a prioritized workflow into an agent architecture with defined interaction patterns, skill requirements, and prototyped behavior?
3. **MVP (2-4 weeks)**: What validation framework confirms that the designed agents produce correct outputs end-to-end before production investment?
4. **Production (1-2 months)**: What deployment and adoption framework ensures successful transition from validated prototype to production operation with measurable business impact?

### Scope

**In Scope:**

- Framework definition for each of the four delivery phases (Impact Sizing, Design, MVP, Production)
- Decision gate criteria between phases (what must be true to proceed)
- Deliverable templates for each phase (what artifacts are produced, in what format)
- Quality criteria and acceptance standards per phase
- Resource model and role definitions (functional consultant, agentic architect, agentic engineer)
- Key concepts that require concrete definition: the 3 Agent-Human interaction archetypes, the 5 agent archetypes, value stream mapping methodology adapted for agentic workflows, A2A (Agent-to-Agent) pattern taxonomy, HITL pattern taxonomy
- Applicability across enterprise process types (finance, supply chain, HR, customer service, etc.)

**Out of Scope:**

- Specific technology or platform selection (the methodology should be platform-agnostic; tool choices are engagement-specific decisions within the framework)
- Agent-native organizational transformation at the company-wide level (addressed separately in sibling problem `agent-native-org-transformation`; this problem focuses on individual workflow delivery, not enterprise-wide org redesign)
- Pricing and commercial model for consulting engagements (commercial strategy is a separate concern from delivery methodology)
- Training curriculum design for client teams (adoption support is in scope; building a complete training program is not)
- Ongoing managed services after production handoff (post-engagement support is a separate offering)

### Constraints

| Constraint | Description | Impact |
|------------|-------------|--------|
| Timeline compression | Total engagement spans approximately 3-4 months from kickoff to production | Frameworks must be efficient; no room for extensive discovery phases or lengthy iteration cycles |
| Lean resourcing | Each phase is delivered by 2 people maximum (functional consultant + technical specialist) | Frameworks must be executable by small teams; cannot require large working groups or extensive parallel workstreams |
| Enterprise integration complexity | Production phase must connect to enterprise systems (SAP, Salesforce, etc.) with their own governance and change processes | Production framework must account for enterprise IT gatekeeping, security review, and integration testing beyond the agentic workflow itself |
| Client process knowledge dependency | Functional consultant must deeply understand the client's domain process | Framework must extract and structure domain knowledge efficiently; cannot assume it is pre-documented |
| Nascent domain | Agentic workflow delivery is new; limited prior art for benchmarking or validation | Framework must be built from first principles informed by adjacent methodologies (Agile, design thinking, process mining, BPM) rather than copying existing standards |

## Success Criteria

### Definition of Success

The problem is solved when a consulting team with no prior agentic delivery experience can:

1. Pick up the methodology and execute a complete engagement from Impact Sizing through Production using only the frameworks and templates produced
2. Make confident go/no-go decisions at each phase gate using defined criteria rather than subjective judgment
3. Produce consistent deliverable quality across different enterprise processes and client contexts
4. Explain to clients at any point what phase they are in, what "done" looks like, and what evidence supports the current assessment of progress

### Key Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Framework specificity | Each phase has named frameworks with defined inputs, steps, outputs, and decision criteria | Generic activity descriptions are not teachable; specificity enables repeatability |
| Decision gate clarity | Each gate has 3-5 binary or threshold criteria that determine pass/fail | Ambiguous gates lead to scope creep and premature phase transitions |
| Template completeness | Every deliverable has a defined template with sections, expected content, and quality standard | Templates eliminate "blank page" problem and ensure consistency across engagements |
| Cross-process applicability | Frameworks function without modification across at least 3 distinct enterprise process domains (e.g., finance, supply chain, customer service) | A methodology that only works for one process type is not a methodology; it is a project plan |
| Concept concreteness | Each named concept (3 archetypes, 5 agent archetypes, A2A patterns, HITL patterns) has a precise definition with examples and selection criteria | Named but undefined concepts create the illusion of structure without enabling execution |

## Key Assumptions

| Assumption | Basis | Risk if Wrong |
|------------|-------|---------------|
| A phased model (linear with gates) is appropriate for agentic workflow delivery | User's initial thinking; analogy to software delivery lifecycles | If delivery is inherently iterative and non-linear, rigid phasing will create friction; may need hybrid approach |
| Two-person teams are sufficient for each phase | User's resource model | If complexity exceeds small-team capacity (especially in Design and Production), the framework needs explicit escalation or augmentation triggers |
| The 3 Agent-Human interaction archetypes and 5 agent archetypes are valid categorizations | User's initial conceptual model (not yet validated) | If these taxonomies are incomplete or overlapping, frameworks built on them will have gaps; validation required during problem-solving |
| Enterprise clients will accept a structured methodology with defined gates | Assumption based on enterprise preference for predictability | If clients demand more flexibility or resist structured approaches, adoption of the methodology itself becomes a barrier |
| Value stream mapping is the correct starting framework for Impact Sizing | User's stated approach | If alternative prioritization methods (e.g., process mining, complexity scoring) prove superior, the Impact Sizing framework may need redesign |

## Related Materials

- **Sibling problem**: `agent-native-org-transformation` (solved) — addresses enterprise-wide organizational transformation toward agent-native operating models. The present problem is narrower: it focuses on the consulting delivery methodology for individual agentic workflow implementations, which could be one component of the broader transformation roadmap.
- **Input files**: None provided beyond the user's initial phased model description.
- **Context grounding**: The user's initial thinking provides the structural skeleton (4 phases, resource profiles, key concepts). This problem seeks to add the analytical rigor, frameworks, and operational detail that transform a sketch into a playbook.

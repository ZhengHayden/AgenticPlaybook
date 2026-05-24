# H2: Design Methodology

**Parent**: `agentic-workflow-delivery/problem.md`

## Context

The parent problem seeks a complete delivery methodology for agentic workflow transformations. The Design phase (2 weeks) translates a prioritized workflow into an agent architecture — selecting agent types, defining interaction patterns, specifying skills and tools, and prototyping behavior. The parent hypothesis asserts that a closed taxonomy of agent archetypes and interaction patterns makes this phase teachable to non-expert consultants while producing architecturally sound designs.

This is the intellectual core of the methodology: where domain process knowledge meets technical architecture. The key challenge is making this translation structured enough to be repeatable without being so rigid that it cannot accommodate workflow diversity.

## Core Question

**What closed taxonomy of agent archetypes (proposed: 5 types) and interaction patterns (proposed: 3 Agent-Human modes), combined with what structured design method, enables a functional consultant and agentic architect to produce a testable agent architecture within a 2-week sprint?**

## Scope

**In Scope**:
- Concrete definition of the 5 agent archetypes with selection criteria, capabilities, and boundaries
- Concrete definition of the 3 Agent-Human interaction archetypes with selection criteria and design implications
- A2A (Agent-to-Agent) pattern taxonomy: coordination models between agents within a workflow
- HITL (Human-in-the-Loop) pattern taxonomy: when, how, and why humans intervene
- Structured design method: step-by-step process from prioritized workflow to agent architecture document
- Design deliverable template: what the architecture document contains and in what format
- Design phase decision gate: criteria for "ready for MVP" vs. "needs redesign"
- Role delineation: what the functional consultant does vs. what the agentic architect does

**Out of Scope**:
- Workflow selection and prioritization (handled by sibling: impact-sizing-framework)
- MVP testing and validation (handled by sibling: mvp-validation-protocol)
- Production deployment considerations (handled by sibling: production-deployment-framework)
- Specific technology or platform selection (methodology is platform-agnostic)
- Agent implementation details (code-level design is engineering work, not methodology)

## Success Criteria

- [ ] 5 agent archetypes are precisely defined with clear boundaries — any workflow step can be assigned to exactly one archetype
- [ ] 3 Agent-Human interaction archetypes cover all observed human-agent interaction patterns without gaps or overlaps
- [ ] A2A pattern taxonomy enables a functional consultant to select appropriate orchestration patterns without deep technical expertise
- [ ] HITL pattern taxonomy provides clear selection criteria for when and how human oversight is integrated
- [ ] Design method produces architecturally sound results (as judged by technical review) when executed by a non-expert following the method
- [ ] Design artifacts are specific enough to serve as unambiguous input to MVP development
- [ ] Complete design is achievable within 2 weeks (80 person-hours) with defined client input requirements

## Sub-Hypotheses to Test

### H2.1: Five agent archetypes provide adequate coverage for enterprise workflow patterns
- **Test**: Map 10+ real enterprise workflows against proposed archetypes; measure coverage; identify gaps
- **Data needed**: Archetype definitions from existing agent frameworks; enterprise workflow pattern catalogs; edge cases and boundary conditions

### H2.2: Three Agent-Human interaction archetypes capture the full interaction spectrum
- **Test**: Enumerate observed human-agent interaction patterns; verify clean mapping to 3 categories
- **Data needed**: HITL implementation surveys; interaction pattern taxonomies from adjacent fields; failure modes when wrong pattern is selected

### H2.3: A structured design method can produce testable architecture within 2 weeks
- **Test**: Define minimum viable design artifacts; estimate production time; validate against analogous design sprints
- **Data needed**: Required artifact list with complexity estimates; dependency mapping; minimum client input requirements

### H2.4: A2A pattern taxonomy enables correct orchestration design by non-technical practitioners
- **Test**: Assess whether functional consultants can select appropriate A2A patterns using taxonomy alone
- **Data needed**: A2A coordination pattern catalog; selection criteria; common failure modes; usability testing approaches

## Research Priorities

| Priority | Question | Why It Matters |
|----------|----------|----------------|
| Must | What agent archetype taxonomies exist in current literature and practice, and are 5 types sufficient? | Foundation of the entire design methodology |
| Must | What human-agent interaction patterns exist in production systems, and do they cluster into 3 natural categories? | Interaction pattern selection is highest-risk design decision for client acceptance |
| Must | What A2A coordination patterns exist (sequential, parallel, hierarchical, negotiation, etc.) and what are selection criteria? | Orchestration design determines system behavior |
| Should | How do design sprint methodologies (Google Ventures, service design) structure the translation from requirements to architecture? | Provides proven process patterns to adapt |
| Should | What makes agent architecture designs "testable" — what properties must the design specify for MVP validation? | Design-to-MVP handoff quality |
| Could | How do different enterprise domains (finance, supply chain, customer service) map differently to agent archetypes? | Cross-domain applicability |

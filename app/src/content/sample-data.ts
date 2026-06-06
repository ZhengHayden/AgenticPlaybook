import type { ArchetypeId } from "./archetypes";
import type { InteractionId } from "./interactions";
import type { A2APatternId } from "./a2a-patterns";
import type { ScreenCriterionId } from "./binary-screen";
import type { OdsIndicatorId, OrsIndicatorId, QuadrantId } from "./funnel-rubric";
import type { VmDimensionId, DecisionTypeId, RiskCategoryId, RiskLevel } from "./scoring-rubric";

export type Locale = "en" | "zh";
export type PhaseId = "impactSizing" | "design" | "mvp" | "production";

export interface ScreenAnswer {
  yes: boolean;
  evidence?: string;
  factValue?: string;
  mitigation?: string;
}

export type ScreenAnswers = Record<ScreenCriterionId, ScreenAnswer>;

export interface OdsScores {
  outputStructure: 0 | 1 | 2;
  correctnessVerifiability: 0 | 1 | 2;
  varianceTolerance: 0 | 1 | 2;
  groundTruth: 0 | 1 | 2;
}

export interface OrsScores {
  sponsorAuthority: 0 | 1 | 2;
  teamReceptivity: 0 | 1 | 2;
  integrationComplexity: 0 | 1 | 2;
  changeHistory: 0 | 1 | 2;
}

export interface OdsOrsRationale {
  ods: Partial<Record<OdsIndicatorId, string>>;
  ors: Partial<Record<OrsIndicatorId, string>>;
}

export type VmScores = Record<VmDimensionId, 1 | 2 | 3 | 4 | 5>;
export type DdiCounts = Record<DecisionTypeId, number>;
export type RiskAssessment = Record<RiskCategoryId, RiskLevel>;

/** The disposition chosen for a candidate during Impact-Sizing. */
export type SolutionProposal = "rpa" | "agent" | "legacy" | "defer";

/** Active prioritization grain for a project. Undefined ⇒ "workflow". */
export type ScoringMode = "workflow" | "useCase";

/**
 * A discrete agentic opportunity within a workflow (one workflow → 1…N).
 * Distinct from the cross-project KnowledgeUseCase in the Knowledge Library.
 * The Layer-3 scoring fields are present only once the use case has been scored.
 */
export interface ProjectUseCase {
  id: string;
  /** Parent workflow (the owning Candidate). */
  candidateId: string;
  name: string;
  description: string;
  /** Why this is worth doing — captured during the Readiness check. */
  impactRationale: string;
  expectedKpis?: string[];
  vm?: VmScores;
  ddi?: DdiCounts;
  totalSteps?: number;
  risk?: RiskAssessment;
  scoringNotes?: string;
  solutionProposal?: SolutionProposal;
  /** Reserved for a future Knowledge-Library link; no UI in v1. */
  knowledgeUseCaseId?: string;
}

/** Lifecycle status of a workflow as it moves through Design → Production. */
export type WorkflowStatus = "notStarted" | "inDesign" | "built" | "live" | "onHold";

/** Metadata for an uploaded SOP PDF (the file lives on the server filesystem). */
export interface SopFileRef {
  /** Original client filename (display only — never used for storage paths). */
  filename: string;
  /** Server-generated storage name (uuid.pdf) used to locate the file. */
  storedName: string;
  /** File size in bytes. */
  size: number;
  /** ISO timestamp of when the upload completed. */
  uploadedAt: string;
}

export interface Candidate {
  id: string;
  name: string;
  description: string;
  sourceSystem: string;
  volumePerMonth: number;
  pain: "low" | "med" | "high";
  screen: ScreenAnswers;
  ods: OdsScores;
  ors: OrsScores;
  rationale: OdsOrsRationale;
  vm: VmScores;
  ddi: DdiCounts;
  totalSteps: number;
  risk: RiskAssessment;
  scoringNotes?: string;
  recommendation: string;
  /** Free-text business function (e.g. "Accounts Payable"). */
  businessFunction?: string;
  /** Named owner accountable for the agent build. */
  agentOwner?: string;
  /** Named owner accountable for the underlying business process. */
  processOwner?: string;
  /** Target completion date as an ISO yyyy-mm-dd string. */
  targetCompletionDate?: string;
  /** Disposition decided during Impact-Sizing; drives Design eligibility. */
  solutionProposal?: SolutionProposal;
  /** Manually selected quadrant; when set, overrides the ODS/ORS-computed one. */
  quadrantOverride?: QuadrantId;
  /** Uploaded SOP PDF reference, if any. */
  sopFile?: SopFileRef;
  /**
   * Use-case ideas captured for this workflow. Scored individually when the
   * project is in "useCase" mode; documentation-only in "workflow" mode.
   */
  useCases?: ProjectUseCase[];
}

/** A named member of the engagement team shown on the project overview. */
export interface TeamMember {
  name: string;
  role: string;
}

/** When the human is brought into the loop relative to agent execution. */
export type HitlCheckpoint = "pre" | "post";

export interface HitlConfig {
  /** Where the human intervenes: before execution (approve) or after (review). */
  checkpoint?: HitlCheckpoint;
  /** Condition that surfaces the step to a human (e.g. "Variance > $1k"). */
  trigger?: string;
  /** Agent self-confidence (0–100) below which the step always escalates. */
  confidenceThreshold?: number;
  /** Response time the human review must meet (e.g. "4h business"). */
  sla?: string;
  /** Role that owns the review (e.g. "AP Controller"). */
  reviewer?: string;
  /** Escalation path if the SLA is breached (e.g. "Controller → CFO"). */
  escalation?: string;
}

export interface WorkflowStep {
  id: string;
  seq: number;
  name: string;
  description: string;
  inputs: string;
  outputs: string;
  decisionPoints: number;
  archetype?: ArchetypeId;
  archetypeRationale?: string;
  interactionMode?: InteractionId;
  interactionRationale?: string;
  failureCost?: "low" | "med" | "high";
  reversible?: boolean;
  hitl?: HitlConfig;
}

/** A step placed on the orchestration canvas at a free-form position. */
export interface CanvasNode {
  stepId: string;
  x: number;
  y: number;
}

/** A directed connection between two placed steps (by step id). */
export interface WorkflowEdge {
  id: string;
  from: string;
  to: string;
  label?: string;
}

/** Free-form orchestration diagram: a view-layer over the workflow's steps. */
export interface WorkflowCanvas {
  nodes: CanvasNode[];
  edges: WorkflowEdge[];
}

export interface Workflow {
  id: string;
  name: string;
  /** Origin Impact-Sizing candidate (drives the portfolio priority). */
  candidateId?: string;
  /** The use case this workflow was built from, in use-case scoring mode. */
  useCaseId?: string;
  description?: string;
  steps: WorkflowStep[];
  a2aPattern?: A2APatternId;
  architectureSummary?: string;
  /** Persisted orchestration canvas (node positions + edges). */
  canvas?: WorkflowCanvas;
  /** Lifecycle status; feeds MVP/Production phase KPIs. */
  status?: WorkflowStatus;
  /**
   * Explicit 1-based roadmap order override. When any workflow in a project
   * carries this, the Agentic Roadmap honors it instead of recomputing from the
   * candidate rubric. Optional — most projects leave it unset.
   */
  priorityRank?: number;
}

export interface GateCriterion {
  id: string;
  text: string;
  passed: boolean;
  evidence?: string;
  custom?: boolean;
}

export interface Project {
  id: string;
  name: string;
  client: string;
  domain: string;
  description?: string;
  language: Locale;
  p1Variant: "A" | "B" | "C";
  p2Variant: "A" | "B" | "C";
  status: "active" | "archived";
  updatedAt: Date;
  currentPhase: PhaseId;
  phaseProgress: Record<PhaseId, number>;
  /** Active prioritization grain; undefined ⇒ "workflow" (back-compat). */
  scoringMode?: ScoringMode;
  candidates: Candidate[];
  workflows: Workflow[];
  p1Gate: GateCriterion[];
  p2Gate: GateCriterion[];
  /** Engagement team members shown on the project overview. */
  team?: TeamMember[];
}

// ─── Sample data ──────────────────────────────────────────────

const now = new Date();
const hoursAgo = (h: number) => new Date(now.getTime() - h * 3600_000);

function ans(yes: boolean, opts: { evidence?: string; factValue?: string; mitigation?: string } = {}): ScreenAnswer {
  return { yes, ...opts };
}

export const sampleProjects: Project[] = [
  {
    id: "acme-finance-ap",
    name: "ACME Finance — AP Automation",
    client: "ACME Corp",
    domain: "Finance",
    language: "en",
    p1Variant: "C",
    p2Variant: "A",
    status: "active",
    updatedAt: hoursAgo(2),
    currentPhase: "impactSizing",
    phaseProgress: { impactSizing: 0.78, design: 0, mvp: 0, production: 0 },
    candidates: [
      {
        id: "c1",
        name: "AP Invoice Match",
        description: "3-way match of PO, GRN, and invoice; exception handling routed to AP analyst.",
        sourceSystem: "SAP S/4 + Coupa",
        volumePerMonth: 12000,
        pain: "high",
        screen: {
          documentability: ans(true, { evidence: "SOP updated Mar 2026; AP lead walked us through full flow in 90 min" }),
          dataAccessibility: ans(true, { evidence: "SAP S/4 + Coupa REST APIs fully documented" }),
          executionVolume: ans(true, { factValue: "12000", evidence: "12k invoices/mo confirmed via SAP report" }),
          processOwner: ans(true, { factValue: "Jane Doe, AP Lead", evidence: "Signed engagement charter; 6h/week allocated" }),
          outputQuality: ans(true, { evidence: "Match-result is deterministic (±$0.01); 18 months of golden samples in audit log" }),
          processStability: ans(true, { evidence: "Stable 3 years; no ERP migration planned through 2027" }),
        },
        ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 1, groundTruth: 2 },
        ors: { sponsorAuthority: 2, teamReceptivity: 2, integrationComplexity: 1, changeHistory: 2 },
        rationale: {
          ods: {
            outputStructure: "Fully structured journal entry + match result, fixed schema.",
            correctnessVerifiability: "Deterministic ±$0.01 tolerance; rule-checkable.",
            varianceTolerance: "Low — tolerances are bounded.",
            groundTruth: "18 months of approved postings as golden set.",
          },
          ors: {
            sponsorAuthority: "CFO mandate w/ allocated budget.",
            teamReceptivity: "AP team has been requesting automation for 2 years.",
            integrationComplexity: "2 systems (SAP, Coupa) with documented APIs.",
            changeHistory: "Successful expense automation deployed in 2025.",
          },
        },
        vm: { costSavings: 4, qualityImprovement: 4, speedImprovement: 4, strategicAlignment: 3 },
        ddi: { binary: 4, multi: 5, judgment: 3 },
        totalSteps: 4,
        risk: { implementation: "L", adoption: "L", compliance: "M", dependency: "L" },
        scoringNotes: "Solid candidate. Compliance risk medium due to SOX-relevant journal posts.",
        recommendation: "Proceed to Design",
      },
      {
        id: "c2",
        name: "Vendor Onboarding KYC",
        description: "Vendor onboarding with KYC and sanctions screening.",
        sourceSystem: "Coupa + LexisNexis",
        volumePerMonth: 1200,
        pain: "med",
        screen: {
          documentability: ans(true, { evidence: "SOP exists but last updated 18 months ago" }),
          dataAccessibility: ans(true, { evidence: "Coupa API + LexisNexis API both available" }),
          executionVolume: ans(true, { factValue: "1200" }),
          processOwner: ans(false, { mitigation: "Procurement director willing in principle but no time allocated — needs CFO escalation" }),
          outputQuality: ans(true, { evidence: "Pass/fail with 47 specific KYC rules" }),
          processStability: ans(true, { evidence: "Stable; new sanctions list updates are normal operations" }),
        },
        ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 0, groundTruth: 1 },
        ors: { sponsorAuthority: 0, teamReceptivity: 1, integrationComplexity: 1, changeHistory: 1 },
        rationale: {
          ods: {
            outputStructure: "Pass/fail per rule + structured rationale.",
            correctnessVerifiability: "47 explicit KYC rules.",
            varianceTolerance: "Zero — sanctions hits must be exact.",
            groundTruth: "Partial dataset; <50 labeled exceptions.",
          },
          ors: {
            sponsorAuthority: "Owner gap is blocking — flagged for CFO escalation.",
            teamReceptivity: "Compliance team is cautious; concerned about regulatory exposure.",
            integrationComplexity: "Two APIs, both vendor-hosted.",
            changeHistory: "One prior automation succeeded, one failed.",
          },
        },
        vm: { costSavings: 3, qualityImprovement: 3, speedImprovement: 3, strategicAlignment: 3 },
        ddi: { binary: 6, multi: 2, judgment: 1 },
        totalSteps: 5,
        risk: { implementation: "L", adoption: "H", compliance: "H", dependency: "M" },
        scoringNotes: "Sponsor & Align quadrant. Strong technical fit but adoption barrier requires change-management workstream.",
        recommendation: "Proceed with change pre-work",
      },
      {
        id: "c3",
        name: "Expense Audit",
        description: "Audit of T&E claims against policy with exception triage.",
        sourceSystem: "Concur",
        volumePerMonth: 8500,
        pain: "high",
        screen: {
          documentability: ans(true, { evidence: "Policy doc + audit playbook both current" }),
          dataAccessibility: ans(true, { evidence: "Concur API + receipt OCR output stream" }),
          executionVolume: ans(true, { factValue: "8500" }),
          processOwner: ans(true, { factValue: "Mike Chen, Audit Manager" }),
          outputQuality: ans(true, { evidence: "Policy violations are rule-based; subjective judgement only on borderline cases (~8%)" }),
          processStability: ans(true, { evidence: "Stable; new policy update was last September with no further changes planned" }),
        },
        ods: { outputStructure: 2, correctnessVerifiability: 1, varianceTolerance: 1, groundTruth: 2 },
        ors: { sponsorAuthority: 2, teamReceptivity: 2, integrationComplexity: 2, changeHistory: 1 },
        rationale: {
          ods: {
            outputStructure: "Structured violation report with category codes.",
            correctnessVerifiability: "Mix of rules and judgment — partially checkable.",
            varianceTolerance: "Low; categorization must be consistent.",
            groundTruth: "120 audited cases with reviewer disposition.",
          },
          ors: {
            sponsorAuthority: "Audit Manager has budget authority.",
            teamReceptivity: "Audit team eager — tedious work.",
            integrationComplexity: "Single system (Concur).",
            changeHistory: "One mid-success automation prior.",
          },
        },
        vm: { costSavings: 3, qualityImprovement: 4, speedImprovement: 4, strategicAlignment: 2 },
        ddi: { binary: 5, multi: 3, judgment: 2 },
        totalSteps: 5,
        risk: { implementation: "L", adoption: "L", compliance: "M", dependency: "L" },
        recommendation: "Proceed to Design",
      },
      {
        id: "c4",
        name: "Travel Expense Approval",
        description: "Manager approval of travel pre-bookings.",
        sourceSystem: "Concur",
        volumePerMonth: 6000,
        pain: "low",
        screen: {
          documentability: ans(false, { mitigation: "Process is implicit — no SOP. Would need 4+ hours to document. Recommend deferring until SOP exists." }),
          dataAccessibility: ans(true),
          executionVolume: ans(true, { factValue: "6000" }),
          processOwner: ans(false, { mitigation: "No single owner — distributed across 12 line managers" }),
          outputQuality: ans(false, { mitigation: "Approval is purely manager judgement; no articulable rules" }),
          processStability: ans(true),
        },
        ods: { outputStructure: 1, correctnessVerifiability: 0, varianceTolerance: 0, groundTruth: 0 },
        ors: { sponsorAuthority: 0, teamReceptivity: 1, integrationComplexity: 2, changeHistory: 0 },
        rationale: { ods: {}, ors: {} },
        vm: { costSavings: 1, qualityImprovement: 1, speedImprovement: 2, strategicAlignment: 1 },
        ddi: { binary: 1, multi: 0, judgment: 4 },
        totalSteps: 3,
        risk: { implementation: "H", adoption: "H", compliance: "L", dependency: "L" },
        recommendation: "Deprioritize — revisit later",
      },
      {
        id: "c5",
        name: "Bank Reconciliation",
        description: "Reconcile bank statements against GL across 14 entities.",
        sourceSystem: "SAP S/4 + Plaid",
        volumePerMonth: 30000,
        pain: "high",
        screen: {
          documentability: ans(true, { evidence: "Detailed runbook per entity" }),
          dataAccessibility: ans(true, { evidence: "Plaid + SAP APIs" }),
          executionVolume: ans(true, { factValue: "30000" }),
          processOwner: ans(true, { factValue: "Linda Park, Controller" }),
          outputQuality: ans(true, { evidence: "Match-or-flag is deterministic across 14 entities" }),
          processStability: ans(true, { evidence: "Reorg of 2 entities in Q3 but core process unchanged" }),
        },
        ods: { outputStructure: 2, correctnessVerifiability: 2, varianceTolerance: 1, groundTruth: 2 },
        ors: { sponsorAuthority: 2, teamReceptivity: 1, integrationComplexity: 1, changeHistory: 1 },
        rationale: { ods: {}, ors: {} },
        vm: { costSavings: 4, qualityImprovement: 3, speedImprovement: 4, strategicAlignment: 2 },
        ddi: { binary: 6, multi: 2, judgment: 1 },
        totalSteps: 4,
        risk: { implementation: "L", adoption: "M", compliance: "M", dependency: "L" },
        recommendation: "Proceed to Design",
      },
    ],
    workflows: [
      {
        id: "wf-ap-match",
        name: "AP Invoice Match",
        candidateId: "c1",
        a2aPattern: "pipeline",
        steps: [
      {
        id: "s1",
        seq: 1,
        name: "Receive invoice from vendor portal",
        description: "Poll vendor portal and webhook for new invoices.",
        inputs: "PDF / EDI invoice",
        outputs: "Parsed line items",
        decisionPoints: 1,
        archetype: "retriever",
        archetypeRationale: "Step pulls invoice data from an external source — fits Retriever pattern.",
        interactionMode: "autopilot",
        interactionRationale: "Low-risk ingestion; failure is reversible.",
      },
      {
        id: "s2",
        seq: 2,
        name: "Match against PO and GRN",
        description: "Apply 3-way match rules with tolerance bands.",
        inputs: "Invoice, PO, GRN",
        outputs: "Match-result + variance",
        decisionPoints: 3,
        archetype: "executor",
        archetypeRationale: "Rule-based action with deterministic outputs — Executor archetype.",
        interactionMode: "autopilot",
        interactionRationale: "Rule-based, reversible.",
      },
      {
        id: "s3",
        seq: 3,
        name: "Route exceptions to AP analyst",
        description: "Classify exception type and route to correct analyst queue.",
        inputs: "Match result, variance type, $ amount",
        outputs: "Routed ticket",
        decisionPoints: 4,
        archetype: "orchestrator",
        archetypeRationale: "Coordinates routing to one of 4 analyst queues based on variance type and dollar amount.",
        interactionMode: "copilot",
        interactionRationale: "Analyst reviews routing decisions for first 2 weeks.",
      },
      {
        id: "s4",
        seq: 4,
        name: "Post matched invoices to GL",
        description: "Create journal entries in SAP for clean-match invoices.",
        inputs: "Matched invoice batch",
        outputs: "GL journal entry",
        decisionPoints: 1,
        archetype: "executor",
        archetypeRationale: "Well-defined action with clear I/O.",
        interactionMode: "guardian",
        interactionRationale: "Posts are difficult to reverse — human sign-off required.",
      },
        ],
      },
    ],
    p1Gate: [
      { id: "g1-1", text: "At least one Quick Win candidate with PriorityScore ≥ 3.0", passed: true, evidence: "AP Invoice Match scored 4.36" },
      { id: "g1-2", text: "Top-3 ranking variance documented (inter-rater Cohen's κ ≥ 0.70)", passed: true, evidence: "κ = 0.81 on full candidate set" },
      { id: "g1-3", text: "Risk classifications approved by sponsor", passed: true, evidence: "Approved by Jane (CFO) on 2026-05-22" },
      { id: "g1-4", text: "Deliverable PDF generated and timestamped", passed: false },
      { id: "g1-5", text: "Top candidate selected for Design phase", passed: false },
    ],
    p2Gate: [
      { id: "g2-1", text: "Every workflow step has exactly one archetype assigned", passed: false },
      { id: "g2-2", text: "Every step has exactly one interaction mode assigned", passed: false },
      { id: "g2-3", text: "A2A pattern selected with dependency rationale", passed: false },
      { id: "g2-4", text: "Acceptance criteria written in Given/When/Then for each agent", passed: false },
      { id: "g2-5", text: "HITL checkpoints have SLA + escalation path", passed: false },
      { id: "g2-6", text: "Architecture passes technical review checklist (7 items)", passed: false },
    ],
  },
  {
    id: "globex-supply-returns",
    name: "Globex Supply Chain — Returns",
    client: "Globex Industries",
    domain: "Supply Chain",
    language: "en",
    p1Variant: "B",
    p2Variant: "B",
    status: "active",
    updatedAt: hoursAgo(28),
    currentPhase: "design",
    phaseProgress: { impactSizing: 1.0, design: 0.22, mvp: 0, production: 0 },
    candidates: [],
    workflows: [],
    p1Gate: [],
    p2Gate: [],
  },
];

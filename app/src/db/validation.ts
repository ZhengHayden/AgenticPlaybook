import { z } from "zod";

/**
 * Runtime validation for the API boundary. These schemas mirror the domain
 * interfaces in `src/content/sample-data.ts`. The interfaces remain the
 * canonical compile-time types; these schemas only guard untrusted input
 * (POST/PATCH bodies) before it reaches the repository.
 */

// ─── Scalar / id unions ───────────────────────────────────────
const localeSchema = z.enum(["en", "zh"]);
const phaseIdSchema = z.enum(["impactSizing", "design", "mvp", "production"]);
// Exported for reuse by the Knowledge library boundary (`db/knowledge-validation.ts`).
export const archetypeIdSchema = z.enum(["orchestrator", "executor", "analyst", "retriever", "evaluator"]);
export const interactionIdSchema = z.enum(["autopilot", "copilot", "guardian"]);
export const a2aPatternIdSchema = z.enum([
  "sequential",
  "pipeline",
  "parallel",
  "hierarchical",
  "negotiation",
  "broadcast",
]);
const riskLevelSchema = z.enum(["L", "M", "H"]);
const variantSchema = z.enum(["A", "B", "C"]);

const score012 = z.union([z.literal(0), z.literal(1), z.literal(2)]);
const score15 = z.union([z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5)]);

// ─── Sub-objects ──────────────────────────────────────────────
const screenAnswerSchema = z.object({
  yes: z.boolean(),
  evidence: z.string().optional(),
  factValue: z.string().optional(),
  mitigation: z.string().optional(),
});

const screenAnswersSchema = z.object({
  documentability: screenAnswerSchema,
  dataAccessibility: screenAnswerSchema,
  executionVolume: screenAnswerSchema,
  processOwner: screenAnswerSchema,
  outputQuality: screenAnswerSchema,
  processStability: screenAnswerSchema,
});

const odsScoresSchema = z.object({
  outputStructure: score012,
  correctnessVerifiability: score012,
  varianceTolerance: score012,
  groundTruth: score012,
});

const orsScoresSchema = z.object({
  sponsorAuthority: score012,
  teamReceptivity: score012,
  integrationComplexity: score012,
  changeHistory: score012,
});

// Rationale maps are partial free-text — keep the value validation loose.
const rationaleSchema = z.object({
  ods: z.record(z.string(), z.string()),
  ors: z.record(z.string(), z.string()),
});

const vmScoresSchema = z.object({
  costSavings: score15,
  qualityImprovement: score15,
  speedImprovement: score15,
  strategicAlignment: score15,
});

const ddiCountsSchema = z.object({
  binary: z.number().int().nonnegative(),
  multi: z.number().int().nonnegative(),
  judgment: z.number().int().nonnegative(),
});

const riskAssessmentSchema = z.object({
  implementation: riskLevelSchema,
  adoption: riskLevelSchema,
  compliance: riskLevelSchema,
  dependency: riskLevelSchema,
});

const solutionProposalSchema = z.enum(["rpa", "agent", "legacy", "defer"]);

const quadrantIdSchema = z.enum(["quickWin", "sponsorAlign", "investProve", "deferMature"]);

const sopFileSchema = z.object({
  filename: z.string(),
  storedName: z.string().min(1),
  size: z.number().nonnegative(),
  uploadedAt: z.string(),
});

const scoringModeSchema = z.enum(["workflow", "useCase"]);

const projectUseCaseSchema = z.object({
  id: z.string().min(1),
  candidateId: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  impactRationale: z.string(),
  expectedKpis: z.array(z.string()).optional(),
  vm: vmScoresSchema.optional(),
  ddi: ddiCountsSchema.optional(),
  totalSteps: z.number().int().positive().optional(),
  risk: riskAssessmentSchema.optional(),
  scoringNotes: z.string().optional(),
  solutionProposal: solutionProposalSchema.optional(),
  knowledgeUseCaseId: z.string().optional(),
});

const candidateSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  description: z.string(),
  sourceSystem: z.string(),
  volumePerMonth: z.number(),
  pain: z.enum(["low", "med", "high"]),
  screen: screenAnswersSchema,
  ods: odsScoresSchema,
  ors: orsScoresSchema,
  rationale: rationaleSchema,
  vm: vmScoresSchema,
  ddi: ddiCountsSchema,
  totalSteps: z.number(),
  risk: riskAssessmentSchema,
  scoringNotes: z.string().optional(),
  recommendation: z.string(),
  businessFunction: z.string().optional(),
  agentOwner: z.string().optional(),
  processOwner: z.string().optional(),
  targetCompletionDate: z.string().optional(),
  solutionProposal: solutionProposalSchema.optional(),
  quadrantOverride: quadrantIdSchema.optional(),
  sopFile: sopFileSchema.optional(),
  useCases: z.array(projectUseCaseSchema).optional(),
});

const teamMemberSchema = z.object({
  name: z.string(),
  role: z.string(),
});

const hitlConfigSchema = z.object({
  checkpoint: z.enum(["pre", "post"]).optional(),
  trigger: z.string().optional(),
  confidenceThreshold: z.number().min(0).max(100).optional(),
  sla: z.string().optional(),
  reviewer: z.string().optional(),
  escalation: z.string().optional(),
});

const workflowStepSchema = z.object({
  id: z.string().min(1),
  seq: z.number(),
  name: z.string(),
  description: z.string(),
  inputs: z.string(),
  outputs: z.string(),
  decisionPoints: z.number(),
  archetype: archetypeIdSchema.optional(),
  archetypeRationale: z.string().optional(),
  interactionMode: interactionIdSchema.optional(),
  interactionRationale: z.string().optional(),
  failureCost: z.enum(["low", "med", "high"]).optional(),
  reversible: z.boolean().optional(),
  hitl: hitlConfigSchema.optional(),
});

const canvasNodeSchema = z.object({
  stepId: z.string().min(1),
  x: z.number(),
  y: z.number(),
});

const workflowEdgeSchema = z.object({
  id: z.string().min(1),
  from: z.string().min(1),
  to: z.string().min(1),
  label: z.string().optional(),
});

const workflowCanvasSchema = z.object({
  nodes: z.array(canvasNodeSchema),
  edges: z.array(workflowEdgeSchema),
});

const workflowSchema = z.object({
  id: z.string().min(1),
  name: z.string(),
  candidateId: z.string().optional(),
  useCaseId: z.string().optional(),
  description: z.string().optional(),
  steps: z.array(workflowStepSchema),
  a2aPattern: a2aPatternIdSchema.optional(),
  architectureSummary: z.string().optional(),
  canvas: workflowCanvasSchema.optional(),
  status: z.enum(["notStarted", "inDesign", "built", "live", "onHold"]).optional(),
  priorityRank: z.number().int().positive().optional(),
});

const gateCriterionSchema = z.object({
  id: z.string().min(1),
  text: z.string(),
  passed: z.boolean(),
  evidence: z.string().optional(),
  custom: z.boolean().optional(),
});

const phaseProgressSchema = z.object({
  impactSizing: z.number(),
  design: z.number(),
  mvp: z.number(),
  production: z.number(),
});

/**
 * The persistable fields of a Project. `id` and `updatedAt` are managed by the
 * repository, so they are not part of the input schema.
 */
export const projectFieldsSchema = z.object({
  name: z.string().min(1),
  client: z.string(),
  domain: z.string(),
  description: z.string().optional(),
  language: localeSchema,
  p1Variant: variantSchema,
  p2Variant: variantSchema,
  status: z.enum(["active", "archived"]),
  currentPhase: phaseIdSchema,
  phaseProgress: phaseProgressSchema,
  scoringMode: scoringModeSchema.optional(),
  candidates: z.array(candidateSchema),
  workflows: z.array(workflowSchema),
  p1Gate: z.array(gateCriterionSchema),
  p2Gate: z.array(gateCriterionSchema),
  team: z.array(teamMemberSchema).optional(),
});

/** PATCH body: any subset of the editable fields. */
export const projectPatchSchema = projectFieldsSchema.partial();

/** POST body from the new-project wizard. The repo fills the rest with defaults. */
export const createProjectSchema = z.object({
  name: z.string().min(1),
  client: z.string().default(""),
  domain: z.string().default("Other"),
  language: localeSchema.default("en"),
  p1Variant: variantSchema.default("C"),
  p2Variant: variantSchema.default("A"),
});

export type ProjectPatchInput = z.infer<typeof projectPatchSchema>;
export type CreateProjectInput = z.infer<typeof createProjectSchema>;

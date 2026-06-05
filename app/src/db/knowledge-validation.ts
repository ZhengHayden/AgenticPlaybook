import { z } from "zod";
import { archetypeIdSchema, interactionIdSchema, a2aPatternIdSchema } from "./validation";

/**
 * Runtime validation for the Knowledge library API boundary. Mirrors the domain
 * interfaces in `src/content/knowledge.ts`; guards POST/PATCH bodies before they
 * reach the repository. The taxonomy is seed-only in v1, so only use-case
 * create/patch and the validation patch are validated here.
 */

const maturitySchema = z.enum(["proven", "emerging", "pilot"]);
const techTagSchema = z.enum(["AI/ML", "GenAI", "Analytics", "Optimization"]);
const validationStatusSchema = z.enum(["validated", "partial", "notYet"]);

const referenceSchema = z.object({
  name: z.string().min(1),
  detail: z.string(),
});

/** Editable fields of a use case. Parent ids are derived from `workflowId`. */
const useCaseFieldsSchema = z.object({
  workflowId: z.string().min(1),
  name: z.string().min(1),
  domain: z.string(),
  description: z.string(),
  kpis: z.array(z.string()),
  techTag: techTagSchema,
  maturity: maturitySchema,
  businessObjectives: z.array(z.string()),
  archetypes: z.array(archetypeIdSchema),
  interactionMode: interactionIdSchema.optional(),
  a2aPattern: a2aPatternIdSchema.optional(),
  references: z.array(referenceSchema),
  sponsors: z.string().optional(),
});

/** POST body: create a use case under an existing workflow. */
export const createUseCaseSchema = useCaseFieldsSchema;

/** PATCH body: any subset of the editable fields. */
export const updateUseCaseSchema = useCaseFieldsSchema.partial();

/** PATCH body for the inline validation control. */
export const validationPatchSchema = z.object({
  status: validationStatusSchema,
  note: z.string(),
});

export type CreateUseCaseInput = z.infer<typeof createUseCaseSchema>;
export type UpdateUseCaseInput = z.infer<typeof updateUseCaseSchema>;
export type ValidationPatchInput = z.infer<typeof validationPatchSchema>;

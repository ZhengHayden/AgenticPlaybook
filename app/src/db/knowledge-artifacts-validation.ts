import { z } from "zod";
import { ARTIFACT_TYPES, ARTIFACT_STATUSES } from "@/content/knowledge-artifacts";

const typeSchema = z.enum(ARTIFACT_TYPES as [string, ...string[]]);
const statusSchema = z.enum(ARTIFACT_STATUSES as [string, ...string[]]);

/** Shared metadata fields for create. */
const baseMeta = {
  title: z.string().min(1),
  type: typeSchema,
  status: statusSchema,
  owner: z.string().min(1),
  versionLabel: z.string().optional(),
  changeNote: z.string().optional(),
};

/** Link artifact create body (JSON). */
export const createLinkArtifactSchema = z.object({
  ...baseMeta,
  url: z.string().url(),
});

/** File artifact create — metadata fields parsed from multipart form values. */
export const createFileMetaSchema = z.object(baseMeta);

/** PATCH body: metadata changes and/or a status change; file replace is multipart. */
export const updateArtifactSchema = z
  .object({
    title: z.string().min(1).optional(),
    type: typeSchema.optional(),
    status: statusSchema.optional(),
    owner: z.string().min(1).optional(),
    versionLabel: z.string().optional(),
    url: z.string().url().optional(),
    changeNote: z.string().optional(),
  })
  .strict();

export type CreateLinkArtifactInput = z.infer<typeof createLinkArtifactSchema>;
export type CreateFileMetaInput = z.infer<typeof createFileMetaSchema>;
export type UpdateArtifactInput = z.infer<typeof updateArtifactSchema>;

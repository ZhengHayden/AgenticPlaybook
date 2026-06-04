import { z } from "zod";
import { functionMetaSchema, laborRowSchema } from "@/lib/scan/inputs";
import type { BenchmarkSnapshot } from "./types";

/**
 * Zod validation for the Benchmark Setting boundaries. Reuses the salary/ratio/
 * breakdown rules from `scanInputsSchema` (via the exported `laborRowSchema` and
 * `functionMetaSchema`) so the two layers never diverge.
 *
 * `createVersionSchema` validates an untrusted POST body. It deliberately OMITS
 * the server-set fields — `versionId`, `createdAt`, `companyKey` — which the
 * route generates/derives and never trusts from the client.
 */

const MAX_ROWS = 10_000;
const MAX_TEXT = 200;
const MAX_NAME = 120;

export const benchmarkSnapshotSchema = z.object({
  labor: z.array(laborRowSchema).max(MAX_ROWS),
  automation: z.record(z.string(), functionMetaSchema),
});

export const createVersionSchema = z.object({
  name: z.string().min(1).max(MAX_NAME),
  region: z.string().min(1).max(MAX_TEXT),
  sector: z.string().min(1).max(MAX_TEXT),
  source: z.enum(["edited", "uploaded"]),
  snapshot: benchmarkSnapshotSchema,
});

export type CreateVersionInput = z.infer<typeof createVersionSchema>;

/** Validate an untrusted snapshot payload; throws on failure. */
export function parseBenchmarkSnapshot(data: unknown): BenchmarkSnapshot {
  return benchmarkSnapshotSchema.parse(data) as BenchmarkSnapshot;
}

/** Validate an untrusted create-version body; throws on failure. */
export function parseCreateVersion(data: unknown): CreateVersionInput {
  return createVersionSchema.parse(data);
}

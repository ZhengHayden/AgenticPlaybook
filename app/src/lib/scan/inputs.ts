import { z } from "zod";
import type { FunctionMeta, HcRow, LaborRateRow, ScanInputs, ScanModel } from "./types";
import { computeScanModel } from "./compute-matrix";

/**
 * The editable input layer for an Opportunity Scan.
 *
 * `buildScanInputs` derives the persisted, already-aggregated rows from the
 * freshly parsed upload data; `recomputeFromInputs` folds an (edited) input set
 * back into a {@link ScanModel} via the same pure {@link computeScanModel};
 * `parseScanInputs` validates an untrusted PUT body at the API boundary.
 */

const MAX_CATEGORIES = 40;
const MAX_LEVELS = 30;
const MAX_ROWS = 10_000;
const MAX_TEXT = 200;

const ratio = z.number().min(0).max(1);
const percent = z.number().min(0).max(100);

export const laborRowSchema = z.object({
  functionKey: z.string().min(1),
  functionLabel: z.string().min(1),
  levelCode: z.string().min(1),
  salaryUsd: z.number().min(0),
});

const hcRowSchema = z.object({
  functionKey: z.string().min(1),
  functionLabel: z.string().min(1),
  bg: z.string().min(1),
  levelCode: z.string().min(1),
  fte: z.number().min(0),
});

const levelDetailSchema = z.object({
  levelCode: z.string().min(1),
  levelLabel: z.string().min(1),
  currentBreakdown: z.array(percent).max(MAX_CATEGORIES),
  targetBreakdown: z.array(percent).max(MAX_CATEGORIES),
  automationRatio: ratio,
  releasedRatio: ratio,
});

export const functionMetaSchema = z
  .object({
    functionKey: z.string().min(1),
    functionLabel: z.string().min(1),
    categories: z.array(z.object({ key: z.string().min(1), name: z.string().min(1) })).max(MAX_CATEGORIES),
    levels: z.array(levelDetailSchema).max(MAX_LEVELS),
    keyInsight: z.string().max(2000).optional(),
  })
  .refine(
    (m) =>
      m.levels.every(
        (l) =>
          l.currentBreakdown.length === m.categories.length &&
          l.targetBreakdown.length === m.categories.length,
      ),
    { message: "Work-content breakdowns must align with the function's categories" },
  );

/** Zod schema for an untrusted {@link ScanInputs} payload (PUT boundary). */
export const scanInputsSchema = z.object({
  company: z.string().min(1).max(MAX_TEXT),
  companyKey: z.string().min(1).max(MAX_TEXT),
  sector: z.string().min(1).max(MAX_TEXT),
  region: z.string().min(1).max(MAX_TEXT),
  laborRows: z.array(laborRowSchema).max(MAX_ROWS),
  hcRows: z.array(hcRowSchema).max(MAX_ROWS),
  automation: z.record(z.string(), functionMetaSchema),
});

/** Validate and narrow an untrusted body into {@link ScanInputs}; throws on failure. */
export function parseScanInputs(data: unknown): ScanInputs {
  return scanInputsSchema.parse(data) as ScanInputs;
}

/**
 * Derive the editable input layer from parsed upload rows. Labor rows are
 * deduped (salary averaged per function×level); HC rows are aggregated (FTE
 * summed per function×bg×level) so the stored form is exactly what compute folds.
 */
export function buildScanInputs(
  laborRows: ReadonlyArray<LaborRateRow>,
  hcRows: ReadonlyArray<HcRow>,
  automation: Readonly<Record<string, FunctionMeta>>,
  identity: { company: string; companyKey: string; sector: string; region: string },
): ScanInputs {
  return {
    company: identity.company,
    companyKey: identity.companyKey,
    sector: identity.sector,
    region: identity.region,
    laborRows: dedupeLaborRows(laborRows),
    hcRows: aggregateHcRows(hcRows),
    automation,
  };
}

/** Fold a (possibly edited) input set back into a {@link ScanModel}. */
export function recomputeFromInputs(inputs: ScanInputs, generatedAt: string): ScanModel {
  return computeScanModel(inputs.laborRows, inputs.hcRows, inputs.automation, generatedAt, {
    company: inputs.company,
    companyKey: inputs.companyKey,
    sector: inputs.sector,
    region: inputs.region,
  });
}

/** Average duplicate (function, level) salary lines into one row each. */
export function dedupeLaborRows(rows: ReadonlyArray<LaborRateRow>): LaborRateRow[] {
  const acc = new Map<string, { row: LaborRateRow; sum: number; count: number }>();
  for (const row of rows) {
    const key = `${row.functionKey}|${row.levelCode}`;
    const prev = acc.get(key);
    if (prev) {
      acc.set(key, { row: prev.row, sum: prev.sum + row.salaryUsd, count: prev.count + 1 });
    } else {
      acc.set(key, { row, sum: row.salaryUsd, count: 1 });
    }
  }
  return [...acc.values()].map(({ row, sum, count }) => ({ ...row, salaryUsd: count > 0 ? sum / count : 0 }));
}

/** Sum FTE per (function, bg, level) into one aggregated row each. */
function aggregateHcRows(rows: ReadonlyArray<HcRow>): HcRow[] {
  const acc = new Map<string, HcRow>();
  for (const row of rows) {
    const key = `${row.functionKey}|${row.bg}|${row.levelCode}`;
    const prev = acc.get(key);
    acc.set(key, prev ? { ...prev, fte: prev.fte + row.fte } : { ...row });
  }
  return [...acc.values()];
}

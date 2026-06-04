/**
 * Domain types for the Top-Down Scan feature.
 *
 * Three uploaded inputs (labor rate, headcount, automation potential) are parsed
 * into normalized rows, then folded into a single {@link ScanModel} — a
 * Function × BG impact matrix plus the per-function work-content detail that
 * powers the cell drill-down modal.
 *
 * Keys are canonicalized so the three files join despite label drift:
 *  - `functionKey` = function name upper-cased + trimmed.
 *  - `levelCode`   = the `L#` token (e.g. "L4") parsed from any level string.
 */

/** The three view modes the heatmap can render; cells carry a value for each. */
export type ScanMode = "usd" | "fte" | "baseline";

/** One row of the labor-rate workbook (Function × Level → salary, USD/yr). */
export interface LaborRateRow {
  functionKey: string;
  functionLabel: string;
  levelCode: string;
  salaryUsd: number;
}

/** One employee row of the headcount workbook (Function × BG × Level, FTE). */
export interface HcRow {
  functionKey: string;
  functionLabel: string;
  bg: string;
  levelCode: string;
  fte: number;
}

/** A single work-content activity category (e.g. "A" → "Documentation"). */
export interface ActivityCategory {
  /** The legend letter, e.g. "A". */
  key: string;
  /** Human-readable category name from the markdown legend. */
  name: string;
}

/** Per-(function, level) automation detail parsed from the markdown. */
export interface LevelDetail {
  levelCode: string;
  /** Display label for the level as written in the markdown, e.g. "L4 – Senior Engineer". */
  levelLabel: string;
  /** Current work-content split, aligned by index to the function's categories (percent, 0–100). */
  currentBreakdown: number[];
  /** Target (post-transformation) work-content split, aligned to categories (percent, 0–100). */
  targetBreakdown: number[];
  /** Share of work fully automatable (fraction, 0–1). */
  automationRatio: number;
  /** Share of capacity freed up — the "release capacity due to automation" (fraction, 0–1). */
  releasedRatio: number;
}

/** Everything the drill-down modal needs for one function. */
export interface FunctionMeta {
  functionKey: string;
  functionLabel: string;
  categories: ActivityCategory[];
  /** Per-level detail, ordered by level code; tabs in the modal map to these. */
  levels: LevelDetail[];
  /** Optional "Key insight" prose from the markdown (absent for some functions, e.g. QA/DQA). */
  keyInsight?: string;
}

/** One Function × BG cell, carrying a value for each view mode. */
export interface ScanCell {
  functionKey: string;
  bg: string;
  /** Annual labor cost released (USD/yr). */
  usdReleased: number;
  /** Released capacity expressed as FTE-equivalent (headcount). */
  fteReleased: number;
  /** Baseline headcount (FTE) in this Function × BG. */
  baselineHc: number;
}

/** The fully computed scan: matrix + per-function detail + provenance. */
export interface ScanModel {
  /** Display name of the scanned company/client, as entered in the wizard. */
  company: string;
  /** Canonical slug derived from {@link company}; the client-level join key. */
  companyKey: string;
  /** Industry sector code or free-text label chosen in the wizard. */
  sector: string;
  /** Geographic region label chosen in the wizard; selects benchmark defaults. */
  region: string;
  /** Ordered function row labels (display casing). */
  functions: { key: string; label: string }[];
  /** Ordered BG column labels. */
  bgs: string[];
  /** Function × BG cells (sparse-safe: every function×bg present, zero-filled). */
  cells: ScanCell[];
  /** Per-function work-content detail for the drill-down modal, keyed by functionKey. */
  detail: Record<string, FunctionMeta>;
  /** Grand totals across all cells, per mode. */
  totals: { usdReleased: number; fteReleased: number; baselineHc: number };
  /** Non-fatal data-quality notes (e.g. a (function, level) with no automation row). */
  warnings: string[];
  /** ISO timestamp when this scan was computed. */
  generatedAt: string;
}

/** Lightweight per-company record powering the `/scan` index (no matrix payload). */
export interface ScanManifest {
  companyKey: string;
  company: string;
  sector: string;
  region: string;
  generatedAt: string;
}

/**
 * The editable input layer that produces a {@link ScanModel}. Persisted next to
 * `model.json` so the dashboard can preview and edit the underlying numbers and
 * recompute, without re-uploading the source files.
 *
 * Rows are stored already-aggregated — one labor row per (functionKey, levelCode)
 * with salary averaged, one HC row per (functionKey, bg, levelCode) with FTE
 * summed — so feeding them back through {@link computeScanModel} round-trips exactly.
 */
export interface ScanInputs {
  company: string;
  companyKey: string;
  sector: string;
  region: string;
  /** Deduped labor rates: one row per (functionKey, levelCode). */
  laborRows: LaborRateRow[];
  /** Aggregated headcount: one row per (functionKey, bg, levelCode). */
  hcRows: HcRow[];
  /** Per-function work-content detail (categories, level breakdowns/ratios, insight). */
  automation: Record<string, FunctionMeta>;
}

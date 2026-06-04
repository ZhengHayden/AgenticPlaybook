/**
 * Domain types for the Benchmark Setting feature.
 *
 * A {@link BenchmarkSnapshot} captures the two *seedable* halves of a scan's
 * editable inputs — labor rate (per-FTE unit salaries) and automation potential
 * — keyed by region × sector. Shipped read-only defaults seed a new scan; a
 * company can save named, timestamped {@link BenchmarkVersion}s that override them.
 *
 * Note: `salaryUsd` here is the SAME per-FTE unit rate as `LaborRateRow.salaryUsd`.
 * Benchmarks never store a pre-multiplied total — totals are always derived by
 * `computeScanModel` (HC × salary × releasedRatio).
 */

import type { FunctionMeta, LaborRateRow } from "@/lib/scan/types";

/** The two seedable datasets for a (region, sector) pair. HC is never benchmarked. */
export interface BenchmarkSnapshot {
  /** Per-FTE unit salaries at the Function × Job-Grade grain. */
  labor: LaborRateRow[];
  /** Per-function work-content detail (categories, level breakdowns/ratios, insight). */
  automation: Record<string, FunctionMeta>;
}

/** How a company version was produced. */
export type BenchmarkSource = "edited" | "uploaded";

/** Lightweight version record (no snapshot payload) for the version dropdown. */
export interface BenchmarkVersionMeta {
  versionId: string;
  name: string;
  companyKey: string;
  region: string;
  sector: string;
  /** ISO timestamp; set server-side at save time. */
  createdAt: string;
  source: BenchmarkSource;
}

/** A full company-saved benchmark version. */
export interface BenchmarkVersion extends BenchmarkVersionMeta {
  snapshot: BenchmarkSnapshot;
}

/** Per-company index of saved versions (metadata only). */
export interface BenchmarkVersionIndex {
  versions: BenchmarkVersionMeta[];
}

/**
 * Shipped read-only benchmark defaults keyed by `"<region>|<sector>"`. Seeded
 * per-region from the {@link BASELINE_BENCHMARK} by scaling labor with a regional
 * cost index (automation is region-invariant). Sectors fall through to the
 * region-level default (`"<region>|ANY"`); unknown regions fall through to the
 * baseline — see `lib/benchmark/defaults.ts` for the lookup chain.
 */

import type { BenchmarkSnapshot } from "@/lib/benchmark/types";
import { REGIONS } from "@/lib/scan/regions";
import { BASELINE_BENCHMARK, scaleLabor } from "./baseline";

export { BASELINE_BENCHMARK };

/** Wildcard token for the sector half of a key (region-level default). */
export const ANY = "ANY";

/** Build the canonical lookup key for a (region, sector) pair. */
export function benchmarkKey(region: string, sector: string): string {
  return `${region}|${sector}`;
}

/** Regional cost-of-labor index relative to the NA baseline (keyed by region label). */
const REGION_COST_INDEX: Record<string, number> = {
  "North America": 1.0,
  Europe: 0.92,
  "Greater China": 0.45,
  "Asia-Pacific (ex-China)": 0.5,
  "Latin America": 0.4,
  "Middle East & Africa": 0.46,
};

/** Region-level defaults: `"<region>|ANY"` → cost-scaled baseline snapshot. */
export const DEFAULT_BENCHMARKS: Record<string, BenchmarkSnapshot> = Object.fromEntries(
  REGIONS.map((region) => {
    const costIndex = REGION_COST_INDEX[region.label] ?? 1.0;
    return [benchmarkKey(region.label, ANY), scaleLabor(BASELINE_BENCHMARK, costIndex)];
  }),
);

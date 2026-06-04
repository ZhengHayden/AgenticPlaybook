import type { BenchmarkSnapshot } from "./types";
import { ANY, BASELINE_BENCHMARK, DEFAULT_BENCHMARKS, benchmarkKey } from "@/content/benchmarks";

/**
 * Resolve the shipped read-only default benchmark for a (region, sector) pair.
 *
 * Fallback chain — first match wins, always non-empty:
 *   1. exact `"<region>|<sector>"`
 *   2. region-level `"<region>|ANY"`
 *   3. sector-level `"ANY|<sector>"`
 *   4. the NA-indexed {@link BASELINE_BENCHMARK}
 *
 * The returned snapshot is a shipped constant; callers must treat it as
 * read-only (company edits are saved as versions, never mutate the defaults).
 */
export function getDefaultBenchmark(region: string, sector: string): BenchmarkSnapshot {
  return (
    DEFAULT_BENCHMARKS[benchmarkKey(region, sector)] ??
    DEFAULT_BENCHMARKS[benchmarkKey(region, ANY)] ??
    DEFAULT_BENCHMARKS[benchmarkKey(ANY, sector)] ??
    BASELINE_BENCHMARK
  );
}

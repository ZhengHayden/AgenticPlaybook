/**
 * Integration check for the Benchmark Setting layer.
 *
 * Asserts the shipped defaults resolve for every region × sector (and unknown
 * combos via the fallback chain), that a default snapshot folds into a positive,
 * per-FTE-unit-rate scan model (doubling HC doubles USD released), that the
 * validation schema rejects out-of-range values, and that
 * `buildSnapshotFromUploads` with no uploads returns the fallback unchanged.
 *
 * Run with: `npm run benchmark:verify`
 */
import { getDefaultBenchmark } from "../src/lib/benchmark/defaults";
import { buildSnapshotFromUploads } from "../src/lib/benchmark/snapshot-from-uploads";
import { benchmarkSnapshotSchema } from "../src/lib/benchmark/schema";
import { BASELINE_BENCHMARK } from "../src/content/benchmarks";
import { REGIONS } from "../src/lib/scan/regions";
import { INDUSTRY_SECTORS } from "../src/lib/scan/sectors";
import { computeScanModel } from "../src/lib/scan/compute-matrix";
import type { HcRow } from "../src/lib/scan/types";

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`\n❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

/** Synthetic HC: one FTE bucket per (function, level) present in the snapshot's labor. */
function syntheticHc(labor: ReadonlyArray<{ functionKey: string; functionLabel: string; levelCode: string }>, fte: number): HcRow[] {
  return labor.map((row) => ({
    functionKey: row.functionKey,
    functionLabel: row.functionLabel,
    bg: "ALL",
    levelCode: row.levelCode,
    fte,
  }));
}

function main(): void {
  const generatedAt = new Date().toISOString();
  const identity = { company: "T", companyKey: "t", sector: "S", region: "North America" };

  // ---- 1. Every region × sector resolves to a non-empty snapshot ------------
  for (const region of REGIONS) {
    for (const sector of INDUSTRY_SECTORS) {
      const snap = getDefaultBenchmark(region.label, sector.label);
      assert(
        snap.labor.length > 0 && Object.keys(snap.automation).length > 0,
        `default non-empty for ${region.label} × ${sector.label}`,
      );
    }
  }
  // Unknown region & sector fall back to the baseline.
  const unknown = getDefaultBenchmark("Atlantis", "Time Travel");
  assert(unknown.labor.length === BASELINE_BENCHMARK.labor.length, "unknown region×sector falls back to baseline");

  // ---- 2. Default snapshot → positive model with per-FTE unit-rate semantics -
  const base = getDefaultBenchmark("North America", "Advanced Industries / Manufacturing");
  const model1 = computeScanModel(base.labor, syntheticHc(base.labor, 10), base.automation, generatedAt, identity);
  assert(model1.totals.usdReleased > 0, `default snapshot yields usdReleased > 0 (${model1.totals.usdReleased.toFixed(0)})`);

  const model2 = computeScanModel(base.labor, syntheticHc(base.labor, 20), base.automation, generatedAt, identity);
  const ratio = model2.totals.usdReleased / model1.totals.usdReleased;
  assert(Math.abs(ratio - 2) < 1e-6, `doubling HC doubles usdReleased (ratio=${ratio.toFixed(4)}) — unit-rate confirmed`);

  // ---- 3. Schema rejects out-of-range values --------------------------------
  const goodFn = base.automation[base.labor[0].functionKey];
  assert(benchmarkSnapshotSchema.safeParse(base).success, "valid default snapshot passes the schema");
  assert(
    !benchmarkSnapshotSchema.safeParse({ labor: [{ ...base.labor[0], salaryUsd: -1 }], automation: {} }).success,
    "schema rejects negative salaryUsd",
  );
  const badRatio = {
    labor: base.labor,
    automation: {
      [goodFn.functionKey]: {
        ...goodFn,
        levels: goodFn.levels.map((l, i) => (i === 0 ? { ...l, releasedRatio: 1.5 } : l)),
      },
    },
  };
  assert(!benchmarkSnapshotSchema.safeParse(badRatio).success, "schema rejects releasedRatio > 1");
  const badBreakdown = {
    labor: base.labor,
    automation: {
      [goodFn.functionKey]: {
        ...goodFn,
        levels: goodFn.levels.map((l, i) => (i === 0 ? { ...l, currentBreakdown: [...l.currentBreakdown, 5] } : l)),
      },
    },
  };
  assert(!benchmarkSnapshotSchema.safeParse(badBreakdown).success, "schema rejects breakdown length ≠ categories");

  // ---- 4. buildSnapshotFromUploads with no uploads == fallback --------------
  const passthrough = buildSnapshotFromUploads(base, undefined, undefined);
  assert(
    passthrough.labor === base.labor && passthrough.automation === base.automation,
    "buildSnapshotFromUploads(fallback, ∅, ∅) returns the fallback halves unchanged",
  );

  console.log("\n✅ benchmark:verify passed");
}

main();

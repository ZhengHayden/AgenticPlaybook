/**
 * Integration check for the Top-Down Scan pipeline.
 *
 * Parses the three bundled sample files in `data/`, folds them into a
 * ScanModel, and asserts the shape we expect (Function × BG matrix, positive
 * totals, parsed work-content for every function). Prints the top cells and one
 * function's drill-down detail so the join can be eyeballed.
 *
 * Run with: `npm run scan:verify`
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { parseLaborRate, parseHeadcount } from "../src/lib/scan/parse-xlsx";
import { parseAutomationMd } from "../src/lib/scan/parse-automation-md";
import { computeScanModel } from "../src/lib/scan/compute-matrix";

const DATA_DIR = path.resolve(process.cwd(), "data");
const LABOR_FILE = "Labor_rate.xlsx";
const HC_FILE = "HC_New.xlsx";
const MD_FILE = "automation-potential-analysis.md";

const USD_MN = 1_000_000;

function assert(condition: unknown, message: string): void {
  if (!condition) {
    console.error(`\n❌ FAIL: ${message}`);
    process.exit(1);
  }
  console.log(`✓ ${message}`);
}

function fmtUsd(usd: number): string {
  return `$${(usd / USD_MN).toFixed(2)}Mn`;
}

function main(): void {
  console.log(`Reading samples from ${DATA_DIR}\n`);

  const laborRows = parseLaborRate(readFileSync(path.join(DATA_DIR, LABOR_FILE)));
  const hcRows = parseHeadcount(readFileSync(path.join(DATA_DIR, HC_FILE)));
  const automation = parseAutomationMd(readFileSync(path.join(DATA_DIR, MD_FILE), "utf8"));

  console.log(
    `Parsed: ${laborRows.length} labor rows, ${hcRows.length} HC rows, ` +
      `${Object.keys(automation).length} automation functions\n`,
  );

  const model = computeScanModel(laborRows, hcRows, automation, new Date().toISOString(), {
    company: "Sample Co",
    companyKey: "sample-co",
    sector: "GEM (Global Energy & Materials)",
  });

  // ---- Assertions -----------------------------------------------------------
  console.log("Assertions:");
  assert(
    model.company === "Sample Co" && model.companyKey === "sample-co" && model.sector.length > 0,
    `model carries identity (company=${model.company}, key=${model.companyKey})`,
  );
  assert(model.functions.length > 0, `matrix has ${model.functions.length} function rows`);
  assert(model.bgs.length > 0, `matrix has ${model.bgs.length} BG columns (${model.bgs.join(", ")})`);
  assert(
    model.cells.length === model.functions.length * model.bgs.length,
    `dense grid: ${model.cells.length} cells = ${model.functions.length} × ${model.bgs.length}`,
  );
  assert(model.totals.usdReleased > 0, `total USD released > 0 (${fmtUsd(model.totals.usdReleased)})`);
  assert(model.totals.fteReleased > 0, `total released FTE > 0 (${model.totals.fteReleased.toFixed(0)})`);
  assert(model.totals.baselineHc > 0, `total baseline HC > 0 (${model.totals.baselineHc.toFixed(0)})`);
  assert(
    model.totals.baselineHc >= model.totals.fteReleased,
    "baseline HC >= released FTE (released is a subset of baseline)",
  );

  const functionsWithLevels = model.functions.filter((f) => (model.detail[f.key]?.levels.length ?? 0) > 0);
  assert(
    functionsWithLevels.length === model.functions.length,
    `every function has parsed breakdown rows (${functionsWithLevels.length}/${model.functions.length})`,
  );

  // ---- Top cells ------------------------------------------------------------
  console.log("\nTop 8 cells by USD released:");
  const top = [...model.cells].sort((a, b) => b.usdReleased - a.usdReleased).slice(0, 8);
  for (const c of top) {
    const pct = ((c.usdReleased / model.totals.usdReleased) * 100).toFixed(1);
    console.log(
      `  ${c.functionKey.padEnd(14)} ${c.bg.padEnd(10)} ${fmtUsd(c.usdReleased).padStart(9)} (${pct}%)  ` +
        `freedFTE=${c.fteReleased.toFixed(0)} baseHC=${c.baselineHc.toFixed(0)}`,
    );
  }

  // ---- One function drill-down ---------------------------------------------
  const drillKey = model.detail["R&D"] ? "R&D" : model.functions[0].key;
  const meta = model.detail[drillKey];
  console.log(`\nDrill-down: ${meta.functionLabel}`);
  console.log(`  Categories: ${meta.categories.map((c) => `${c.key}=${c.name}`).join(", ")}`);
  if (meta.keyInsight) console.log(`  Key insight: ${meta.keyInsight}`);
  for (const lvl of meta.levels) {
    console.log(
      `  ${lvl.levelLabel}\n` +
        `    Before: [${lvl.currentBreakdown.join(", ")}]\n` +
        `    After:  [${lvl.targetBreakdown.join(", ")}]\n` +
        `    Automation ${(lvl.automationRatio * 100).toFixed(0)}% | Freed-up ${(lvl.releasedRatio * 100).toFixed(0)}%`,
    );
  }

  // ---- Warnings -------------------------------------------------------------
  if (model.warnings.length > 0) {
    console.log(`\nWarnings (${model.warnings.length}):`);
    for (const w of model.warnings.slice(0, 20)) console.log(`  • ${w}`);
    if (model.warnings.length > 20) console.log(`  … and ${model.warnings.length - 20} more`);
  } else {
    console.log("\nNo warnings.");
  }

  console.log("\n✅ scan:verify passed");
}

main();

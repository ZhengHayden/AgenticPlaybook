import type {
  FunctionMeta,
  HcRow,
  LaborRateRow,
  LevelDetail,
  ScanCell,
  ScanModel,
} from "./types";
import { levelOrder } from "./normalize";

/**
 * Fold the three normalized inputs into a {@link ScanModel}.
 *
 * For every Function × BG cell:
 *   usdReleased = Σ_level  HC(fn,bg,level) × avgSalary(fn,level) × releasedRatio(fn,level)
 *   fteReleased = Σ_level  HC(fn,bg,level) × releasedRatio(fn,level)
 *   baselineHc  = Σ_level  HC(fn,bg,level)
 *
 * Joins on (functionKey, levelCode). Duplicate labor-rate rows are averaged.
 * Missing labor rate or automation rows degrade to 0 and are recorded in
 * `warnings` rather than throwing — the matrix is sparse-safe.
 *
 * Pure: no I/O, no clock. `generatedAt` and `identity` (company/sector keys)
 * are injected by the caller so the function stays deterministic and testable.
 */
export function computeScanModel(
  laborRows: ReadonlyArray<LaborRateRow>,
  hcRows: ReadonlyArray<HcRow>,
  automation: Readonly<Record<string, FunctionMeta>>,
  generatedAt: string,
  identity: { company: string; companyKey: string; sector: string },
): ScanModel {
  const avgSalary = buildAverageSalary(laborRows);
  const releasedRatioOf = (fnKey: string, levelCode: string): number | undefined =>
    automation[fnKey]?.levels.find((l) => l.levelCode === levelCode)?.releasedRatio;

  // Aggregate HC by function × bg × level, while collecting row/column labels.
  const hcByCell = new Map<string, number>(); // `fn|bg|level` → fte
  const functionLabels = new Map<string, string>(); // fnKey → display label (HC casing)
  const bgSet = new Set<string>();
  const cellAcc = new Map<string, ScanCell>(); // `fn|bg` → cell
  const warnings = new Set<string>();

  for (const row of hcRows) {
    if (!functionLabels.has(row.functionKey)) functionLabels.set(row.functionKey, row.functionLabel);
    bgSet.add(row.bg);
    const hcKey = `${row.functionKey}|${row.bg}|${row.levelCode}`;
    hcByCell.set(hcKey, (hcByCell.get(hcKey) ?? 0) + row.fte);
  }

  for (const [hcKey, hc] of hcByCell) {
    const [fnKey, bg, levelCode] = hcKey.split("|");
    const salary = avgSalary.get(`${fnKey}|${levelCode}`);
    const released = releasedRatioOf(fnKey, levelCode);

    if (salary === undefined) warnings.add(`No labor rate for ${fnKey} ${levelCode} — salary treated as 0`);
    if (released === undefined) warnings.add(`No automation data for ${fnKey} ${levelCode} — released treated as 0`);

    const salaryUsd = salary ?? 0;
    const releasedRatio = released ?? 0;

    const cellKey = `${fnKey}|${bg}`;
    const cell = cellAcc.get(cellKey) ?? { functionKey: fnKey, bg, usdReleased: 0, fteReleased: 0, baselineHc: 0 };
    cellAcc.set(cellKey, {
      ...cell,
      usdReleased: cell.usdReleased + hc * salaryUsd * releasedRatio,
      fteReleased: cell.fteReleased + hc * releasedRatio,
      baselineHc: cell.baselineHc + hc,
    });
  }

  // Order rows (functions) and columns (BGs) by total USD impact, descending.
  const usdByFunction = sumBy([...cellAcc.values()], (c) => c.functionKey, (c) => c.usdReleased);
  const usdByBg = sumBy([...cellAcc.values()], (c) => c.bg, (c) => c.usdReleased);

  const functions = [...functionLabels.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => (usdByFunction.get(b.key) ?? 0) - (usdByFunction.get(a.key) ?? 0));
  const bgs = [...bgSet].sort((a, b) => (usdByBg.get(b) ?? 0) - (usdByBg.get(a) ?? 0));

  // Materialize a dense grid (every function × bg present, zero-filled).
  const cells: ScanCell[] = [];
  for (const fn of functions) {
    for (const bg of bgs) {
      cells.push(
        cellAcc.get(`${fn.key}|${bg}`) ?? {
          functionKey: fn.key,
          bg,
          usdReleased: 0,
          fteReleased: 0,
          baselineHc: 0,
        },
      );
    }
  }

  const totals = cells.reduce(
    (acc, c) => ({
      usdReleased: acc.usdReleased + c.usdReleased,
      fteReleased: acc.fteReleased + c.fteReleased,
      baselineHc: acc.baselineHc + c.baselineHc,
    }),
    { usdReleased: 0, fteReleased: 0, baselineHc: 0 },
  );

  return {
    company: identity.company,
    companyKey: identity.companyKey,
    sector: identity.sector,
    functions,
    bgs,
    cells,
    detail: buildDetail(functions, automation, warnings),
    totals,
    warnings: [...warnings],
    generatedAt,
  };
}

/** Average duplicate (function, level) salary rows → Map<`fn|level`, salary>. */
function buildAverageSalary(laborRows: ReadonlyArray<LaborRateRow>): Map<string, number> {
  const acc = new Map<string, { sum: number; count: number }>();
  for (const row of laborRows) {
    const key = `${row.functionKey}|${row.levelCode}`;
    const prev = acc.get(key) ?? { sum: 0, count: 0 };
    acc.set(key, { sum: prev.sum + row.salaryUsd, count: prev.count + 1 });
  }
  const out = new Map<string, number>();
  for (const [key, { sum, count }] of acc) out.set(key, count > 0 ? sum / count : 0);
  return out;
}

/** Per-function detail for the modal, using HC display labels and sorted levels. */
function buildDetail(
  functions: ReadonlyArray<{ key: string; label: string }>,
  automation: Readonly<Record<string, FunctionMeta>>,
  warnings: Set<string>,
): Record<string, FunctionMeta> {
  const detail: Record<string, FunctionMeta> = {};
  for (const fn of functions) {
    const meta = automation[fn.key];
    if (!meta) {
      warnings.add(`No work-content breakdown for ${fn.key}`);
      detail[fn.key] = { functionKey: fn.key, functionLabel: fn.label, categories: [], levels: [] };
      continue;
    }
    const levels: LevelDetail[] = [...meta.levels].sort((a, b) => levelOrder(a.levelCode) - levelOrder(b.levelCode));
    detail[fn.key] = { ...meta, functionLabel: fn.label, levels };
  }
  return detail;
}

/** Sum `value(item)` grouped by `key(item)`. */
function sumBy<T>(
  items: ReadonlyArray<T>,
  key: (item: T) => string,
  value: (item: T) => number,
): Map<string, number> {
  const out = new Map<string, number>();
  for (const item of items) out.set(key(item), (out.get(key(item)) ?? 0) + value(item));
  return out;
}

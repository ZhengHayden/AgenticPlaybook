import type { ScanCell, ScanMode, ScanModel } from "./types";

/** Pure presentation helpers shared by the heatmap, modal, and client. */

const USD_MN = 1_000_000;

/** The cell's scalar for the active view mode. */
export function cellValue(cell: ScanCell, mode: ScanMode): number {
  switch (mode) {
    case "usd":
      return cell.usdReleased;
    case "fte":
      return cell.fteReleased;
    case "baseline":
      return cell.baselineHc;
  }
}

/** The grand total for the active mode. */
export function totalValue(totals: ScanModel["totals"], mode: ScanMode): number {
  switch (mode) {
    case "usd":
      return totals.usdReleased;
    case "fte":
      return totals.fteReleased;
    case "baseline":
      return totals.baselineHc;
  }
}

/** Format a mode value: USD as `$X.XMn`, headcount/FTE as a rounded count. */
export function formatValue(value: number, mode: ScanMode): string {
  if (mode === "usd") return `$${(value / USD_MN).toFixed(1)}Mn`;
  return Math.round(value).toLocaleString();
}

/** `value` as a percent of the grand total, e.g. "32.5%". Empty when total is 0. */
export function formatShare(value: number, total: number): string {
  if (total <= 0) return "";
  return `${((value / total) * 100).toFixed(1)}%`;
}

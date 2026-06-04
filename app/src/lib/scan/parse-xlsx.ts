import * as XLSX from "xlsx";
import type { HcRow, LaborRateRow } from "./types";
import { toFunctionKey, toLevelCode } from "./normalize";

/**
 * SheetJS-backed parsers for the two workbook inputs. Both read the first sheet
 * as an array-of-arrays so we can trim header cells ourselves — the real
 * headcount file ships a header with a leading space (" Job Level").
 *
 * Throws {@link ScanParseError} with a human-readable message on a missing
 * required column or empty sheet, so the API can surface it at the boundary.
 */

export class ScanParseError extends Error {}

interface SheetTable {
  headers: string[];
  rows: unknown[][];
}

/** Read the first worksheet of a workbook buffer into trimmed headers + data rows. */
function readFirstSheet(buffer: Buffer, label: string): SheetTable {
  let workbook: XLSX.WorkBook;
  try {
    workbook = XLSX.read(buffer, { type: "buffer" });
  } catch {
    throw new ScanParseError(`${label}: not a readable .xlsx workbook`);
  }
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) throw new ScanParseError(`${label}: workbook has no sheets`);

  const aoa = XLSX.utils.sheet_to_json<unknown[]>(workbook.Sheets[sheetName], {
    header: 1,
    blankrows: false,
  });
  if (aoa.length < 2) throw new ScanParseError(`${label}: sheet is empty`);

  const headers = (aoa[0] as unknown[]).map((h) => String(h ?? "").trim());
  return { headers, rows: aoa.slice(1) };
}

/** Find the index of the first header whose lowercased text includes `keyword`. */
function headerIndex(headers: string[], keyword: string): number {
  return headers.findIndex((h) => h.toLowerCase().includes(keyword));
}

/** Resolve a required column index or throw a clear boundary error. */
function requireColumn(headers: string[], keyword: string, label: string): number {
  const idx = headerIndex(headers, keyword);
  if (idx === -1) {
    throw new ScanParseError(
      `${label}: missing a '${keyword}' column (found: ${headers.join(", ")})`,
    );
  }
  return idx;
}

function toNumber(value: unknown): number {
  const n = typeof value === "number" ? value : Number(String(value ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

/**
 * Parse the labor-rate workbook → one row per (Function, Level) salary line.
 * Duplicate (function, level) pairs are preserved here; compute averages them.
 */
export function parseLaborRate(buffer: Buffer): LaborRateRow[] {
  const { headers, rows } = readFirstSheet(buffer, "Labor rate");
  const levelCol = requireColumn(headers, "job level", "Labor rate");
  const fnCol = requireColumn(headers, "function", "Labor rate");
  const salaryCol = requireColumn(headers, "salary", "Labor rate");

  const out: LaborRateRow[] = [];
  for (const row of rows) {
    const levelCode = toLevelCode(row[levelCol]);
    const functionLabel = String(row[fnCol] ?? "").trim();
    if (!levelCode || !functionLabel) continue;
    out.push({
      functionKey: toFunctionKey(functionLabel),
      functionLabel,
      levelCode,
      salaryUsd: toNumber(row[salaryCol]),
    });
  }
  if (out.length === 0) throw new ScanParseError("Labor rate: no usable rows");
  return out;
}

/**
 * Parse the headcount workbook → one normalized row per employee line
 * (Function × BG × Level, FTE). Compute aggregates these by summing FTE.
 */
export function parseHeadcount(buffer: Buffer): HcRow[] {
  const { headers, rows } = readFirstSheet(buffer, "Headcount");
  const levelCol = requireColumn(headers, "job level", "Headcount");
  const fnCol = requireColumn(headers, "function", "Headcount");
  const bgCol = requireColumn(headers, "bg", "Headcount");
  // FTE preferred; fall back to an aggregated "HC" column if present.
  const fteCol = headerIndex(headers, "fte") !== -1 ? headerIndex(headers, "fte") : headerIndex(headers, "hc");
  if (fteCol === -1) {
    throw new ScanParseError(`Headcount: missing an 'FTE' (or 'HC') column (found: ${headers.join(", ")})`);
  }

  const out: HcRow[] = [];
  for (const row of rows) {
    const levelCode = toLevelCode(row[levelCol]);
    const functionLabel = String(row[fnCol] ?? "").trim();
    const bg = String(row[bgCol] ?? "").trim();
    if (!levelCode || !functionLabel || !bg) continue;
    out.push({
      functionKey: toFunctionKey(functionLabel),
      functionLabel,
      bg,
      levelCode,
      fte: toNumber(row[fteCol]) || 1,
    });
  }
  if (out.length === 0) throw new ScanParseError("Headcount: no usable rows");
  return out;
}

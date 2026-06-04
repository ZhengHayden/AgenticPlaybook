import type { ActivityCategory, FunctionMeta, LevelDetail } from "./types";
import { stripParenthetical, toFunctionKey, toLevelCode } from "./normalize";

/**
 * Parse the automation-potential markdown into per-function detail.
 *
 * The document is a sequence of `## FUNCTION` sections, each with an
 * `### Activity Categories` legend (`A = Name (detail)`), a GFM table
 * (`Level | Current(A/B/…) | Target(A/B/…) | Automation Ratio | Released Ratio`),
 * and an optional `**Key insight**:` line. Non-function sections (Methodology,
 * Notes…) carry no level table and are skipped.
 *
 * Returns a record keyed by canonical function key (parenthetical stripped),
 * e.g. "QA (Quality Assurance)" → "QA".
 */

const CATEGORY_LINE = /^([A-Z])\s*=\s*(.+)$/;
const KEY_INSIGHT_LINE = /key insight\**\s*[:：]\s*(.+)$/i;

/** "25%" | "0.25" | "25" → fraction in [0,1]. */
function toRatio(raw: string): number {
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(n)) return 0;
  return n > 1 ? n / 100 : n;
}

/** "20/30/10/5/25/10" → [20,30,10,5,25,10] (percent values, 0–100). */
function toBreakdown(raw: string): number[] {
  return raw
    .split("/")
    .map((p) => Number(p.trim().replace(/[^0-9.]/g, "")))
    .map((n) => (Number.isFinite(n) ? n : 0));
}

/** Split a markdown table row "| a | b |" into trimmed cells. */
function tableCells(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((c) => c.trim());
}

function isTableRow(line: string): boolean {
  return line.trim().startsWith("|");
}

function isSeparatorRow(line: string): boolean {
  return /^\|?[\s:|-]+\|?$/.test(line.trim()) && line.includes("-");
}

interface TableColumns {
  level: number;
  current: number;
  target: number;
  automation: number;
  released: number;
}

/** Map the table header cells to column indices by keyword. */
function resolveColumns(headerCells: string[]): TableColumns | null {
  const find = (kw: string) => headerCells.findIndex((c) => c.toLowerCase().includes(kw));
  const cols: TableColumns = {
    level: find("level"),
    current: find("current"),
    target: find("target"),
    automation: find("automation"),
    released: find("released"),
  };
  const allFound = Object.values(cols).every((i) => i !== -1);
  return allFound ? cols : null;
}

function parseCategories(lines: string[]): ActivityCategory[] {
  const cats: ActivityCategory[] = [];
  for (const line of lines) {
    const m = line.trim().match(CATEGORY_LINE);
    if (m) cats.push({ key: m[1], name: m[2].trim() });
  }
  return cats;
}

function parseLevels(lines: string[]): LevelDetail[] {
  const levels: LevelDetail[] = [];
  let cols: TableColumns | null = null;

  for (const line of lines) {
    if (!isTableRow(line)) continue;
    if (isSeparatorRow(line)) continue;
    const cells = tableCells(line);

    if (!cols) {
      // First non-separator table row is the header.
      cols = resolveColumns(cells);
      continue;
    }

    const levelCode = toLevelCode(cells[cols.level]);
    if (!levelCode) continue;
    levels.push({
      levelCode,
      levelLabel: cells[cols.level],
      currentBreakdown: toBreakdown(cells[cols.current] ?? ""),
      targetBreakdown: toBreakdown(cells[cols.target] ?? ""),
      automationRatio: toRatio(cells[cols.automation] ?? ""),
      releasedRatio: toRatio(cells[cols.released] ?? ""),
    });
  }
  return levels;
}

function parseKeyInsight(lines: string[]): string | undefined {
  for (const line of lines) {
    const m = line.match(KEY_INSIGHT_LINE);
    if (m) return m[1].replace(/\*+/g, "").trim();
  }
  return undefined;
}

export function parseAutomationMd(markdown: string): Record<string, FunctionMeta> {
  const sections = markdown.split(/\n(?=##\s+)/);
  const result: Record<string, FunctionMeta> = {};

  for (const section of sections) {
    const headerMatch = section.match(/^##\s+(.+)$/m);
    if (!headerMatch) continue;
    const rawHeader = headerMatch[1].trim();
    const lines = section.split("\n");

    const levels = parseLevels(lines);
    if (levels.length === 0) continue; // skip Methodology / Notes — no level table

    const functionLabel = stripParenthetical(rawHeader);
    const functionKey = toFunctionKey(functionLabel);
    result[functionKey] = {
      functionKey,
      functionLabel,
      categories: parseCategories(lines),
      levels,
      keyInsight: parseKeyInsight(lines),
    };
  }

  return result;
}

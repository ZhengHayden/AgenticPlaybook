"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { HcRow } from "@/lib/scan/types";
import { levelOrder } from "@/lib/scan/normalize";
import { EditableGrid, type GridAxis } from "./editable-grid";

interface HeadcountEditorProps {
  rows: ReadonlyArray<HcRow>;
  onChange: (next: HcRow[]) => void;
}

const cellKey = (levelCode: string, bg: string): string => `${levelCode}|${bg}`;

const inputCls =
  "mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

/**
 * Headcount override editor: pick a function, then edit the aggregated FTE per
 * Job-Grade (rows) × Business-Group (cols) with read-only subtotals. Editing a
 * cell replaces the matching {@link HcRow}'s FTE immutably across the full set.
 */
export function HeadcountEditor({ rows, onChange }: HeadcountEditorProps) {
  const { t } = useLocale();

  const functions = useMemo<GridAxis[]>(() => {
    const seen = new Map<string, string>();
    for (const r of rows) if (!seen.has(r.functionKey)) seen.set(r.functionKey, r.functionLabel);
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [rows]);

  const [activeFn, setActiveFn] = useState<string>(functions[0]?.key ?? "");
  const selected = functions.some((f) => f.key === activeFn) ? activeFn : functions[0]?.key ?? "";

  const fnRows = useMemo(() => rows.filter((r) => r.functionKey === selected), [rows, selected]);

  const grades = useMemo<GridAxis[]>(() => {
    const seen = new Set<string>();
    for (const r of fnRows) seen.add(r.levelCode);
    return [...seen].sort((a, b) => levelOrder(a) - levelOrder(b)).map((code) => ({ key: code, label: code }));
  }, [fnRows]);

  const bgs = useMemo<GridAxis[]>(() => {
    const seen = new Set<string>();
    for (const r of fnRows) seen.add(r.bg);
    return [...seen].sort((a, b) => a.localeCompare(b)).map((bg) => ({ key: bg, label: bg }));
  }, [fnRows]);

  const byCell = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of fnRows) map.set(cellKey(r.levelCode, r.bg), r.fte);
    return map;
  }, [fnRows]);

  const valueAt = (levelCode: string, bg: string): number | undefined => byCell.get(cellKey(levelCode, bg));

  const handleChange = (levelCode: string, bg: string, value: number) => {
    const safe = Number.isFinite(value) && value >= 0 ? value : 0;
    onChange(
      rows.map((r) =>
        r.functionKey === selected && r.levelCode === levelCode && r.bg === bg ? { ...r, fte: safe } : r,
      ),
    );
  };

  return (
    <div className="space-y-3">
      <label className="block text-xs text-zinc-500">
        {t.scan.selectFunction}
        <select value={selected} onChange={(e) => setActiveFn(e.target.value)} className={`${inputCls} block`}>
          {functions.map((f) => (
            <option key={f.key} value={f.key}>
              {f.label}
            </option>
          ))}
        </select>
      </label>
      {grades.length > 0 && bgs.length > 0 ? (
        <EditableGrid
          cornerLabel={t.scan.jobGrade}
          rows={grades}
          cols={bgs}
          valueAt={valueAt}
          onCellChange={handleChange}
          showSubtotals
          subtotalLabel={t.scan.subtotal}
          step={1}
        />
      ) : (
        <p className="text-sm text-zinc-400">—</p>
      )}
    </div>
  );
}

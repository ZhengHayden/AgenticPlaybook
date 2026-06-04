"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import type { LaborRateRow } from "@/lib/scan/types";
import { levelOrder } from "@/lib/scan/normalize";
import { EditableGrid, type GridAxis } from "./editable-grid";

interface LaborRateEditorProps {
  rows: ReadonlyArray<LaborRateRow>;
  onChange: (next: LaborRateRow[]) => void;
}

const cellKey = (functionKey: string, levelCode: string): string => `${functionKey}|${levelCode}`;

/**
 * Function (rows) × Job-Grade (cols) pivot of editable salaries. Each cell maps
 * to one {@link LaborRateRow}; editing a cell replaces that row's salary
 * immutably and emits the full next row set.
 */
export function LaborRateEditor({ rows, onChange }: LaborRateEditorProps) {
  const { t } = useLocale();

  const functions = useMemo<GridAxis[]>(() => {
    const seen = new Map<string, string>();
    for (const r of rows) if (!seen.has(r.functionKey)) seen.set(r.functionKey, r.functionLabel);
    return [...seen.entries()].map(([key, label]) => ({ key, label }));
  }, [rows]);

  const grades = useMemo<GridAxis[]>(() => {
    const seen = new Set<string>();
    for (const r of rows) seen.add(r.levelCode);
    return [...seen]
      .sort((a, b) => levelOrder(a) - levelOrder(b))
      .map((code) => ({ key: code, label: code }));
  }, [rows]);

  const byCell = useMemo(() => {
    const map = new Map<string, number>();
    for (const r of rows) map.set(cellKey(r.functionKey, r.levelCode), r.salaryUsd);
    return map;
  }, [rows]);

  const valueAt = (functionKey: string, levelCode: string): number | undefined =>
    byCell.get(cellKey(functionKey, levelCode));

  const handleChange = (functionKey: string, levelCode: string, value: number) => {
    const safe = Number.isFinite(value) && value >= 0 ? value : 0;
    onChange(
      rows.map((r) =>
        r.functionKey === functionKey && r.levelCode === levelCode ? { ...r, salaryUsd: safe } : r,
      ),
    );
  };

  return (
    <div className="space-y-2">
      <p className="text-xs text-zinc-500">{t.scan.salaryUsd}</p>
      <EditableGrid
        cornerLabel={t.scan.function}
        rows={functions}
        cols={grades}
        valueAt={valueAt}
        onCellChange={handleChange}
        step={1000}
      />
    </div>
  );
}

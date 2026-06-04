"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ScanMode, ScanModel } from "@/lib/scan/types";
import { cellValue, formatShare, formatValue, totalValue } from "@/lib/scan/format";

interface HeatmapProps {
  model: ScanModel;
  mode: ScanMode;
  onCellClick: (functionKey: string) => void;
}

/** indigo-600 as RGB, for the intensity ramp. */
const RAMP_RGB = "79, 70, 229";

/** Background + text style for a cell, scaled by its share of the max cell. */
function cellStyle(ratio: number): React.CSSProperties {
  const alpha = ratio <= 0 ? 0 : 0.1 + ratio * 0.85;
  return {
    backgroundColor: `rgba(${RAMP_RGB}, ${alpha})`,
    color: ratio > 0.55 ? "white" : undefined,
  };
}

export function Heatmap({ model, mode, onCellClick }: HeatmapProps) {
  const { t } = useLocale();

  const { cellByKey, rowTotals, colTotals, maxCell, grandTotal } = useMemo(() => {
    const cellByKey = new Map(model.cells.map((c) => [`${c.functionKey}|${c.bg}`, c]));
    const rowTotals = new Map<string, number>();
    const colTotals = new Map<string, number>();
    let maxCell = 0;
    for (const c of model.cells) {
      const v = cellValue(c, mode);
      rowTotals.set(c.functionKey, (rowTotals.get(c.functionKey) ?? 0) + v);
      colTotals.set(c.bg, (colTotals.get(c.bg) ?? 0) + v);
      if (v > maxCell) maxCell = v;
    }
    return { cellByKey, rowTotals, colTotals, maxCell, grandTotal: totalValue(model.totals, mode) };
  }, [model, mode]);

  // function-label column + one column per BG + a Total column.
  const gridCols = `minmax(9rem, 1.4fr) repeat(${model.bgs.length}, minmax(5rem, 1fr)) minmax(5rem, 0.9fr)`;
  const headCls = "px-2 py-2 text-xs font-semibold text-zinc-500 dark:text-zinc-400";

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[640px]">
        {/* Header row */}
        <div className="grid items-stretch border-b border-zinc-200 dark:border-zinc-800" style={{ gridTemplateColumns: gridCols }}>
          <div className={`${headCls} text-left`}>{t.scan.function}</div>
          {model.bgs.map((bg) => (
            <div key={bg} className={`${headCls} text-center`}>
              {bg}
            </div>
          ))}
          <div className={`${headCls} text-center`}>{t.scan.total}</div>
        </div>

        {/* Function rows */}
        {model.functions.map((fn) => {
          const rowTotal = rowTotals.get(fn.key) ?? 0;
          return (
            <div
              key={fn.key}
              className="grid items-stretch border-b border-zinc-100 dark:border-zinc-900"
              style={{ gridTemplateColumns: gridCols }}
            >
              <button
                type="button"
                onClick={() => onCellClick(fn.key)}
                className="px-2 py-2 text-left text-sm font-medium text-zinc-800 hover:text-indigo-600 dark:text-zinc-200"
              >
                {fn.label}
              </button>
              {model.bgs.map((bg) => {
                const cell = cellByKey.get(`${fn.key}|${bg}`);
                const v = cell ? cellValue(cell, mode) : 0;
                const ratio = maxCell > 0 ? v / maxCell : 0;
                return (
                  <button
                    key={bg}
                    type="button"
                    onClick={() => onCellClick(fn.key)}
                    className="flex flex-col items-center justify-center border-l border-white/40 px-1 py-2 text-center transition-colors dark:border-zinc-900"
                    style={cellStyle(ratio)}
                    title={`${fn.label} × ${bg}`}
                  >
                    <span className="text-xs font-semibold tabular-nums">{v > 0 ? formatValue(v, mode) : "—"}</span>
                    {v > 0 && (
                      <span className="text-[10px] opacity-80 tabular-nums">{formatShare(v, grandTotal)}</span>
                    )}
                  </button>
                );
              })}
              <div className="flex flex-col items-center justify-center border-l border-zinc-200 px-1 py-2 text-center dark:border-zinc-800">
                <span className="text-xs font-semibold tabular-nums">{formatValue(rowTotal, mode)}</span>
                <span className="text-[10px] text-zinc-500 tabular-nums">{formatShare(rowTotal, grandTotal)}</span>
              </div>
            </div>
          );
        })}

        {/* Total row */}
        <div
          className="grid items-stretch border-t-2 border-zinc-300 bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900/60"
          style={{ gridTemplateColumns: gridCols }}
        >
          <div className="px-2 py-2 text-left text-sm font-semibold">{t.scan.total}</div>
          {model.bgs.map((bg) => (
            <div key={bg} className="flex flex-col items-center justify-center px-1 py-2 text-center">
              <span className="text-xs font-semibold tabular-nums">{formatValue(colTotals.get(bg) ?? 0, mode)}</span>
              <span className="text-[10px] text-zinc-500 tabular-nums">{formatShare(colTotals.get(bg) ?? 0, grandTotal)}</span>
            </div>
          ))}
          <div className="flex items-center justify-center px-1 py-2 text-center">
            <span className="text-xs font-bold tabular-nums">{formatValue(grandTotal, mode)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

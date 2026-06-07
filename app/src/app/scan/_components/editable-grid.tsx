"use client";

/**
 * Shared numeric pivot-grid primitive for the data editors. Renders an editable
 * `<input type="number">` for every (row, col) cell that carries a value, a muted
 * placeholder where none exists, and optional read-only row/column/grand subtotals.
 * Used by both the labor-rate and headcount editors so the pivot markup lives once.
 */

export interface GridAxis {
  key: string;
  label: string;
}

interface EditableGridProps {
  /** Top-left corner label (names the row dimension). */
  cornerLabel: string;
  rows: ReadonlyArray<GridAxis>;
  cols: ReadonlyArray<GridAxis>;
  /** Current cell value, or undefined when the (row, col) pairing has no cell. */
  valueAt: (rowKey: string, colKey: string) => number | undefined;
  onCellChange: (rowKey: string, colKey: string, value: number) => void;
  /** When set, append read-only row/column/grand subtotals computed from cell values. */
  showSubtotals?: boolean;
  subtotalLabel?: string;
  /** Formats subtotal values for display; defaults to a rounded integer with separators. */
  formatTotal?: (n: number) => string;
  /** Step for the number inputs (e.g. 1 for FTE, 1000 for salary). */
  step?: number;
}

const defaultFormat = (n: number): string => Math.round(n).toLocaleString();

const headerCls = "px-2 py-1.5 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const cellInputCls =
  "w-24 rounded border border-slate-200 bg-white px-2 py-1 text-right text-sm tabular-nums dark:border-slate-700 dark:bg-slate-950";
const totalCls = "px-2 py-1 text-right text-sm font-semibold tabular-nums text-slate-700 dark:text-slate-300";

export function EditableGrid({
  cornerLabel,
  rows,
  cols,
  valueAt,
  onCellChange,
  showSubtotals = false,
  subtotalLabel = "Subtotal",
  formatTotal = defaultFormat,
  step = 1,
}: EditableGridProps) {
  const colTotal = (colKey: string): number =>
    rows.reduce((acc, r) => acc + (valueAt(r.key, colKey) ?? 0), 0);
  const rowTotal = (rowKey: string): number =>
    cols.reduce((acc, c) => acc + (valueAt(rowKey, c.key) ?? 0), 0);
  const grandTotal = (): number => rows.reduce((acc, r) => acc + rowTotal(r.key), 0);

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-separate border-spacing-0">
        <thead>
          <tr>
            <th className={`${headerCls} sticky left-0 bg-white dark:bg-slate-900`}>{cornerLabel}</th>
            {cols.map((c) => (
              <th key={c.key} className={`${headerCls} text-right`}>
                {c.label}
              </th>
            ))}
            {showSubtotals && <th className={`${headerCls} text-right`}>{subtotalLabel}</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.key} className="border-t border-slate-100 dark:border-slate-800">
              <th className="sticky left-0 bg-white px-2 py-1 text-left text-sm font-medium dark:bg-slate-900">
                {r.label}
              </th>
              {cols.map((c) => {
                const value = valueAt(r.key, c.key);
                return (
                  <td key={c.key} className="px-1 py-1 text-right">
                    {value === undefined ? (
                      <span className="text-sm text-slate-300 dark:text-slate-600">—</span>
                    ) : (
                      <input
                        type="number"
                        min={0}
                        step={step}
                        value={value}
                        onChange={(e) => onCellChange(r.key, c.key, Number(e.target.value))}
                        className={cellInputCls}
                        aria-label={`${r.label} · ${c.label}`}
                      />
                    )}
                  </td>
                );
              })}
              {showSubtotals && <td className={totalCls}>{formatTotal(rowTotal(r.key))}</td>}
            </tr>
          ))}
          {showSubtotals && (
            <tr className="border-t-2 border-slate-200 dark:border-slate-700">
              <th className="sticky left-0 bg-white px-2 py-1 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900">
                {subtotalLabel}
              </th>
              {cols.map((c) => (
                <td key={c.key} className={totalCls}>
                  {formatTotal(colTotal(c.key))}
                </td>
              ))}
              <td className={`${totalCls} text-brand-700 dark:text-brand-300`}>{formatTotal(grandTotal())}</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

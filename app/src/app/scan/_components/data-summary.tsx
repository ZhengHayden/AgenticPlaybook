"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import { StatCard } from "@/components/ui/stat-card";
import type { ScanModel } from "@/lib/scan/types";

interface DataSummaryProps {
  model: ScanModel;
}

/** Top-N functions shown in the per-function headcount bar. */
const TOP_FUNCTIONS = 8;

/** One labeled horizontal bar (value as a share of the row max). */
interface BarRow {
  label: string;
  value: number;
}

function HBarList({ rows }: { rows: ReadonlyArray<BarRow> }) {
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0);
  return (
    <div className="space-y-1.5">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center gap-2">
          <span className="w-28 shrink-0 truncate text-xs text-slate-500" title={r.label}>
            {r.label}
          </span>
          <div className="h-4 flex-1 overflow-hidden rounded-sm bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-sm bg-brand-600/80"
              style={{ width: max > 0 ? `${(r.value / max) * 100}%` : "0%" }}
            />
          </div>
          <span className="w-14 shrink-0 text-right text-xs tabular-nums text-slate-600 dark:text-slate-300">
            {Math.round(r.value).toLocaleString()}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * The "data preview" shown before the heatmap is plotted: headline KPIs plus
 * pure-CSS headcount breakdowns. Everything is derived from the already-computed
 * {@link ScanModel} — no extra request or parsing.
 */
export function DataSummary({ model }: DataSummaryProps) {
  const { t } = useLocale();

  const { hcByBg, hcByFunction, withInsight, avgReleased } = useMemo(() => {
    const byBg = new Map<string, number>();
    const byFn = new Map<string, number>();
    for (const c of model.cells) {
      byBg.set(c.bg, (byBg.get(c.bg) ?? 0) + c.baselineHc);
      byFn.set(c.functionKey, (byFn.get(c.functionKey) ?? 0) + c.baselineHc);
    }
    const labelOf = new Map(model.functions.map((f) => [f.key, f.label]));
    const hcByFunction: BarRow[] = [...byFn.entries()]
      .map(([key, value]) => ({ label: labelOf.get(key) ?? key, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, TOP_FUNCTIONS);
    const hcByBg: BarRow[] = model.bgs.map((bg) => ({ label: bg, value: byBg.get(bg) ?? 0 }));
    const withInsight = Object.values(model.detail).filter((d) => d.keyInsight).length;
    const avgReleased = model.totals.baselineHc > 0 ? model.totals.fteReleased / model.totals.baselineHc : 0;
    return { hcByBg, hcByFunction, withInsight, avgReleased };
  }, [model]);

  const kpis: { label: string; value: string }[] = [
    { label: t.scan.kpiBaselineHc, value: Math.round(model.totals.baselineHc).toLocaleString() },
    { label: t.scan.kpiFunctions, value: String(model.functions.length) },
    { label: t.scan.kpiBgs, value: String(model.bgs.length) },
    { label: t.scan.kpiReleasedFte, value: Math.round(model.totals.fteReleased).toLocaleString() },
    { label: t.scan.kpiUsdReleased, value: `$${(model.totals.usdReleased / 1_000_000).toFixed(1)}Mn` },
    { label: t.scan.kpiAvgReleased, value: `${(avgReleased * 100).toFixed(1)}%` },
  ];

  const cardCls = "rounded-md border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900";

  return (
    <section className="space-y-4">
      <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t.scan.dataSummary}</h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {kpis.map((k) => (
          <StatCard key={k.label} label={k.label} value={k.value} />
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cardCls}>
          <h3 className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{t.scan.hcByBg}</h3>
          <HBarList rows={hcByBg} />
        </div>
        <div className={cardCls}>
          <h3 className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-400">{t.scan.hcByFunction}</h3>
          <HBarList rows={hcByFunction} />
        </div>
      </div>

      <p className="text-xs text-slate-500">
        {t.scan.coverage}: {withInsight} {t.scan.functionsWithInsight}.
      </p>
    </section>
  );
}

"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { FunctionMeta, LevelDetail } from "@/lib/scan/types";
import { Button } from "@/components/ui/button";
import { SegTabs } from "@/components/ui/seg-tabs";
import { StackedBar, type BarSegment } from "./stacked-bar";

interface FunctionDetailModalProps {
  meta: FunctionMeta;
  onClose: () => void;
}

/** Category fill colors, indexed by the category's position in the legend. */
const CATEGORY_COLORS = [
  "bg-brand-600",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-violet-500",
  "bg-teal-500",
  "bg-orange-500",
];
const FREED_COLOR = "bg-slate-400 dark:bg-slate-600";

function sum(values: ReadonlyArray<number>): number {
  return values.reduce((acc, n) => acc + n, 0);
}

/** Normalized category share (percent of the work content), guarding empty rows. */
function share(value: number, total: number): number {
  return total > 0 ? (value / total) * 100 : 0;
}

/** Before-bar segments: the current work-content split scaled to a full bar. */
function buildBeforeSegments(level: LevelDetail, categoryNames: string[]): BarSegment[] {
  const total = sum(level.currentBreakdown);
  return categoryNames.map((name, i) => ({
    key: `b-${i}`,
    label: name,
    pct: share(level.currentBreakdown[i] ?? 0, total),
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
}

/**
 * After-bar segments: a highlighted freed-up block on top, then the target
 * work-content split compressed into the remaining (1 − releasedRatio) height.
 */
function buildAfterSegments(level: LevelDetail, categoryNames: string[], freedLabel: string): BarSegment[] {
  const total = sum(level.targetBreakdown);
  const workingScale = Math.max(0, 1 - level.releasedRatio) * 100;
  const freed: BarSegment = {
    key: "freed",
    label: freedLabel,
    pct: level.releasedRatio * 100,
    color: FREED_COLOR,
    highlight: true,
  };
  const working = categoryNames.map((name, i) => ({
    key: `a-${i}`,
    label: name,
    pct: (share(level.targetBreakdown[i] ?? 0, total) / 100) * workingScale,
    color: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
  }));
  return [freed, ...working];
}

/** The category with the largest baseline→target share reduction, if any. */
function largestReduction(
  level: LevelDetail,
  categoryNames: string[],
): { name: string; before: number; after: number } | null {
  const cTotal = sum(level.currentBreakdown);
  const tTotal = sum(level.targetBreakdown);
  const ranked = categoryNames
    .map((name, i) => {
      const before = share(level.currentBreakdown[i] ?? 0, cTotal);
      const after = share(level.targetBreakdown[i] ?? 0, tTotal);
      return { name, before, after, delta: before - after };
    })
    .filter((r) => r.delta > 0)
    .sort((a, b) => b.delta - a.delta);
  const top = ranked[0];
  return top ? { name: top.name, before: top.before, after: top.after } : null;
}

export function FunctionDetailModal({ meta, onClose }: FunctionDetailModalProps) {
  const { t } = useLocale();
  const [activeLevel, setActiveLevel] = useState(0);

  const categoryNames = meta.categories.map((c) => c.name);
  const level = meta.levels[activeLevel];

  const reduction = level ? largestReduction(level, categoryNames) : null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-3xl flex-col gap-4 overflow-y-auto rounded-md border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <h2 className="text-lg font-semibold">{meta.functionLabel}</h2>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>
            {t.scan.close}
          </Button>
        </div>

        {/* Job-grade tabs */}
        {meta.levels.length > 0 && (
          <SegTabs
            value={meta.levels[activeLevel]?.levelCode ?? meta.levels[0].levelCode}
            onChange={(code) => setActiveLevel(meta.levels.findIndex((l) => l.levelCode === code))}
            tabs={meta.levels.map((lvl) => ({ value: lvl.levelCode, label: lvl.levelLabel }))}
          />
        )}

        {level && (
          <div className="grid gap-6 md:grid-cols-[auto_1fr]">
            {/* Before / After stacked bars */}
            <div className="flex flex-col gap-3">
              <div className="flex gap-6">
                <StackedBar title={t.scan.currentActivities} segments={buildBeforeSegments(level, categoryNames)} />
                <StackedBar
                  title={t.scan.futureActivities}
                  segments={buildAfterSegments(level, categoryNames, t.scan.freedCapacity)}
                />
              </div>
              <div className="rounded-md bg-slate-100 px-3 py-2 text-center text-sm font-semibold text-slate-800 dark:bg-slate-800 dark:text-slate-100">
                {t.scan.freedCapacity}: {(level.releasedRatio * 100).toFixed(0)}%
              </div>
            </div>

            {/* Legend + takeaways */}
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.scan.activityLegend}
                </h3>
                <ul className="space-y-1">
                  {meta.categories.map((cat, i) => (
                    <li key={cat.key} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className={`inline-block h-3 w-3 rounded-sm ${CATEGORY_COLORS[i % CATEGORY_COLORS.length]}`} />
                      <span className="font-medium">{cat.key}</span>
                      <span>{cat.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {t.scan.keyTakeaways}
                </h3>
                <ul className="space-y-1.5 text-sm text-slate-700 dark:text-slate-300">
                  <li>{meta.keyInsight ?? t.scan.noInsight}</li>
                  {reduction && (
                    <li>
                      <span className="font-medium">{t.scan.largestDrop}:</span> {reduction.name} (
                      {reduction.before.toFixed(0)}% → {reduction.after.toFixed(0)}%)
                    </li>
                  )}
                  <li>
                    <span className="font-medium">{t.scan.automationRatio}:</span>{" "}
                    {(level.automationRatio * 100).toFixed(0)}%
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

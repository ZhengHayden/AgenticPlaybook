"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ActivityCategory, FunctionMeta, LevelDetail } from "@/lib/scan/types";

interface WorkContentEditorProps {
  automation: Readonly<Record<string, FunctionMeta>>;
  onChange: (next: Record<string, FunctionMeta>) => void;
}

type BreakdownKind = "currentBreakdown" | "targetBreakdown";
type RatioField = "automationRatio" | "releasedRatio";

const clampPercent = (v: number): number => Math.min(100, Math.max(0, Number.isFinite(v) ? v : 0));
const clampRatio = (v: number): number => Math.min(1, Math.max(0, Number.isFinite(v) ? v : 0));

/** Next free legend letter (A–Z), falling back to a numbered key when exhausted. */
function nextCategoryKey(categories: ReadonlyArray<ActivityCategory>): string {
  const used = new Set(categories.map((c) => c.key));
  for (let i = 0; i < 26; i += 1) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return letter;
  }
  return `C${categories.length + 1}`;
}

/** Append a category to the function and a 0 slot to every level's breakdowns (kept index-aligned). */
function addCategory(meta: FunctionMeta): FunctionMeta {
  const key = nextCategoryKey(meta.categories);
  return {
    ...meta,
    categories: [...meta.categories, { key, name: key }],
    levels: meta.levels.map((l) => ({
      ...l,
      currentBreakdown: [...l.currentBreakdown, 0],
      targetBreakdown: [...l.targetBreakdown, 0],
    })),
  };
}

/** Remove the category at `index` from the function and the same slot from every level. */
function removeCategory(meta: FunctionMeta, index: number): FunctionMeta {
  return {
    ...meta,
    categories: meta.categories.filter((_, i) => i !== index),
    levels: meta.levels.map((l) => ({
      ...l,
      currentBreakdown: l.currentBreakdown.filter((_, i) => i !== index),
      targetBreakdown: l.targetBreakdown.filter((_, i) => i !== index),
    })),
  };
}

function renameCategory(meta: FunctionMeta, index: number, name: string): FunctionMeta {
  return { ...meta, categories: meta.categories.map((c, i) => (i === index ? { ...c, name } : c)) };
}

function setBreakdown(
  meta: FunctionMeta,
  levelIndex: number,
  kind: BreakdownKind,
  catIndex: number,
  value: number,
): FunctionMeta {
  return {
    ...meta,
    levels: meta.levels.map((l, i) =>
      i === levelIndex ? { ...l, [kind]: l[kind].map((v, ci) => (ci === catIndex ? value : v)) } : l,
    ),
  };
}

function setRatio(meta: FunctionMeta, levelIndex: number, field: RatioField, value: number): FunctionMeta {
  return {
    ...meta,
    levels: meta.levels.map((l, i) => (i === levelIndex ? { ...l, [field]: value } : l)),
  };
}

const inputCls =
  "mt-1 rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
const numCls =
  "w-20 rounded border border-zinc-200 bg-white px-2 py-1 text-right text-sm tabular-nums dark:border-zinc-700 dark:bg-zinc-950";

/**
 * Work-content editor: pick a function + job grade, then edit the per-category
 * baseline/target percentages, the automation & release ratios, the category
 * names, and the function's key insight. "Add work content" appends a category
 * (and an aligned 0 to every level). All updates are immutable.
 */
export function WorkContentEditor({ automation, onChange }: WorkContentEditorProps) {
  const { t } = useLocale();

  const fnKeys = useMemo(() => Object.keys(automation), [automation]);
  const [activeFn, setActiveFn] = useState<string>(fnKeys[0] ?? "");
  const selectedFn = automation[activeFn] ? activeFn : fnKeys[0] ?? "";
  const meta = automation[selectedFn];

  const [activeLevel, setActiveLevel] = useState<string>(meta?.levels[0]?.levelCode ?? "");
  const levelIndex = meta ? meta.levels.findIndex((l) => l.levelCode === activeLevel) : -1;
  const safeLevelIndex = levelIndex >= 0 ? levelIndex : 0;
  const level: LevelDetail | undefined = meta?.levels[safeLevelIndex];

  const apply = (nextMeta: FunctionMeta) => onChange({ ...automation, [selectedFn]: nextMeta });

  if (!meta || !level) return <p className="text-sm text-zinc-400">{t.scan.noEditableData}</p>;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-zinc-500">
          {t.scan.selectFunction}
          <select
            value={selectedFn}
            onChange={(e) => setActiveFn(e.target.value)}
            className={`${inputCls} block w-full`}
          >
            {fnKeys.map((k) => (
              <option key={k} value={k}>
                {automation[k].functionLabel}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs text-zinc-500">
          {t.scan.selectGrade}
          <select
            value={level.levelCode}
            onChange={(e) => setActiveLevel(e.target.value)}
            className={`${inputCls} block w-full`}
          >
            {meta.levels.map((l) => (
              <option key={l.levelCode} value={l.levelCode}>
                {l.levelLabel}
              </option>
            ))}
          </select>
        </label>
      </div>

      <table className="min-w-full border-separate border-spacing-0 text-sm">
        <thead>
          <tr className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
            <th className="px-2 py-1.5 text-left">{t.scan.categoryName}</th>
            <th className="px-2 py-1.5 text-right">{t.scan.baselinePct}</th>
            <th className="px-2 py-1.5 text-right">{t.scan.targetPct}</th>
            <th className="px-2 py-1.5" />
          </tr>
        </thead>
        <tbody>
          {meta.categories.map((cat, ci) => (
            <tr key={cat.key} className="border-t border-zinc-100 dark:border-zinc-800">
              <td className="px-2 py-1">
                <input
                  value={cat.name}
                  onChange={(e) => apply(renameCategory(meta, ci, e.target.value))}
                  className={`${inputCls} mt-0 w-full`}
                  aria-label={`${t.scan.categoryName} ${cat.key}`}
                />
              </td>
              <td className="px-2 py-1 text-right">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={level.currentBreakdown[ci] ?? 0}
                  onChange={(e) =>
                    apply(setBreakdown(meta, safeLevelIndex, "currentBreakdown", ci, clampPercent(Number(e.target.value))))
                  }
                  className={numCls}
                  aria-label={`${cat.name} ${t.scan.baselinePct}`}
                />
              </td>
              <td className="px-2 py-1 text-right">
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={level.targetBreakdown[ci] ?? 0}
                  onChange={(e) =>
                    apply(setBreakdown(meta, safeLevelIndex, "targetBreakdown", ci, clampPercent(Number(e.target.value))))
                  }
                  className={numCls}
                  aria-label={`${cat.name} ${t.scan.targetPct}`}
                />
              </td>
              <td className="px-2 py-1 text-right">
                <button
                  type="button"
                  onClick={() => apply(removeCategory(meta, ci))}
                  className="rounded border border-zinc-200 px-2 py-0.5 text-xs text-zinc-500 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-800"
                >
                  {t.scan.removeWorkContent}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <button
        type="button"
        onClick={() => apply(addCategory(meta))}
        className="rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300"
      >
        + {t.scan.addWorkContent}
      </button>
      <p className="text-[11px] text-zinc-400">{t.scan.breakdownSumHint}</p>

      <div className="grid grid-cols-2 gap-3">
        <label className="block text-xs text-zinc-500">
          {t.scan.automationRatioLabel}
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={level.automationRatio}
            onChange={(e) => apply(setRatio(meta, safeLevelIndex, "automationRatio", clampRatio(Number(e.target.value))))}
            className={`${inputCls} block w-full`}
          />
        </label>
        <label className="block text-xs text-zinc-500">
          {t.scan.releaseRatioLabel}
          <input
            type="number"
            min={0}
            max={1}
            step={0.05}
            value={level.releasedRatio}
            onChange={(e) => apply(setRatio(meta, safeLevelIndex, "releasedRatio", clampRatio(Number(e.target.value))))}
            className={`${inputCls} block w-full`}
          />
        </label>
      </div>

      <label className="block text-xs text-zinc-500">
        {t.scan.insightLabel}
        <textarea
          value={meta.keyInsight ?? ""}
          onChange={(e) => apply({ ...meta, keyInsight: e.target.value })}
          rows={3}
          className={`${inputCls} block w-full`}
        />
      </label>
    </div>
  );
}

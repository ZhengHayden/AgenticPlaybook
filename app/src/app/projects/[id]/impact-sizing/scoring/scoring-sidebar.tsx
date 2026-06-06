"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { ChevronDown, ChevronRight, Search } from "lucide-react";

/** One selectable workflow in the scoring navigator. */
export interface ScoringNavRow {
  id: string;
  name: string;
  /** Ranking value for the row (0 when nothing is scored yet). */
  priority: number;
  /** Whether the row clears the Design-entry floor. */
  passesFloor: boolean;
  /** Optional trailing meta, e.g. a use-case count. */
  meta?: string;
}

export interface ScoringNavGroup {
  /** Business function label. */
  fn: string;
  rows: ScoringNavRow[];
}

interface ScoringSidebarProps {
  groups: ReadonlyArray<ScoringNavGroup>;
  selectedId: string | null;
  onSelect: (id: string) => void;
}

/**
 * Master-list navigator for the Scoring page: a searchable, collapsible list of
 * workflows grouped by business function. Each group header shows how many of
 * its workflows clear the Design-entry floor; each row shows its priority.
 */
export function ScoringSidebar({ groups, selectedId, onSelect }: ScoringSidebarProps) {
  const { locale } = useLocale();
  const en = locale === "en";
  const [query, setQuery] = useState("");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const q = query.trim().toLowerCase();
  const filtered = groups
    .map((g) => ({
      ...g,
      rows: q ? g.rows.filter((r) => r.name.toLowerCase().includes(q)) : g.rows,
    }))
    .filter((g) => g.rows.length > 0);

  const toggle = (fn: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(fn)) next.delete(fn);
      else next.add(fn);
      return next;
    });

  return (
    <aside className="w-full shrink-0 lg:w-72">
      <div className="relative mb-2">
        <Search className="pointer-events-none absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={en ? "Search workflows…" : "搜索工作流…"}
          aria-label={en ? "Search workflows" : "搜索工作流"}
          className="w-full rounded-md border border-slate-200 bg-white py-1.5 pl-7 pr-2 text-sm dark:border-slate-700 dark:bg-slate-950"
        />
      </div>

      <div className="max-h-[72vh] overflow-y-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        {filtered.length === 0 ? (
          <p className="p-3 text-xs text-slate-400">{en ? "No matches." : "无匹配。"}</p>
        ) : (
          filtered.map((g) => {
            const open = q !== "" || !collapsed.has(g.fn);
            const clears = g.rows.filter((r) => r.passesFloor).length;
            return (
              <div key={g.fn} className="border-b border-slate-100 last:border-b-0 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => toggle(g.fn)}
                  className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800/50"
                >
                  <span className="flex min-w-0 items-center gap-1">
                    {open ? (
                      <ChevronDown className="h-3.5 w-3.5 shrink-0" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    )}
                    <span className="truncate">{g.fn}</span>
                  </span>
                  <span className="shrink-0 text-[10px] font-normal tabular-nums text-slate-400">
                    {clears}/{g.rows.length}
                  </span>
                </button>
                {open && (
                  <ul className="pb-1">
                    {g.rows.map((r) => {
                      const active = r.id === selectedId;
                      return (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => onSelect(r.id)}
                            className={
                              active
                                ? "flex w-full items-center justify-between gap-2 border-l-2 border-indigo-500 bg-indigo-50 px-3 py-1.5 text-left text-xs dark:bg-indigo-950/30"
                                : "flex w-full items-center justify-between gap-2 border-l-2 border-transparent px-3 py-1.5 text-left text-xs hover:bg-slate-50 dark:hover:bg-slate-800/50"
                            }
                          >
                            <span className="min-w-0 flex-1 truncate text-slate-700 dark:text-slate-200">
                              {r.name}
                            </span>
                            <span className="flex shrink-0 items-center gap-1.5 font-mono">
                              {r.meta && <span className="text-[10px] text-slate-400">{r.meta}</span>}
                              <span
                                className={
                                  r.priority <= 0
                                    ? "text-slate-300 dark:text-slate-600"
                                    : r.passesFloor
                                      ? "text-emerald-600 dark:text-emerald-400"
                                      : "text-rose-600 dark:text-rose-400"
                                }
                              >
                                {r.priority > 0 ? r.priority.toFixed(1) : "—"}
                              </span>
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}

/** Group candidates by business function, preserving first-seen function order. */
export function groupByFunction<T extends { businessFunction?: string }>(
  items: ReadonlyArray<T>,
  unassignedLabel: string,
): Array<{ fn: string; items: T[] }> {
  const order: string[] = [];
  const map = new Map<string, T[]>();
  for (const item of items) {
    const fn = item.businessFunction?.trim() || unassignedLabel;
    if (!map.has(fn)) {
      map.set(fn, []);
      order.push(fn);
    }
    map.get(fn)!.push(item);
  }
  return order.map((fn) => ({ fn, items: map.get(fn)! }));
}

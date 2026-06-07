"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface SegTab<T extends string> {
  value: T;
  label: ReactNode;
}

interface SegTabsProps<T extends string> {
  tabs: ReadonlyArray<SegTab<T>>;
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

/**
 * State-driven segmented pill tabs — an onClick sibling to the route-based
 * {@link file://./pill-tabs.tsx PillTabs}. Used for in-page view toggles.
 */
export function SegTabs<T extends string>({ tabs, value, onChange, className }: SegTabsProps<T>) {
  return (
    <div
      className={cn(
        "inline-flex gap-0.5 rounded border border-slate-200 bg-slate-100 p-0.5",
        "dark:border-slate-800 dark:bg-slate-800/40",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={cn(
              "rounded-[3px] px-3 py-1 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-brand-600 shadow-sm dark:bg-slate-900 dark:text-brand-300"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}

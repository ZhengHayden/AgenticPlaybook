"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export interface PillTab {
  href: string;
  label: ReactNode;
  /** Optional path prefix used to compute the active state (defaults to exact match). */
  base?: string;
}

interface PillTabsProps {
  tabs: PillTab[];
  className?: string;
}

/** Segmented pill tabs — the gameboard's primary tab style. */
export function PillTabs({ tabs, className }: PillTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "inline-flex gap-1 rounded-xl border border-slate-200 bg-slate-100/70 p-1",
        "dark:border-slate-800 dark:bg-slate-800/40",
        className,
      )}
    >
      {tabs.map((tab) => {
        const active = tab.base ? pathname.startsWith(tab.base) : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors",
              active
                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-900 dark:text-indigo-400"
                : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

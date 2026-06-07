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

/** SLDS underline tabs — bottom-border accent on the active route. */
export function PillTabs({ tabs, className }: PillTabsProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn(
        "flex items-center gap-1 border-b border-slate-200 dark:border-slate-800",
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
              "-mb-px border-b-2 px-3 py-2 text-sm font-semibold transition-colors",
              active
                ? "border-brand-600 text-brand-700 dark:border-brand-300 dark:text-brand-300"
                : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

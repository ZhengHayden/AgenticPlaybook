import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: ReactNode;
  value: ReactNode;
  /** Accent bar color utility, e.g. "bg-indigo-500". */
  accent?: string;
  className?: string;
}

/** KPI card with a left accent bar, large value, and muted label. */
export function StatCard({ label, value, accent = "bg-indigo-500", className }: StatCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm",
        "dark:border-slate-800 dark:bg-slate-900",
        className,
      )}
    >
      <span className={cn("h-9 w-1.5 rounded-full", accent)} />
      <div>
        <div className="text-xl font-bold leading-none tabular-nums text-slate-800 dark:text-slate-100">
          {value}
        </div>
        <div className="mt-1 text-xs font-medium text-slate-400 dark:text-slate-500">{label}</div>
      </div>
    </div>
  );
}

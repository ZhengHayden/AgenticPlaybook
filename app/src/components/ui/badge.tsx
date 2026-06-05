import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Distinct color per function, cycled by position. Full class names so the
 * Tailwind scanner picks them up. White badge text on each.
 */
export const FN_PALETTE = [
  "bg-indigo-600",
  "bg-emerald-600",
  "bg-amber-500",
  "bg-sky-600",
  "bg-rose-500",
  "bg-violet-600",
  "bg-teal-600",
  "bg-orange-500",
  "bg-fuchsia-600",
  "bg-cyan-600",
  "bg-lime-600",
  "bg-slate-600",
] as const;

/** Pick a stable palette color by index (wraps around the palette). */
export function fnPaletteColor(index: number): string {
  return FN_PALETTE[index % FN_PALETTE.length];
}

interface IdBadgeProps {
  children: ReactNode;
  /** Background utility class, e.g. one of FN_PALETTE. */
  bg?: string;
  className?: string;
}

/** Compact code chip (function/workflow IDs) with white text. */
export function IdBadge({ children, bg = "bg-indigo-600", className }: IdBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-md px-1.5 py-0.5 text-[11px] font-bold leading-none tracking-wide tabular-nums text-white shadow-sm",
        bg,
        className,
      )}
    >
      {children}
    </span>
  );
}

interface BadgeProps {
  children: ReactNode;
  /** Affirmative (emerald) vs muted (slate) styling. */
  ok?: boolean;
  className?: string;
}

/** Pill status badge — emerald when ok, muted slate otherwise. */
export function Badge({ children, ok = false, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold",
        ok
          ? "border-emerald-300 bg-emerald-100 text-emerald-700 dark:border-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
          : "border-slate-300 bg-slate-100 text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400",
        className,
      )}
    >
      {children}
    </span>
  );
}

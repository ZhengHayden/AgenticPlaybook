import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Neutral ID-chip background. SLDS reserves color for status/meaning, so
 * function-identity badges are a single restrained slate rather than a
 * decorative rainbow. Kept as an array for API compatibility.
 */
export const FN_PALETTE = ["bg-slate-600"] as const;

/**
 * Palette color for an ID chip. The index is ignored — all function IDs
 * share one neutral tone — but the signature is retained so existing call
 * sites keep working.
 */
export function fnPaletteColor(_index: number): string {
  return FN_PALETTE[0];
}

interface IdBadgeProps {
  children: ReactNode;
  /** Background utility class, e.g. one of FN_PALETTE. */
  bg?: string;
  className?: string;
}

/** Compact code chip (function/workflow IDs) with white text. */
export function IdBadge({ children, bg = "bg-slate-600", className }: IdBadgeProps) {
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

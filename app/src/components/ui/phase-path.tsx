"use client";

import { Fragment } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Check, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PhasePathStep {
  href: string;
  label: string;
  /** Path prefix used to resolve the active step (defaults to `href`). */
  base?: string;
  /** Small trailing count/state badge, e.g. a candidate count. */
  meta?: string;
}

interface PhasePathProps {
  steps: ReadonlyArray<PhasePathStep>;
  className?: string;
}

type StepState = "complete" | "current" | "upcoming";

const SEGMENT_CLASS: Record<StepState, string> = {
  // Completed: brand text on a subtle tint with a check.
  complete:
    "bg-brand-50 text-brand-700 hover:bg-brand-100 dark:bg-brand-800/30 dark:text-brand-300",
  // Active: solid brand fill, white text.
  current: "bg-brand-600 text-white",
  // Future: tertiary text, no fill.
  upcoming:
    "text-ink-faint hover:bg-subtle dark:text-slate-500 dark:hover:bg-slate-800/50",
};

const BADGE_CLASS: Record<StepState, string> = {
  complete: "bg-brand-100 text-brand-700 dark:bg-brand-800/50 dark:text-brand-200",
  current: "bg-white/20 text-white",
  upcoming: "bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400",
};

/** Parse a meta badge to a number when it is purely numeric (for conversion %). */
function metaCount(meta?: string): number | null {
  if (meta === undefined) return null;
  const n = Number(meta.replace(/,/g, ""));
  return Number.isFinite(n) ? n : null;
}

/**
 * Horizontal segmented roadmap stepper (proposal §5.3). The step matching the
 * current route is the active (brand-filled) segment; earlier steps render as
 * completed (brand text on subtle bg + check); later steps are muted. Numeric
 * count badges sit inline after each label, and the connector between two
 * steps shows the conversion rate when both counts are known.
 */
export function PhasePath({ steps, className }: PhasePathProps) {
  const pathname = usePathname();

  const activeIndex = (() => {
    const matched = steps.findIndex((s) => pathname.startsWith(s.base ?? s.href));
    return matched === -1 ? 0 : matched;
  })();

  return (
    <nav aria-label="Phase progress" className={cn("w-full", className)}>
      <ol className="flex w-full items-stretch gap-1">
        {steps.map((step, i) => {
          const state: StepState =
            i < activeIndex ? "complete" : i === activeIndex ? "current" : "upcoming";

          const prevCount = metaCount(steps[i - 1]?.meta);
          const curCount = metaCount(step.meta);
          const conversion =
            prevCount !== null && curCount !== null && prevCount > 0
              ? Math.round((curCount / prevCount) * 100)
              : null;

          return (
            <Fragment key={step.href}>
              {i > 0 && (
                <li
                  aria-hidden
                  className="flex shrink-0 flex-col items-center justify-center px-0.5 text-ink-faint"
                >
                  <ChevronRight className="h-4 w-4" />
                  {conversion !== null && (
                    <span className="text-[10px] font-medium leading-none tabular-nums">
                      {conversion}%
                    </span>
                  )}
                </li>
              )}
              <li className="min-w-0 flex-1">
                <Link
                  href={step.href}
                  aria-current={state === "current" ? "step" : undefined}
                  className={cn(
                    "flex h-9 items-center justify-center gap-1.5 rounded-md px-3 text-xs font-semibold transition-colors",
                    SEGMENT_CLASS[state],
                  )}
                >
                  {state === "complete" && <Check className="h-3.5 w-3.5 shrink-0" />}
                  <span className="truncate">{step.label}</span>
                  {step.meta !== undefined && (
                    <span
                      className={cn(
                        "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] leading-none tabular-nums",
                        BADGE_CLASS[state],
                      )}
                    >
                      {step.meta}
                    </span>
                  )}
                </Link>
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

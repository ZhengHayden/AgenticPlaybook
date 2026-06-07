"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

/** Arrow size (px) for the interlocking chevrons. */
const ARROW = 14;

type StepState = "complete" | "current" | "upcoming";

/** Clip-path that gives a segment its chevron shape based on position. */
function clipFor(isFirst: boolean, isLast: boolean): string {
  const point = `100% 50%`;
  const rightPointed = `calc(100% - ${ARROW}px) 0, ${point}, calc(100% - ${ARROW}px) 100%`;
  const rightFlat = `100% 0, 100% 100%`;
  const leftNotch = `${ARROW}px 50%`;
  const right = isLast ? rightFlat : rightPointed;
  const tail = isFirst ? `0 100%` : `0 100%, ${leftNotch}`;
  return `polygon(0 0, ${right}, ${tail})`;
}

const STATE_CLASS: Record<StepState, string> = {
  complete: "bg-brand-600 text-white hover:bg-brand-700",
  current: "bg-brand-800 text-white",
  upcoming:
    "bg-slate-200 text-slate-600 hover:bg-slate-300 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700",
};

const BADGE_CLASS: Record<StepState, string> = {
  complete: "bg-white/25 text-white",
  current: "bg-white/25 text-white",
  upcoming: "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200",
};

/**
 * SLDS-style chevron progress Path. Steps left of the current route render as
 * complete (filled brand), the matching step as current (darkest brand), and
 * the rest as upcoming (muted). The whole row is navigable.
 */
export function PhasePath({ steps, className }: PhasePathProps) {
  const pathname = usePathname();

  const activeIndex = (() => {
    const matched = steps.findIndex((s) => pathname.startsWith(s.base ?? s.href));
    return matched === -1 ? 0 : matched;
  })();

  return (
    <nav aria-label="Phase progress" className={cn("w-full", className)}>
      <ol className="flex w-full items-stretch">
        {steps.map((step, i) => {
          const isFirst = i === 0;
          const isLast = i === steps.length - 1;
          const state: StepState =
            i < activeIndex ? "complete" : i === activeIndex ? "current" : "upcoming";

          return (
            <li
              key={step.href}
              className="min-w-0 flex-1"
              style={{ marginRight: isLast ? 0 : -ARROW / 2, zIndex: steps.length - i }}
            >
              <Link
                href={step.href}
                aria-current={state === "current" ? "step" : undefined}
                style={{ clipPath: clipFor(isFirst, isLast) }}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 text-xs font-semibold transition-colors",
                  isFirst ? "pl-3 pr-4" : "pl-6 pr-4",
                  STATE_CLASS[state],
                )}
              >
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
          );
        })}
      </ol>
    </nav>
  );
}

import type { ReactNode } from "react";
import { ArrowUpRight, ArrowDownRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface StatDelta {
  /** Signed change vs. the prior period; 0 renders as neutral "no change". */
  value: number;
  /** Optional unit suffix, e.g. "%" or "this wk". */
  label?: ReactNode;
  /** When true, a negative delta is the *good* outcome (e.g. blocked count). */
  invert?: boolean;
}

/** Accent drives the gradient top-wash + icon tint (reference §5.5). */
export type StatTileAccent = "primary" | "violet" | "success" | "warning";

interface StatTileProps {
  label: ReactNode;
  value: ReactNode;
  /** Optional delta-from-last-period indicator, rendered below the value. */
  delta?: StatDelta;
  /** Optional plain secondary line below the value (e.g. "81% of total"). */
  hint?: ReactNode;
  /** Optional gradient wash + matching icon tint. Defaults to a flat tile. */
  accent?: StatTileAccent;
  /** Optional trailing icon in the caption row. */
  icon?: LucideIcon;
  className?: string;
}

function deltaTone(value: number, invert: boolean): string {
  if (value === 0) return "text-ink-faint";
  const positive = invert ? value < 0 : value > 0;
  return positive ? "text-success" : "text-danger";
}

const WASH_CLASS: Record<StatTileAccent, string> = {
  primary: "from-primary/10",
  violet: "from-accent-violet/10",
  success: "from-success/10",
  warning: "from-warning/10",
};

const ICON_TINT: Record<StatTileAccent, string> = {
  primary: "text-primary",
  violet: "text-accent-violet",
  success: "text-success",
  warning: "text-warning",
};

/**
 * KPI tile (reference §5.2 / §5.5): an uppercase caption, a large tabular
 * numeral, and an optional delta or hint line. An `accent` adds a faint
 * gradient top-wash and tints the caption icon; color stays reserved for
 * meaning, so the wash is intentionally low-opacity.
 */
export function StatTile({ label, value, delta, hint, accent, icon: Icon, className }: StatTileProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border border-border bg-surface px-5 py-4",
        className,
      )}
    >
      {accent && (
        <div
          className={cn(
            "pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent",
            WASH_CLASS[accent],
          )}
          aria-hidden
        />
      )}
      <div className="relative flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        {Icon && <Icon className={cn("h-4 w-4", accent ? ICON_TINT[accent] : "text-ink-faint")} aria-hidden />}
      </div>
      <div className="relative mt-2 font-display text-3xl font-semibold leading-none tabular-nums text-foreground">
        {value}
      </div>
      {delta !== undefined && (
        <div
          className={cn(
            "relative mt-2 inline-flex items-center gap-0.5 text-xs font-medium tabular-nums",
            deltaTone(delta.value, delta.invert ?? false),
          )}
        >
          {delta.value !== 0 &&
            (delta.value > 0 ? (
              <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            ) : (
              <ArrowDownRight className="h-3.5 w-3.5" aria-hidden />
            ))}
          {delta.value > 0 ? `+${delta.value}` : delta.value}
          {delta.label !== undefined && (
            <span className="ml-0.5 font-normal text-ink-faint">{delta.label}</span>
          )}
        </div>
      )}
      {hint !== undefined && (
        <div className="relative mt-1.5 text-xs text-ink-faint">{hint}</div>
      )}
    </div>
  );
}

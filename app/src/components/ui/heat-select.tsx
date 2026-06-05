import type { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type HeatLevel = "high" | "medium" | "low";

/** Background/border/text per heat level. Full class names for the scanner. */
export const LEVEL_HEAT: Record<HeatLevel, string> = {
  high: "bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-700",
  medium: "bg-amber-50 text-amber-700 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-700",
  low: "bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-700",
};

interface HeatSelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "value" | "onChange"> {
  value: HeatLevel;
  onValueChange: (value: HeatLevel) => void;
  /** Visible option labels keyed by level (e.g. localized High/Medium/Low). */
  labels: Record<HeatLevel, string>;
}

const LEVELS: HeatLevel[] = ["high", "medium", "low"];

/** Heatmap select — color reflects the chosen level, with a custom chevron. */
export function HeatSelect({ value, onValueChange, labels, className, ...rest }: HeatSelectProps) {
  return (
    <select
      value={value}
      onChange={(event) => onValueChange(event.target.value as HeatLevel)}
      className={cn(
        "heat rounded-md border px-2 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-300",
        LEVEL_HEAT[value],
        className,
      )}
      {...rest}
    >
      {LEVELS.map((level) => (
        <option key={level} value={level}>
          {labels[level]}
        </option>
      ))}
    </select>
  );
}

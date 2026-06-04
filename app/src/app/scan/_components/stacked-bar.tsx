"use client";

/** One stacked segment: its height as a percent of the full bar, plus styling. */
export interface BarSegment {
  key: string;
  label: string;
  /** Height as a percent of the full bar (0–100). Segments should sum to ~100. */
  pct: number;
  /** Tailwind background class for the segment fill. */
  color: string;
  /** Render with a dashed border / hatched treatment (used for freed-up capacity). */
  highlight?: boolean;
}

interface StackedBarProps {
  title: string;
  segments: ReadonlyArray<BarSegment>;
}

/** Minimum segment height (%) at which we render the inline percent label. */
const LABEL_THRESHOLD = 8;

/**
 * A pure-CSS vertical stacked bar — no chart library. Each segment is a flex
 * row whose height is its share of the bar; large-enough segments show their
 * percent inline. Shared by the Before/After columns in the detail modal.
 */
export function StackedBar({ title, segments }: StackedBarProps) {
  return (
    <div className="flex flex-1 flex-col items-center gap-2">
      <div className="flex h-64 w-20 flex-col overflow-hidden rounded-md border border-zinc-200 dark:border-zinc-800">
        {segments.map((seg) => (
          <div
            key={seg.key}
            className={`flex items-center justify-center text-[10px] font-medium text-white/90 ${seg.color} ${
              seg.highlight ? "border-y border-dashed border-white/70" : ""
            }`}
            style={{ height: `${seg.pct}%` }}
            title={`${seg.label}: ${seg.pct.toFixed(0)}%`}
          >
            {seg.pct >= LABEL_THRESHOLD ? `${seg.pct.toFixed(0)}%` : ""}
          </div>
        ))}
      </div>
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{title}</span>
    </div>
  );
}

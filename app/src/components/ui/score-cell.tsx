import { cn } from "@/lib/utils";

interface ScoreCellProps {
  /** Number of passing items. */
  score: number;
  /** Total number of gates/items. */
  total: number;
  /** Per-item pass flags; defaults to the first `score` items passing. */
  items?: ReadonlyArray<boolean>;
  className?: string;
}

/**
 * Mono `n/total` numeral + a segmented micro-bar (reference §5, ScoreCell):
 * one segment per gate, green when passed and red when failed. Pairs the count
 * with a per-gate visual so a 5/6 reads at a glance without expanding the row.
 */
export function ScoreCell({ score, total, items, className }: ScoreCellProps) {
  const segs = items ?? Array.from({ length: total }, (_, i) => i < score);
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <span className="font-mono-num text-sm">
        {score}/{total}
      </span>
      <div className="flex gap-0.5" aria-hidden>
        {segs.map((ok, i) => (
          <span
            key={i}
            className={cn("h-2 w-3 rounded-sm", ok ? "bg-success" : "bg-danger/70")}
          />
        ))}
      </div>
    </div>
  );
}

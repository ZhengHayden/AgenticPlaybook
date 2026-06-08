import { cn } from "@/lib/utils";

interface MiniPipelineProps {
  /** Zero-based index of the current stage. Stages before it read as done. */
  stage: number;
  /** Total number of stages. */
  total?: number;
  className?: string;
  label?: string;
}

/**
 * Compact N-segment stage indicator for dense table rows (reference §4.1):
 * completed stages fill solid primary, the current stage is a lighter primary,
 * and upcoming stages stay hairline. Pairs with a text stage label in the row,
 * so color is never the only signal.
 */
export function MiniPipeline({ stage, total = 5, className, label }: MiniPipelineProps) {
  return (
    <div
      className={cn("flex gap-1", className)}
      role="img"
      aria-label={label ?? `Stage ${stage + 1} of ${total}`}
    >
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={cn(
            "h-1.5 w-6 rounded-full",
            i < stage ? "bg-primary" : i === stage ? "bg-primary/55" : "bg-border",
          )}
        />
      ))}
    </div>
  );
}

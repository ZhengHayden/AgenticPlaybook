import { cn } from "@/lib/utils";

export type QuadrantKey = "q1" | "q2" | "q3" | "q4";

export interface QuadrantPoint {
  key: string;
  label: string;
  /** Implementation effort, 0–100 (x axis; left = low effort). */
  effort: number;
  /** Impact, 0–100 (y axis; top = high impact). */
  impact: number;
  /** Priority score, drives bubble radius. */
  priority: number;
  quadrant: QuadrantKey;
}

interface QuadrantMatrixProps {
  points: ReadonlyArray<QuadrantPoint>;
  /** Axis caption, e.g. "Implementation effort →". */
  xLabel?: string;
  className?: string;
}

const CORNER_LABELS: ReadonlyArray<{ x: number; y: number; anchor: "start" | "end"; tone: string; text: string }> = [
  { x: 8, y: 16, anchor: "start", tone: "text-q3", text: "Invest & Prove" },
  { x: 392, y: 16, anchor: "end", tone: "text-q1", text: "Quick Win" },
  { x: 8, y: 252, anchor: "start", tone: "text-q4", text: "Defer & Mature" },
  { x: 392, y: 252, anchor: "end", tone: "text-q2", text: "Sponsor & Align" },
];

/**
 * 2×2 priority matrix (reference §4.3.7): impact (y) vs implementation effort
 * (x), each point a quadrant-colored bubble sized by priority. Quadrant tints
 * use the q1–q4 tokens. Pure SVG — no chart lib.
 */
export function QuadrantMatrix({ points, xLabel = "Implementation effort →", className }: QuadrantMatrixProps) {
  return (
    <svg viewBox="0 0 400 270" className={cn("h-72 w-full", className)} role="img" aria-label="Priority quadrant matrix">
      {/* Quadrant tints */}
      <rect x="0" y="0" width="200" height="130" fill="hsl(var(--q3) / 0.07)" />
      <rect x="200" y="0" width="200" height="130" fill="hsl(var(--q1) / 0.08)" />
      <rect x="0" y="130" width="200" height="130" fill="hsl(var(--q4) / 0.06)" />
      <rect x="200" y="130" width="200" height="130" fill="hsl(var(--q2) / 0.08)" />
      <line x1="200" y1="0" x2="200" y2="260" stroke="hsl(var(--border))" />
      <line x1="0" y1="130" x2="400" y2="130" stroke="hsl(var(--border))" />
      {CORNER_LABELS.map((c) => (
        <text
          key={c.text}
          x={c.x}
          y={c.y}
          textAnchor={c.anchor}
          className={cn("fill-current text-[10px] font-semibold", c.tone)}
        >
          {c.text}
        </text>
      ))}
      <text x="200" y="266" textAnchor="middle" className="fill-current text-[9px] text-ink-faint">
        {xLabel}
      </text>
      {points.map((p) => {
        // x: 8..92 (left = low effort), y: 8..92 (top = high impact)
        const cx = (8 + (p.effort / 100) * 84) * 4;
        const cy = (8 + ((100 - p.impact) / 100) * 84) * 2.6;
        const r = 6 + Math.max(0, p.priority) * 2.2;
        // Name is exposed via aria-label (not visible text) to keep the chart
        // uncluttered for large portfolios and avoid duplicating the table's
        // queryable text. Position + color + size carry the visual meaning.
        return (
          <circle
            key={p.key}
            cx={cx}
            cy={cy}
            r={r}
            fill={`hsl(var(--${p.quadrant}))`}
            fillOpacity={0.85}
            aria-label={p.label}
          />
        );
      })}
    </svg>
  );
}

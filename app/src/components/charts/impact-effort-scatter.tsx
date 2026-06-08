"use client";

import {
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";

export interface ScatterPoint {
  name: string;
  /** 0–100, horizontal axis. */
  effort: number;
  /** 0–100, vertical axis. */
  impact: number;
}

interface ImpactEffortScatterProps {
  points: ReadonlyArray<ScatterPoint>;
  xLabel: string;
  yLabel: string;
  height?: number;
}

const AXIS_PROPS = {
  type: "number" as const,
  domain: [0, 100] as [number, number],
  tick: { fontSize: 11, fill: "var(--color-ink-faint)" },
  stroke: "var(--color-hairline)",
};

/**
 * Impact vs. effort scatter for Layer-2 prioritization (proposal §5.9).
 * Quadrant reference lines at the midpoint highlight the high-impact /
 * low-effort "do first" zone (top-left).
 */
export function ImpactEffortScatter({ points, xLabel, yLabel, height = 280 }: ImpactEffortScatterProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <ScatterChart margin={{ top: 12, right: 16, bottom: 24, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" />
        {/* Quadrant tints: low-effort/high-impact (top-left) is the "do first"
            zone; high-effort/low-impact (bottom-right) is "defer". */}
        <ReferenceArea x1={0} x2={50} y1={50} y2={100} fill="var(--color-q1)" fillOpacity={0.07} stroke="none" />
        <ReferenceArea x1={50} x2={100} y1={50} y2={100} fill="var(--color-q2)" fillOpacity={0.07} stroke="none" />
        <ReferenceArea x1={50} x2={100} y1={0} y2={50} fill="var(--color-q4)" fillOpacity={0.06} stroke="none" />
        <XAxis
          {...AXIS_PROPS}
          dataKey="effort"
          name={xLabel}
          label={{ value: xLabel, position: "bottom", fontSize: 11, fill: "var(--color-ink-faint)" }}
        />
        <YAxis
          {...AXIS_PROPS}
          dataKey="impact"
          name={yLabel}
          label={{ value: yLabel, angle: -90, position: "insideLeft", fontSize: 11, fill: "var(--color-ink-faint)" }}
        />
        <ZAxis range={[80, 80]} />
        <ReferenceLine x={50} stroke="var(--color-hairline-strong)" />
        <ReferenceLine y={50} stroke="var(--color-hairline-strong)" />
        <Tooltip
          cursor={{ strokeDasharray: "3 3" }}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-hairline)", fontSize: 12 }}
        />
        <Scatter
          data={points as ScatterPoint[]}
          fill="var(--color-brand-600)"
          fillOpacity={0.85}
          isAnimationActive={false}
        />
      </ScatterChart>
    </ResponsiveContainer>
  );
}

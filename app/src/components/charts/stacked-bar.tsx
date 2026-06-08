"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";

export interface BarSeries {
  /** Data key on each row. */
  key: string;
  /** Legend/tooltip label. */
  label: string;
  /** Fill color (semantic token var). */
  color: string;
}

interface StackedBarProps {
  data: ReadonlyArray<Record<string, string | number>>;
  /** Key on each row used for the category axis. */
  xKey: string;
  /** Up to 4 stacked series (proposal: ≤4 legend entries). */
  series: ReadonlyArray<BarSeries>;
  height?: number;
}

const AXIS_PROPS = {
  tick: { fontSize: 11, fill: "var(--color-ink-faint)" },
  stroke: "var(--color-hairline)",
} as const;

/**
 * Stacked bar chart (proposal §5.9): e.g. candidates per business function
 * stacked by readiness status. Colors come from the semantic palette only.
 */
export function StackedBar({ data, xKey, series, height = 260 }: StackedBarProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data as Record<string, string | number>[]} margin={{ top: 8, right: 8, bottom: 4, left: -16 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-hairline)" vertical={false} />
        <XAxis dataKey={xKey} {...AXIS_PROPS} interval={0} />
        <YAxis allowDecimals={false} {...AXIS_PROPS} />
        <Tooltip
          cursor={{ fill: "var(--color-subtle)" }}
          contentStyle={{ borderRadius: 8, border: "1px solid var(--color-hairline)", fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {series.map((s) => (
          <Bar key={s.key} dataKey={s.key} name={s.label} stackId="a" fill={s.color} radius={[2, 2, 0, 0]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

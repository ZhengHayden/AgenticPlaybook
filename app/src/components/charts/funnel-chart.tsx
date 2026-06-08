"use client";

import {
  ResponsiveContainer,
  FunnelChart as RechartsFunnel,
  Funnel,
  LabelList,
  Tooltip,
  Cell,
} from "recharts";

export interface FunnelDatum {
  name: string;
  value: number;
}

interface FunnelChartProps {
  data: ReadonlyArray<FunnelDatum>;
  height?: number;
}

// Brand ramp from deepest (top of funnel) to lightest (bottom).
const STAGE_FILL = [
  "var(--color-brand-800)",
  "var(--color-brand-700)",
  "var(--color-brand-600)",
  "var(--color-brand-300)",
  "var(--color-brand-100)",
];

/**
 * Roadmap funnel (proposal §5.9). Each stage is a brand-ramp band; the funnel
 * shape itself communicates stage-to-stage conversion. Colors are brand-only.
 */
export function FunnelChart({ data, height = 240 }: FunnelChartProps) {
  const rows = data.map((d, i) => ({ ...d, fill: STAGE_FILL[i % STAGE_FILL.length] }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsFunnel>
        <Tooltip
          cursor={false}
          contentStyle={{
            borderRadius: 8,
            border: "1px solid var(--color-hairline)",
            fontSize: 12,
          }}
        />
        <Funnel dataKey="value" data={rows as FunnelDatum[]} isAnimationActive={false} lastShapeType="rectangle">
          {rows.map((row, i) => (
            <Cell key={i} fill={row.fill} />
          ))}
          <LabelList position="right" dataKey="name" stroke="none" fill="var(--color-ink)" fontSize={12} />
          <LabelList position="left" dataKey="value" stroke="none" fill="var(--color-ink-muted)" fontSize={12} />
        </Funnel>
      </RechartsFunnel>
    </ResponsiveContainer>
  );
}

import { archetypes, type ArchetypeId } from "@/content/archetypes";
import type { Locale } from "@/lib/i18n";

interface AgentTopologyProps {
  archetypeIds: ReadonlyArray<ArchetypeId>;
  /** Optional A2A pattern name, shown as the edge annotation. */
  a2aLabel?: string;
  locale: Locale;
}

const NODE_W = 132;
const NODE_H = 46;
const HUB_Y = 16;
const LEAF_Y = 132;

/**
 * Read-only agent topology diagram (proposal §5.6): renders the selected
 * archetypes as nodes with A2A edges instead of disconnected pill toggles.
 * If an Orchestrator is present it becomes the hub; otherwise the agents are
 * chained left-to-right. Static SVG — no graph library.
 */
export function AgentTopology({ archetypeIds, a2aLabel, locale }: AgentTopologyProps) {
  const nodes = archetypes.filter((a) => archetypeIds.includes(a.id));
  if (nodes.length === 0) return null;

  const hub = nodes.find((n) => n.id === "orchestrator") ?? null;
  const leaves = hub ? nodes.filter((n) => n.id !== "orchestrator") : nodes;

  const cols = Math.max(leaves.length, 1);
  const width = Math.max(480, cols * (NODE_W + 28));
  const height = hub ? LEAF_Y + NODE_H + 16 : NODE_H + 32;

  const colX = (i: number) => (width / cols) * (i + 0.5);
  const hubCx = width / 2;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full"
      role="img"
      aria-label="Agent topology"
    >
      {/* edges */}
      {hub
        ? leaves.map((leaf, i) => {
            const x1 = hubCx;
            const y1 = HUB_Y + NODE_H;
            const x2 = colX(i);
            const y2 = LEAF_Y;
            const midY = (y1 + y2) / 2;
            return (
              <path
                key={`edge-${leaf.id}`}
                d={`M ${x1} ${y1} C ${x1} ${midY}, ${x2} ${midY}, ${x2} ${y2}`}
                fill="none"
                stroke="var(--color-brand-300)"
                strokeWidth={1.5}
              />
            );
          })
        : leaves.slice(0, -1).map((leaf, i) => (
            <line
              key={`edge-${leaf.id}`}
              x1={colX(i) + NODE_W / 2}
              y1={NODE_H / 2 + 16}
              x2={colX(i + 1) - NODE_W / 2}
              y2={NODE_H / 2 + 16}
              stroke="var(--color-brand-300)"
              strokeWidth={1.5}
            />
          ))}

      {/* hub node */}
      {hub && <TopologyNode x={hubCx} y={HUB_Y + NODE_H / 2} node={hub} locale={locale} accent />}

      {/* leaf nodes */}
      {leaves.map((leaf, i) => (
        <TopologyNode
          key={leaf.id}
          x={colX(i)}
          y={hub ? LEAF_Y + NODE_H / 2 : NODE_H / 2 + 16}
          node={leaf}
          locale={locale}
        />
      ))}

      {a2aLabel && hub && (
        <text
          x={hubCx}
          y={(HUB_Y + NODE_H + LEAF_Y) / 2}
          textAnchor="middle"
          className="fill-[var(--color-ink-faint)] text-[10px]"
        >
          {a2aLabel}
        </text>
      )}
    </svg>
  );
}

interface TopologyNodeProps {
  x: number;
  y: number;
  node: (typeof archetypes)[number];
  locale: Locale;
  accent?: boolean;
}

function TopologyNode({ x, y, node, locale, accent = false }: TopologyNodeProps) {
  const left = x - NODE_W / 2;
  const top = y - NODE_H / 2;
  return (
    <g>
      <rect
        x={left}
        y={top}
        width={NODE_W}
        height={NODE_H}
        rx={8}
        fill={accent ? "var(--color-brand-600)" : "var(--color-surface)"}
        stroke={accent ? "var(--color-brand-600)" : "var(--color-hairline-strong)"}
        strokeWidth={1}
      />
      <text x={left + 12} y={y + 1} className="text-[15px]" dominantBaseline="middle">
        {node.icon}
      </text>
      <text
        x={left + 34}
        y={y + 1}
        dominantBaseline="middle"
        className={accent ? "fill-white text-[12px] font-semibold" : "fill-[var(--color-ink)] text-[12px] font-semibold"}
      >
        {node[locale].name}
      </text>
    </g>
  );
}

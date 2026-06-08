import { Plus, MoreHorizontal, Sparkles, ChevronRight } from "lucide-react";
import { Card, KpiTile, SectionHeader, StatusChip } from "@/components/primitives";
import { Link } from "react-router-dom";

const stages = [
  { name: "Roadmap", items: [{ t: "Generation Asset Mgmt", q: "q2", p: 4.1 }, { t: "Outage Comms", q: "q1", p: 4.6 }] },
  { name: "Prioritization", items: [{ t: "Fuel Procurement", q: "q3", p: 3.8 }] },
  { name: "Design", items: [{ t: "Plant Performance Copilot", q: "q1", p: 4.5 }, { t: "Maintenance Triage", q: "q2", p: 3.9 }] },
  { name: "MVP", items: [{ t: "Compliance Watcher", q: "q2", p: 3.4 }] },
  { name: "Production", items: [{ t: "Daily Ops Brief Agent", q: "q1", p: 4.7 }] },
];

const funnel = [
  { label: "Candidates", v: 13, pct: 100 },
  { label: "Screened", v: 13, pct: 100 },
  { label: "Sized", v: 10, pct: 77 },
  { label: "Prioritized", v: 8, pct: 62 },
  { label: "Gated", v: 5, pct: 38 },
];

export default function ProjectOverview() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-12 gap-6">
        {/* Left 8/12 */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          <Card className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <StatusChip variant="info" dot={false}>Power Generation</StatusChip>
                  <StatusChip variant="violet" dot={false}>Sponsor: K. Tanaka</StatusChip>
                  <StatusChip variant="success">Active</StatusChip>
                </div>
                <h1 className="font-display text-[28px] leading-9 font-semibold">UT — Golden Example</h1>
                <p className="text-sm text-muted-foreground mt-2 max-w-2xl">Reference build for agentic transformation across CLP/NEXT power generation operations. Demonstrates end-to-end scoring, gate, and production handoff.</p>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 text-sm font-medium rounded-md border border-border hover:bg-surface-muted">Edit</button>
                <button className="h-9 w-9 grid place-items-center rounded-md border border-border hover:bg-surface-muted"><MoreHorizontal className="h-4 w-4" /></button>
              </div>
            </div>
          </Card>

          <div className="grid grid-cols-4 gap-4">
            <KpiTile label="Candidates" value="13" sub="6 functions" accent="primary" />
            <KpiTile label="Screened" value="13" sub="100% pass rate" accent="success" />
            <KpiTile label="In Design" value="2" sub="awaiting gate" accent="violet" />
            <KpiTile label="Top Priority" value="4.7" sub="Daily Ops Brief" accent="warning" />
          </div>

          {/* Swimlane */}
          <Card className="p-5">
            <SectionHeader
              title="Agentic Roadmap"
              sub="Workflows ranked by Priority Score, colored by quadrant"
              right={<button className="h-8 px-3 text-xs font-medium rounded-md bg-accent-violet-soft text-accent-violet inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Add workflow</button>}
            />
            <div className="grid grid-cols-5 gap-3">
              {stages.map((s) => (
                <div key={s.name} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="eyebrow">{s.name}</div>
                    <span className="text-xs font-mono tabular text-muted-foreground">{s.items.length}</span>
                  </div>
                  {s.items.length ? s.items.map((i) => (
                    <div key={i.t} className="rounded-lg border border-border bg-surface p-3 hover:border-primary/40 cursor-pointer">
                      <div className="text-sm font-medium leading-tight">{i.t}</div>
                      <div className="mt-2 flex items-center justify-between">
                        <StatusChip variant={i.q} dot>{i.q === "q1" ? "Quick Win" : i.q === "q2" ? "Sponsor" : i.q === "q3" ? "Invest" : "Defer"}</StatusChip>
                        <span className="font-mono text-xs tabular text-foreground">{i.p.toFixed(1)}</span>
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-lg border border-dashed border-border h-20 grid place-items-center text-[11px] text-muted-foreground">empty</div>
                  )}
                </div>
              ))}
            </div>
          </Card>

          {/* Analytics */}
          <div className="grid grid-cols-2 gap-4">
            <Card className="p-5">
              <SectionHeader title="Roadmap Funnel" sub="Drop-off across stages" />
              <FunnelChart data={funnel} />
            </Card>
            <Card className="p-5">
              <SectionHeader title="Impact vs Effort" sub="Bubble size = Priority Score" />
              <Quadrant />
            </Card>
          </div>
        </div>

        {/* Right 4/12 */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <Card className="p-5">
            <SectionHeader title="Phase Progress" />
            <ol className="space-y-1">
              {[
                { label: "Opportunity Scan", done: true },
                { label: "Roadmap Prioritization", done: true },
                { label: "Design", current: true },
                { label: "MVP", done: false },
                { label: "Production", done: false },
              ].map((p, i) => (
                <li key={p.label} className={`relative pl-5 py-2.5 border-l-2 ${p.current ? "border-primary" : "border-border"}`}>
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">{p.label}</div>
                    {p.current && (
                      <Link to="/project/roadmap" className="text-xs font-medium text-primary inline-flex items-center">Continue <ChevronRight className="h-3 w-3" /></Link>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">{p.done ? "Completed" : p.current ? "In progress · 42%" : "Locked"}</div>
                </li>
              ))}
            </ol>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Recent Activity" />
            <ul className="space-y-3 text-sm">
              {[
                ["M. Rivera", "scored", "Outage Comms VM", "1h ago"],
                ["A. Singh", "ran", "Understanding Agent on SOP-018", "3h ago"],
                ["J. Liu", "promoted", "Plant Performance Copilot to Design", "yesterday"],
                ["E. Davis", "added 2 use cases", "to Maintenance Triage", "yesterday"],
              ].map((a, i) => (
                <li key={i} className="flex gap-3">
                  <span className="h-7 w-7 rounded-full bg-surface-muted text-[10px] font-semibold grid place-items-center mt-0.5">{(a[0] as string).split(" ").map(x => x[0]).join("")}</span>
                  <div className="flex-1">
                    <div><span className="font-medium">{a[0]}</span> <span className="text-muted-foreground">{a[1]}</span> <span className="font-medium">{a[2]}</span></div>
                    <div className="text-xs text-muted-foreground">{a[3]}</div>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <SectionHeader title="Risks & Blockers" right={<StatusChip variant="fail">3 H</StatusChip>} />
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 p-2.5 rounded-md bg-danger-soft/60">
                <span className="h-1.5 w-1.5 rounded-full bg-danger mt-1.5" />
                <div><div className="font-medium">SCADA data lineage unverified</div><div className="text-xs text-muted-foreground">Plant Performance Copilot · owner A. Singh</div></div>
              </li>
              <li className="flex items-start gap-2 p-2.5 rounded-md bg-warning-soft/60">
                <span className="h-1.5 w-1.5 rounded-full bg-warning mt-1.5" />
                <div><div className="font-medium">SOP coverage at 62%</div><div className="text-xs text-muted-foreground">Maintenance Triage · run Understanding Agent</div></div>
              </li>
            </ul>
            <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-accent-violet"><Sparkles className="h-3 w-3" />Suggest mitigations</button>
          </Card>
        </div>
      </div>
    </div>
  );
}

function FunnelChart({ data }: { data: { label: string; v: number; pct: number }[] }) {
  const max = data[0].v;
  return (
    <svg viewBox="0 0 320 200" className="w-full h-56">
      {data.map((d, i) => {
        const top = (i / data.length) * 170 + 10;
        const h = 170 / data.length - 4;
        const w1 = (d.v / max) * 200;
        const next = data[i + 1]?.v ?? d.v;
        const w2 = (next / max) * 200;
        const cx = 110;
        return (
          <g key={d.label}>
            <polygon
              points={`${cx - w1 / 2},${top} ${cx + w1 / 2},${top} ${cx + w2 / 2},${top + h} ${cx - w2 / 2},${top + h}`}
              fill={`hsl(var(--primary) / ${0.85 - i * 0.13})`}
            />
            <text x={220} y={top + h / 2 + 4} className="text-[10px] fill-current text-foreground font-medium">
              {d.label}
            </text>
            <text x={300} y={top + h / 2 + 4} textAnchor="end" className="text-[10px] fill-current font-mono text-muted-foreground">
              {d.v} · {d.pct}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Quadrant() {
  const bubbles = [
    { x: 78, y: 22, r: 14, q: "q1", l: "Daily Ops Brief" },
    { x: 65, y: 38, r: 11, q: "q1", l: "Outage Comms" },
    { x: 70, y: 60, r: 9,  q: "q2", l: "Plant Copilot" },
    { x: 38, y: 28, r: 7,  q: "q3", l: "Fuel Proc." },
    { x: 30, y: 65, r: 6,  q: "q4", l: "Legacy ETL" },
  ];
  return (
    <svg viewBox="0 0 320 200" className="w-full h-56">
      <rect x="0" y="0" width="160" height="100" fill="hsl(var(--q3) / 0.07)" />
      <rect x="160" y="0" width="160" height="100" fill="hsl(var(--q1) / 0.08)" />
      <rect x="0" y="100" width="160" height="100" fill="hsl(var(--q4) / 0.06)" />
      <rect x="160" y="100" width="160" height="100" fill="hsl(var(--q2) / 0.08)" />
      <line x1="160" y1="0" x2="160" y2="200" stroke="hsl(var(--border))" />
      <line x1="0" y1="100" x2="320" y2="100" stroke="hsl(var(--border))" />
      {bubbles.map((b, i) => (
        <g key={i}>
          <circle cx={b.x * 3.2} cy={b.y * 2} r={b.r} fill={`hsl(var(--${b.q}))`} fillOpacity="0.85" />
          <text x={b.x * 3.2 + b.r + 4} y={b.y * 2 + 3} className="text-[9px] fill-current text-foreground">{b.l}</text>
        </g>
      ))}
      <text x="6" y="14" className="text-[9px] fill-current text-muted-foreground">High Impact</text>
      <text x="6" y="195" className="text-[9px] fill-current text-muted-foreground">Low Impact</text>
      <text x="314" y="195" textAnchor="end" className="text-[9px] fill-current text-muted-foreground">High Effort</text>
    </svg>
  );
}

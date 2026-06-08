import { Card, KpiTile, SectionHeader, StatusChip } from "@/components/primitives";

export default function Scan() {
  const dims = [
    { d: "Data Readiness", v: 72 },
    { d: "Tooling", v: 58 },
    { d: "Governance", v: 65 },
    { d: "Talent", v: 48 },
    { d: "Process Maturity", v: 70 },
    { d: "Change Mgmt", v: 52 },
  ];
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[28px] leading-9 font-semibold">Capability Scan</h1>
        <p className="text-sm text-muted-foreground">Organization-level readiness across 6 dimensions · last refreshed 3 days ago</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <KpiTile label="Composite Score" value="61" sub="out of 100" accent="primary" />
        <KpiTile label="Strongest" value="Data" sub="72 / 100" accent="success" />
        <KpiTile label="Weakest" value="Talent" sub="48 / 100" accent="warning" />
        <KpiTile label="Maturity Tier" value="T2" sub="Scaling" accent="violet" />
      </div>

      <div className="grid grid-cols-12 gap-6">
        <Card className="col-span-12 lg:col-span-7 p-5">
          <SectionHeader title="Readiness Radar" sub="Compare to sector cohort (P50, P75)" />
          <Radar dims={dims} />
        </Card>
        <Card className="col-span-12 lg:col-span-5 p-5">
          <SectionHeader title="Top Recommendations" />
          <ul className="space-y-3">
            {[
              ["Stand up MLOps platform", "Tooling · unlocks 4 Q1 use cases", "violet"],
              ["Charter agentic CoE", "Talent · 6-week build, sponsor needed", "primary"],
              ["Adopt PII tokenization", "Governance · prerequisite for Customer agents", "warning"],
              ["Run SOP digitization sprint", "Process · raises L1 pass rate to 95%", "success"],
            ].map((r, i) => (
              <li key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border">
                <span className="h-6 w-6 rounded-md bg-surface-muted grid place-items-center text-xs font-semibold font-mono">{i + 1}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{r[0]}</div>
                  <div className="text-xs text-muted-foreground">{r[1]}</div>
                </div>
                <StatusChip variant={r[2] as any} dot={false}>action</StatusChip>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Radar({ dims }: { dims: { d: string; v: number }[] }) {
  const cx = 200, cy = 180, R = 140;
  const N = dims.length;
  const pt = (i: number, v: number) => {
    const a = (Math.PI * 2 * i) / N - Math.PI / 2;
    const r = (v / 100) * R;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  };
  const poly = dims.map((d, i) => pt(i, d.v).join(",")).join(" ");
  const benchmark = dims.map((_, i) => pt(i, 65).join(",")).join(" ");

  return (
    <svg viewBox="0 0 400 360" className="w-full h-80">
      {[25, 50, 75, 100].map(p => (
        <polygon key={p} points={dims.map((_, i) => pt(i, p).join(",")).join(" ")} fill="none" stroke="hsl(var(--border))" />
      ))}
      {dims.map((d, i) => {
        const [x, y] = pt(i, 100);
        return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="hsl(var(--border))" />;
      })}
      <polygon points={benchmark} fill="hsl(var(--muted-foreground) / 0.12)" stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
      <polygon points={poly} fill="hsl(var(--primary) / 0.25)" stroke="hsl(var(--primary))" strokeWidth="2" />
      {dims.map((d, i) => {
        const [x, y] = pt(i, 115);
        return (
          <text key={d.d} x={x} y={y} textAnchor="middle" className="text-[11px] fill-current font-medium">
            {d.d} <tspan className="font-mono fill-current text-muted-foreground">· {d.v}</tspan>
          </text>
        );
      })}
    </svg>
  );
}

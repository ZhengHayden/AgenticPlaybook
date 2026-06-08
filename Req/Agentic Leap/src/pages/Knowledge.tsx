import { Search, Plus, Filter, Bookmark } from "lucide-react";
import { Card, SectionHeader, StatusChip } from "@/components/primitives";
import { cn } from "@/lib/utils";

const taxonomy = [
  { sector: "Energy & Utilities", count: 184, open: true, subs: [
    { name: "Power Generation", n: 62, vcs: ["Asset Mgmt (18)", "Fuel & Supply (12)", "Performance (20)", "Compliance (12)"] },
    { name: "T&D", n: 58 },
    { name: "Retail Energy", n: 64 },
  ]},
  { sector: "Financial Services", count: 142, subs: [] },
  { sector: "Industrials", count: 98, subs: [] },
  { sector: "Healthcare", count: 76, subs: [] },
  { sector: "Telco & Media", count: 54, subs: [] },
];

const cases = [
  { t: "Predictive maintenance for combined-cycle turbines", sector: "Power Gen", vc: "Asset Mgmt", maturity: "Scaled", kpi: "MTTR ↓ 32%", src: 14 },
  { t: "Agentic outage communications drafting", sector: "T&D", vc: "Customer Ops", maturity: "Production", kpi: "Handle time ↓ 48%", src: 9 },
  { t: "Multi-agent fuel procurement optimization", sector: "Power Gen", vc: "Supply Chain", maturity: "Pilot", kpi: "$3.1M / yr", src: 6 },
  { t: "Compliance change-watcher (NERC/FERC)", sector: "Utilities", vc: "Risk & Compliance", maturity: "Production", kpi: "Audit prep ↓ 60%", src: 11 },
  { t: "Field service triage copilot", sector: "T&D", vc: "Field Operations", maturity: "Pilot", kpi: "First-time fix ↑ 22%", src: 7 },
  { t: "Daily ops brief multi-agent", sector: "Power Gen", vc: "Operations", maturity: "Scaled", kpi: "Mgmt time ↓ 4h/day", src: 18 },
];

const maturityVariant = (m: string) => m === "Scaled" ? "pass" : m === "Production" ? "primary" : "review";

export default function Knowledge() {
  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] leading-9 font-semibold">Knowledge Base</h1>
          <p className="text-sm text-muted-foreground">554 codified agentic use cases across 5 sectors · refreshed daily from public + partner sources</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium rounded-md border border-border"><Bookmark className="h-4 w-4" />Saved views</button>
          <button className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground"><Plus className="h-4 w-4" />Submit case</button>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <aside className="col-span-12 lg:col-span-3">
          <Card className="p-4 sticky top-24">
            <div className="eyebrow mb-3">Taxonomy</div>
            <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-surface-muted mb-3">
              <Search className="h-3.5 w-3.5 text-muted-foreground" />
              <input placeholder="Sector or value chain…" className="bg-transparent text-xs flex-1 outline-none" />
            </div>
            <ul className="space-y-1 text-sm">
              {taxonomy.map((t) => (
                <li key={t.sector}>
                  <div className={cn("flex items-center justify-between px-2 py-1.5 rounded cursor-pointer", t.open ? "bg-primary-soft text-primary font-medium" : "hover:bg-surface-muted")}>
                    <span>{t.sector}</span>
                    <span className="font-mono text-[11px] tabular text-muted-foreground">{t.count}</span>
                  </div>
                  {t.open && t.subs?.map(s => (
                    <div key={s.name} className="pl-4 mt-1">
                      <div className="flex items-center justify-between px-2 py-1 text-xs">
                        <span className="font-medium">{s.name}</span>
                        <span className="font-mono text-[10px] text-muted-foreground">{s.n}</span>
                      </div>
                      {s.vcs?.map(v => (
                        <div key={v} className="pl-3 py-1 text-[11px] text-muted-foreground hover:text-foreground cursor-pointer">{v}</div>
                      ))}
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </Card>
        </aside>

        <section className="col-span-12 lg:col-span-9 space-y-4">
          <Card className="px-4 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-surface-muted flex-1 min-w-64">
              <Search className="h-4 w-4 text-muted-foreground" />
              <input placeholder="Search 554 codified cases…" className="bg-transparent text-sm flex-1 outline-none" />
            </div>
            <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>Maturity</option></select>
            <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>Solution type</option></select>
            <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>Vendor</option></select>
            <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>Geography</option></select>
            <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1"><Filter className="h-3.5 w-3.5" />More</button>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {cases.map((c) => (
              <Card key={c.t} className="overflow-hidden hover:border-primary/40 cursor-pointer">
                <div className="h-24 bg-gradient-to-br from-primary/15 via-accent-violet/10 to-transparent border-b border-border relative">
                  <div className="absolute top-3 right-3">
                    <StatusChip variant={maturityVariant(c.maturity)}>{c.maturity}</StatusChip>
                  </div>
                  <div className="absolute bottom-2 left-3 font-mono text-[10px] text-muted-foreground">KB-{Math.floor(Math.random() * 9000) + 1000}</div>
                </div>
                <div className="p-4">
                  <div className="font-semibold text-sm leading-snug mb-2">{c.t}</div>
                  <div className="flex flex-wrap gap-1 mb-3">
                    <StatusChip variant="info" dot={false}>{c.sector}</StatusChip>
                    <StatusChip variant="violet" dot={false}>{c.vc}</StatusChip>
                  </div>
                  <div className="rounded-md bg-success-soft px-2 py-1.5 text-[11px] text-success font-medium mb-3">{c.kpi}</div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{c.src} sources</span>
                    <button className="text-primary font-medium">Use as template →</button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

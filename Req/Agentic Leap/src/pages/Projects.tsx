import { Plus, Upload, MoreHorizontal, Search, LayoutGrid, Table2, Columns3 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { KpiTile, PipelineStepper, MiniPipeline, StatusChip, Card } from "@/components/primitives";

const projects = [
  { name: "UT — Golden Example", sponsor: "K. Tanaka · CLP/NEXT", domain: "Power Generation", stage: 2, progress: 42, owners: ["JL", "MR", "AS"], updated: "2h ago", health: "success" },
  { name: "Retail Customer Ops", sponsor: "P. Suarez · Retail BU", domain: "Customer Service", stage: 3, progress: 68, owners: ["JL", "ED"], updated: "5h ago", health: "success" },
  { name: "Grid Asset Reliability", sponsor: "M. Okafor · T&D", domain: "Asset Mgmt", stage: 1, progress: 22, owners: ["AS"], updated: "1d ago", health: "warning" },
  { name: "Finance Close Copilot", sponsor: "R. Chen · CFO Office", domain: "Finance", stage: 4, progress: 91, owners: ["JL", "ED", "MR"], updated: "3d ago", health: "success" },
  { name: "Field Service Triage", sponsor: "L. Park · Ops", domain: "Field Ops", stage: 0, progress: 8, owners: ["AS"], updated: "1w ago", health: "danger" },
];

const dotColor = (h: string) => ({ success: "bg-success", warning: "bg-warning", danger: "bg-danger" } as Record<string, string>)[h] ?? "bg-muted";

export default function Projects() {
  const navigate = useNavigate();
  return (
    <div className="space-y-8">

      <div className="flex items-end justify-between gap-6 flex-wrap">
        <div>
          <h1 className="font-display text-[28px] leading-9 font-semibold">Projects</h1>
          <p className="text-sm text-muted-foreground mt-1">5 projects across 4 domains · 206 candidates · 38 in Design</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium rounded-md border border-border hover:bg-surface-muted">
            <Upload className="h-4 w-4" /> Import
          </button>
          <button className="h-9 px-3 inline-flex items-center gap-1.5 text-sm font-medium rounded-md bg-primary text-primary-foreground hover:bg-primary-deep">
            <Plus className="h-4 w-4" /> New Project
          </button>
        </div>
      </div>

      

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiTile label="Projects" value="5" sub="+1 vs last quarter" trend={{ value: "+20%", positive: true }} accent="primary" />
        <KpiTile label="Candidates" value="206" sub="across 12 functions" trend={{ value: "+34", positive: true }} accent="violet" />
        <KpiTile label="In Design" value="38" sub="6 awaiting gate review" trend={{ value: "+8", positive: true }} accent="success" />
        <KpiTile label="In Production" value="6" sub="$4.2M annualized impact" trend={{ value: "+2", positive: true }} accent="warning" />
      </div>

      <Card>
        <div className="px-4 py-3 border-b border-border flex items-center gap-3">
          <div className="inline-flex rounded-md border border-border p-0.5 bg-surface-muted">
            {[
              { icon: Table2, label: "Table", active: true },
              { icon: LayoutGrid, label: "Cards" },
              { icon: Columns3, label: "Kanban" },
            ].map((v) => (
              <button key={v.label} className={`h-7 px-2.5 inline-flex items-center gap-1.5 text-xs font-medium rounded ${v.active ? "bg-surface shadow-sm" : "text-muted-foreground"}`}>
                <v.icon className="h-3.5 w-3.5" /> {v.label}
              </button>
            ))}
          </div>
          <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>All stages</option></select>
          <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>All domains</option></select>
          <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>All owners</option></select>
          <div className="ml-auto flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-surface-muted w-72">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search projects…" className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left eyebrow border-b border-border bg-surface-muted/50">
              <th className="px-4 py-2.5 w-6"></th>
              <th className="px-4 py-2.5">Project</th>
              <th className="px-4 py-2.5">Domain</th>
              <th className="px-4 py-2.5">Stage</th>
              <th className="px-4 py-2.5 w-40">Progress</th>
              <th className="px-4 py-2.5">Owners</th>
              <th className="px-4 py-2.5">Updated</th>
              <th className="px-4 py-2.5 w-8"></th>
            </tr>
          </thead>
          <tbody>
            {projects.map((p) => (
              <tr key={p.name} onClick={() => navigate("/project/overview")} className="border-b border-border last:border-0 hover:bg-surface-muted/40 cursor-pointer">
                <td className="px-4 py-3.5"><span className={`block h-2 w-2 rounded-full ${dotColor(p.health)}`} /></td>
                <td className="px-4 py-3.5">
                  <div className="font-medium">{p.name}</div>
                  <div className="text-xs text-muted-foreground">{p.sponsor}</div>
                </td>
                <td className="px-4 py-3.5"><StatusChip variant="info" dot={false}>{p.domain}</StatusChip></td>
                <td className="px-4 py-3.5"><MiniPipeline stage={p.stage} /></td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${p.progress}%` }} />
                    </div>
                    <span className="font-mono text-xs tabular w-9 text-right">{p.progress}%</span>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex -space-x-1.5">
                    {p.owners.map((o, i) => (
                      <span key={i} className="h-6 w-6 rounded-full ring-2 ring-surface bg-gradient-to-br from-primary to-accent-violet text-primary-foreground text-[10px] font-semibold grid place-items-center">{o}</span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3.5 font-mono text-xs text-muted-foreground tabular">{p.updated}</td>
                <td className="px-4 py-3.5"><MoreHorizontal className="h-4 w-4 text-muted-foreground" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

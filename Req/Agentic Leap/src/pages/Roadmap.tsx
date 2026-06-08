import { useState, Fragment } from "react";
import { Card, KpiTile, PipelineStepper, SectionHeader, StatusChip, ScoreCell } from "@/components/primitives";
import {
  Upload, Sparkles, ChevronDown, ChevronRight, Info, Save, RotateCcw, BookOpen,
  Search, Filter, Plus, Check, FileText, Users, Trash2,
  ArrowUpRight, GripVertical,
} from "lucide-react";
import { cn } from "@/lib/utils";

/* =====================================================================
   ROADMAP PRIORITIZATION
   4 stages: Candidates → Readiness → Sizing → Prioritization
===================================================================== */

type TabKey = "candidates" | "readiness" | "sizing" | "prio";
export type ViewMode = "workflow" | "usecase";

export default function Roadmap() {
  const [tab, setTab] = useState<TabKey>("candidates");
  const [view, setView] = useState<ViewMode>("workflow");

  const stepperState = (k: TabKey) => {
    const order: TabKey[] = ["candidates", "readiness", "sizing", "prio"];
    const cur = order.indexOf(tab);
    const i = order.indexOf(k);
    return i < cur ? "done" : i === cur ? "current" : "next";
  };

  const viewToggleDisabled = tab === "candidates";

  return (
    <div className="space-y-6 pb-20">
      {/* Sub-header */}
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-[28px] leading-9 font-semibold">Roadmap Prioritization</h1>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-accent-violet-soft text-accent-violet">Variant C — Adaptive Layered</span>
          </div>
          <p className="text-sm text-muted-foreground">From raw opportunities to a portfolio of prioritized use cases. Autosaves continuously.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">View</span>
          <div className={cn(
            "inline-flex rounded-md border border-border p-0.5 bg-surface-muted text-xs",
            viewToggleDisabled && "opacity-50 pointer-events-none"
          )}>
            <button onClick={() => setView("workflow")} className={cn("h-7 px-3 rounded font-medium", view === "workflow" ? "bg-surface shadow-sm" : "text-muted-foreground")}>Workflow</button>
            <button onClick={() => setView("usecase")} className={cn("h-7 px-3 rounded font-medium", view === "usecase" ? "bg-surface shadow-sm" : "text-muted-foreground")}>Use case</button>
          </div>
        </div>
      </div>


      <PipelineStepper steps={[
        { label: "Candidates",     count: 24, state: stepperState("candidates") as any },
        { label: "Readiness",      count: 13, pct: 54, state: stepperState("readiness") as any },
        { label: "Sizing",         count: 11, pct: 46, state: stepperState("sizing") as any },
        { label: "Prioritization", count: 8,  pct: 33, state: stepperState("prio") as any },
      ]} />

      <div className="grid grid-cols-4 gap-4">
        <KpiTile label="Captured"   value="24" sub="from 4 sources"           accent="primary" />
        <KpiTile label="Screened"   value="13" sub="11 pass · 2 mitigate"      accent="success" />
        <KpiTile label="Sized"      value="11" sub="avg impact $1.4M/yr"       accent="violet" />
        <KpiTile label="Prioritized" value="8" sub="top score 4.7 · gate-ready" accent="warning" />
      </div>

      {/* Inner tabs */}
      <div className="flex items-center gap-1 border-b border-border">
        {[
          { k: "candidates", l: "1 · Candidate Selection", sub: "24" },
          { k: "readiness",  l: "2 · Readiness Check",     sub: "13" },
          { k: "sizing",     l: "3 · Impact Sizing",       sub: "11" },
          { k: "prio",       l: "4 · Prioritization",      sub: "8" },
        ].map(t => (
          <button key={t.k} onClick={() => setTab(t.k as TabKey)} className={cn(
            "relative h-11 px-4 text-sm font-medium inline-flex items-center gap-2",
            tab === t.k ? "text-primary" : "text-muted-foreground hover:text-foreground"
          )}>
            {t.l}
            <span className={cn(
              "font-mono text-[10px] tabular px-1.5 py-0.5 rounded",
              tab === t.k ? "bg-primary-soft text-primary" : "bg-surface-muted text-muted-foreground"
            )}>{t.sub}</span>
            {tab === t.k && <span className="absolute inset-x-3 bottom-0 h-0.5 bg-primary" />}
          </button>
        ))}
      </div>

      {tab === "candidates" && <CandidateSelection />}
      {tab === "readiness"  && <ReadinessCheck view={view} />}
      {tab === "sizing"     && <ImpactSizing view={view} />}
      {tab === "prio"       && <Prioritization view={view} />}


      {/* Sticky footer */}
      <div className="sticky bottom-4 z-30">
        <div className="rounded-xl border border-border bg-surface/90 backdrop-blur shadow-lg px-4 py-2.5 flex items-center justify-between">
          <span className="text-xs text-muted-foreground"><span className="inline-block h-1.5 w-1.5 rounded-full bg-success mr-1.5" />Saved · 2 seconds ago</span>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Tool Reference</button>
            <button className="h-8 px-3 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><RotateCcw className="h-3.5 w-3.5" />Reset</button>
            <button className="h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"><Save className="h-3.5 w-3.5" />Promote to next stage <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* =====================================================================
   1. CANDIDATE SELECTION
===================================================================== */

const sources = [
  { id: "scan",  label: "Opportunity Scan",   count: 11, icon: Sparkles, hint: "auto-detected from sources" },
  { id: "ws",    label: "Workshop Intake",    count: 6,  icon: Users,    hint: "stakeholder workshops" },
  { id: "kb",    label: "Knowledge Base",     count: 4,  icon: BookOpen, hint: "industry reference cases" },
  { id: "import",label: "Imported CSV / RFP", count: 3,  icon: Upload,   hint: "bulk uploaded" },
];

const candidatesRaw = [
  { id: 1,  name: "Daily Ops Brief Agent",       fn: "Generation",    src: "scan", origin: "SOP-018 · workshop notes", dupe: false, included: true,  conf: 0.92 },
  { id: 2,  name: "Outage Communications",       fn: "Customer",      src: "ws",   origin: "Customer Ops workshop",     dupe: false, included: true,  conf: 0.88 },
  { id: 3,  name: "Plant Performance Copilot",   fn: "Generation",    src: "scan", origin: "Asset health backlog",      dupe: false, included: true,  conf: 0.90 },
  { id: 4,  name: "Anomaly Detection on Turbines", fn: "Generation",  src: "kb",   origin: "EDF benchmark case 2024",   dupe: true,  included: true,  conf: 0.78 },
  { id: 5,  name: "Maintenance Triage",          fn: "Operations",    src: "ws",   origin: "T&D workshop",              dupe: false, included: true,  conf: 0.81 },
  { id: 6,  name: "Fuel Procurement Negotiator", fn: "Supply Chain",  src: "scan", origin: "Procurement audit 2025-Q1", dupe: false, included: true,  conf: 0.74 },
  { id: 7,  name: "Compliance Watcher",          fn: "Risk",          src: "kb",   origin: "NERC ruleset · peer case",  dupe: false, included: true,  conf: 0.85 },
  { id: 8,  name: "Legacy ETL Modernization",    fn: "Data",          src: "import",origin: "IT backlog import",        dupe: false, included: false, conf: 0.41 },
  { id: 9,  name: "Field Service Summary",       fn: "Field Ops",     src: "ws",   origin: "Field crew workshop",        dupe: true,  included: false, conf: 0.62 },
  { id: 10, name: "Invoice Reconciliation Bot",  fn: "Finance",       src: "import",origin: "Finance RFP",              dupe: false, included: true,  conf: 0.69 },
];

function CandidateSelection() {
  const [sel, setSel] = useState<number[]>([1, 2, 3, 5, 7]);
  const [filter, setFilter] = useState<string>("all");

  const toggle = (id: number) =>
    setSel(s => s.includes(id) ? s.filter(x => x !== id) : [...s, id]);

  const list = candidatesRaw.filter(c => filter === "all" || c.src === filter);

  return (
    <div className="space-y-5">
      {/* Source bar */}
      <div className="grid grid-cols-4 gap-3">
        {sources.map(s => {
          const active = filter === s.id;
          return (
            <button key={s.id} onClick={() => setFilter(active ? "all" : s.id)} className={cn(
              "rounded-xl border bg-surface p-4 text-left transition-colors",
              active ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"
            )}>
              <div className="flex items-start justify-between">
                <div className="h-8 w-8 rounded-md bg-primary-soft text-primary grid place-items-center"><s.icon className="h-4 w-4" /></div>
                <span className="font-mono text-xl tabular font-semibold">{s.count}</span>
              </div>
              <div className="mt-2 text-sm font-medium">{s.label}</div>
              <div className="text-[11px] text-muted-foreground">{s.hint}</div>
            </button>
          );
        })}
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-border flex items-center gap-3 flex-wrap">
          <div className="text-sm">
            <span className="font-semibold">{sel.length}</span>
            <span className="text-muted-foreground"> of {list.length} selected</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2 h-8 px-2.5 rounded-md border border-border bg-surface-muted w-72">
            <Search className="h-3.5 w-3.5 text-muted-foreground" />
            <input placeholder="Search candidates…" className="bg-transparent text-sm flex-1 outline-none placeholder:text-muted-foreground" />
          </div>
          <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />Filters</button>
          <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5 text-warning"><Sparkles className="h-3.5 w-3.5" />Detect duplicates · 2</button>
          <div className="ml-auto flex items-center gap-2">
            <button className="h-8 px-3 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><Trash2 className="h-3.5 w-3.5" />Reject</button>
            <button className="h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5"><Plus className="h-3.5 w-3.5" />Add manually</button>
          </div>
        </div>

        <table className="w-full text-sm">
          <thead>
            <tr className="text-left eyebrow border-b border-border bg-surface-muted/50">
              <th className="px-4 py-2.5 w-8"></th>
              <th className="px-4 py-2.5">Candidate</th>
              <th className="px-4 py-2.5">Function</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5">Origin / Evidence</th>
              <th className="px-4 py-2.5 w-32">Confidence</th>
              <th className="px-4 py-2.5">Flags</th>
            </tr>
          </thead>
          <tbody>
            {list.map(c => {
              const checked = sel.includes(c.id);
              const SrcIcon = sources.find(s => s.id === c.src)?.icon ?? FileText;
              return (
                <tr key={c.id} className={cn(
                  "border-b border-border last:border-0 hover:bg-surface-muted/40 cursor-pointer",
                  checked && "bg-primary-soft/30"
                )} onClick={() => toggle(c.id)}>
                  <td className="px-4 py-3">
                    <span className={cn(
                      "inline-grid place-items-center h-4 w-4 rounded border",
                      checked ? "bg-primary border-primary" : "border-border bg-surface"
                    )}>
                      {checked && <Check className="h-3 w-3 text-primary-foreground" />}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3"><StatusChip variant="info" dot={false}>{c.fn}</StatusChip></td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                      <SrcIcon className="h-3.5 w-3.5" />
                      {sources.find(s => s.id === c.src)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.origin}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden max-w-[80px]">
                        <div className={cn("h-full", c.conf >= 0.8 ? "bg-success" : c.conf >= 0.6 ? "bg-warning" : "bg-danger")} style={{ width: `${c.conf * 100}%` }} />
                      </div>
                      <span className="font-mono text-xs tabular">{(c.conf * 100).toFixed(0)}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {c.dupe && <StatusChip variant="review">duplicate</StatusChip>}
                    {!c.dupe && c.conf < 0.7 && <StatusChip variant="fail">low conf.</StatusChip>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

/* =====================================================================
   2. READINESS CHECK
===================================================================== */

const gates = ["DOC", "DATA", "VOL", "OWN", "QLTY", "STAB"];
const gateLabels: Record<string, string> = {
  DOC: "Process documentability",
  DATA: "Digital data accessibility",
  VOL: "Execution volume",
  OWN: "Owner identified",
  QLTY: "Data quality",
  STAB: "Process stability",
};
const candidates = [
  { id: 1, name: "Daily Ops Brief Agent",       fn: "Generation",   scores: [1, 1, 1, 1, 1, 1], status: "pass", uc: 4 },
  { id: 2, name: "Outage Communications",       fn: "Customer",     scores: [1, 1, 1, 1, 1, 1], status: "pass", uc: 3 },
  { id: 3, name: "Plant Performance Copilot",   fn: "Generation",   scores: [1, 1, 1, 1, 1, 1], status: "pass", uc: 4 },
  { id: 4, name: "Maintenance Triage",          fn: "Operations",   scores: [1, 1, 0, 1, 1, 1], status: "review", uc: 5 },
  { id: 5, name: "Fuel Procurement",            fn: "Supply Chain", scores: [1, 0, 1, 0, 1, 1], status: "review", uc: 2 },
  { id: 6, name: "Compliance Watcher",          fn: "Risk",         scores: [1, 1, 1, 1, 1, 1], status: "pass", uc: 6 },
  { id: 7, name: "Legacy ETL Modernization",    fn: "Data",         scores: [0, 1, 0, 0, 1, 0], status: "fail", uc: 1 },
];

/* Shared workflow → use cases dataset (1:n) used by Readiness / Sizing / Prioritization views */
type UseCaseRow = {
  id: string; wfId: number; wf: string; fn: string; name: string;
  scores: number[]; status: "pass" | "review" | "fail";
  vol: number; hrs: number; fte: number; savings: number; conf: "H" | "M" | "L"; payback: number;
  vm: number; ddi: number; ras: number; p: number; q: "q1" | "q2" | "q3" | "q4"; sol: string;
};
const useCases: UseCaseRow[] = [
  // Daily Ops Brief Agent
  { id:"1a", wfId:1, wf:"Daily Ops Brief Agent", fn:"Generation", name:"Morning ops digest generation", scores:[1,1,1,1,1,1], status:"pass", vol:900, hrs:0.7, fte:160, savings:240, conf:"H", payback:4, vm:4.5, ddi:0.84, ras:4.2, p:4.8, q:"q1", sol:"Agent" },
  { id:"1b", wfId:1, wf:"Daily Ops Brief Agent", fn:"Generation", name:"Shift handover summary", scores:[1,1,1,1,1,1], status:"pass", vol:600, hrs:0.6, fte:100, savings:140, conf:"H", payback:5, vm:4.2, ddi:0.78, ras:3.9, p:4.5, q:"q1", sol:"Agent" },
  { id:"1c", wfId:1, wf:"Daily Ops Brief Agent", fn:"Generation", name:"Exec-ready KPI snapshot", scores:[1,1,1,1,1,1], status:"pass", vol:300, hrs:1.2, fte:60, savings:100, conf:"M", payback:6, vm:4.0, ddi:0.72, ras:3.8, p:4.3, q:"q1", sol:"Copilot" },
  // Outage Communications
  { id:"2a", wfId:2, wf:"Outage Communications", fn:"Customer", name:"Customer SMS / email drafting", scores:[1,1,1,1,1,1], status:"pass", vol:140, hrs:1.4, fte:55, savings:130, conf:"H", payback:6, vm:4.3, ddi:0.76, ras:4.1, p:4.7, q:"q1", sol:"Copilot" },
  { id:"2b", wfId:2, wf:"Outage Communications", fn:"Customer", name:"Regulator notification packet", scores:[1,1,1,1,1,1], status:"pass", vol:100, hrs:1.7, fte:35, savings:90, conf:"H", payback:7, vm:4.0, ddi:0.70, ras:3.8, p:4.4, q:"q1", sol:"Copilot" },
  // Plant Performance Copilot
  { id:"3a", wfId:3, wf:"Plant Performance Copilot", fn:"Generation", name:"Heat-rate deviation triage", scores:[1,1,1,1,1,1], status:"pass", vol:320, hrs:2.0, fte:120, savings:240, conf:"M", payback:7, vm:4.2, ddi:0.74, ras:4.0, p:4.6, q:"q1", sol:"Copilot" },
  { id:"3b", wfId:3, wf:"Plant Performance Copilot", fn:"Generation", name:"Anomaly detection on turbines", scores:[1,1,1,1,1,1], status:"pass", vol:220, hrs:2.6, fte:80, savings:170, conf:"M", payback:8, vm:3.9, ddi:0.66, ras:3.7, p:4.2, q:"q2", sol:"Agent" },
  // Maintenance Triage
  { id:"4a", wfId:4, wf:"Maintenance Triage", fn:"Operations", name:"Work-order classification", scores:[1,1,1,1,1,1], status:"pass", vol:700, hrs:0.5, fte:90, savings:115, conf:"M", payback:9, vm:3.6, ddi:0.60, ras:3.5, p:4.0, q:"q2", sol:"Workflow" },
  { id:"4b", wfId:4, wf:"Maintenance Triage", fn:"Operations", name:"Crew dispatch recommendation", scores:[1,1,0,1,1,1], status:"review", vol:400, hrs:0.8, fte:50, savings:60, conf:"M", payback:11, vm:3.3, ddi:0.55, ras:3.2, p:3.6, q:"q2", sol:"Workflow" },
  // Fuel Procurement
  { id:"5a", wfId:5, wf:"Fuel Procurement", fn:"Supply Chain", name:"Spot price negotiation memo", scores:[1,0,1,0,1,1], status:"review", vol:40, hrs:6.5, fte:40, savings:65, conf:"L", payback:12, vm:3.7, ddi:0.46, ras:3.3, p:3.9, q:"q3", sol:"RPA" },
  { id:"5b", wfId:5, wf:"Fuel Procurement", fn:"Supply Chain", name:"Contract clause extraction", scores:[1,1,1,0,1,1], status:"review", vol:20, hrs:5.0, fte:20, savings:30, conf:"L", payback:14, vm:3.4, ddi:0.42, ras:3.0, p:3.6, q:"q3", sol:"RPA" },
  // Compliance Watcher
  { id:"6a", wfId:6, wf:"Compliance Watcher", fn:"Risk", name:"NERC rule change detection", scores:[1,1,1,1,1,1], status:"pass", vol:200, hrs:1.0, fte:50, savings:80, conf:"H", payback:5, vm:3.1, ddi:0.58, ras:3.0, p:3.5, q:"q2", sol:"Agent" },
  { id:"6b", wfId:6, wf:"Compliance Watcher", fn:"Risk", name:"Audit-trail compilation", scores:[1,1,1,1,1,1], status:"pass", vol:120, hrs:1.5, fte:30, savings:50, conf:"H", payback:6, vm:2.9, ddi:0.52, ras:2.8, p:3.3, q:"q2", sol:"Agent" },
  // Legacy ETL
  { id:"7a", wfId:7, wf:"Legacy ETL Modernization", fn:"Data", name:"Pipeline auto-doc", scores:[0,1,0,0,1,0], status:"fail", vol:30, hrs:4.0, fte:25, savings:25, conf:"L", payback:18, vm:1.8, ddi:0.30, ras:1.9, p:2.1, q:"q4", sol:"RPA" },
];

function ReadinessCheck({ view }: { view: ViewMode }) {
  const [expanded, setExpanded] = useState<number | null>(view === "workflow" ? 1 : null);
  const isUC = view === "usecase";
  return (
    <Card>
      <div className="px-5 py-3.5 border-b border-border flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">6 binary readiness gates</span>
          <span className="text-muted-foreground">· Pass ≥ 5/6 (1 exception requires mitigation)</span>
          <button className="ml-1 inline-flex items-center gap-1 text-xs text-primary"><BookOpen className="h-3 w-3" />Rubric</button>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-muted-foreground">
            {isUC ? `${useCases.length} use cases across ${candidates.length} workflows` : `${candidates.length} workflows`}
          </span>
          <select className="h-8 px-2 text-xs rounded-md border border-border bg-surface"><option>All functions</option></select>
          <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border hover:bg-surface-muted inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Run Understanding Agent (all)</button>
        </div>
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="text-left eyebrow border-b border-border bg-surface-muted/50">
            <th className="px-4 py-2.5 w-6"></th>
            <th className="px-4 py-2.5">{isUC ? "Use case" : "Workflow"}</th>
            {isUC && <th className="px-4 py-2.5">Workflow</th>}
            <th className="px-4 py-2.5">Function</th>
            {gates.map(g => (
              <th key={g} className="px-1 py-2.5 text-center w-14" title={gateLabels[g]}>
                <div className="flex flex-col items-center gap-0.5">
                  <span>{g}</span>
                  <Info className="h-3 w-3 text-muted-foreground/70" />
                </div>
              </th>
            ))}
            <th className="px-4 py-2.5">Score</th>
            <th className="px-4 py-2.5">Status</th>
            {!isUC && <th className="px-4 py-2.5">Use Cases</th>}
          </tr>
        </thead>
        <tbody>
          {isUC ? useCases.map((u) => (
            <tr key={u.id} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
              <td className="px-4 py-3.5 text-muted-foreground font-mono text-[10px]">{u.id}</td>
              <td className="px-4 py-3.5 font-medium">{u.name}</td>
              <td className="px-4 py-3.5 text-xs text-muted-foreground">{u.wf}</td>
              <td className="px-4 py-3.5"><StatusChip variant="info" dot={false}>{u.fn}</StatusChip></td>
              {u.scores.map((s, i) => (
                <td key={i} className="px-1 py-3.5 text-center">
                  <span className={cn("inline-block h-2.5 w-2.5 rounded-full", s ? "bg-success" : "bg-danger")} />
                </td>
              ))}
              <td className="px-4 py-3.5"><ScoreCell score={u.scores.filter(Boolean).length} total={6} items={u.scores.map(Boolean)} /></td>
              <td className="px-4 py-3.5"><StatusChip variant={u.status as any}>{u.status.toUpperCase()}</StatusChip></td>
            </tr>
          )) : candidates.map((c) => (
            <Fragment key={c.id}>
              <tr onClick={() => setExpanded(expanded === c.id ? null : c.id)} className="border-b border-border last:border-0 hover:bg-surface-muted/40 cursor-pointer">
                <td className="px-4 py-3.5">{expanded === c.id ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}</td>
                <td className="px-4 py-3.5 font-medium">{c.name}</td>
                <td className="px-4 py-3.5"><StatusChip variant="info" dot={false}>{c.fn}</StatusChip></td>
                {c.scores.map((s, i) => (
                  <td key={i} className="px-1 py-3.5 text-center">
                    <span className={cn("inline-block h-2.5 w-2.5 rounded-full", s ? "bg-success" : "bg-danger")} />
                  </td>
                ))}
                <td className="px-4 py-3.5"><ScoreCell score={c.scores.filter(Boolean).length} total={6} items={c.scores.map(Boolean)} /></td>
                <td className="px-4 py-3.5"><StatusChip variant={c.status as any}>{c.status.toUpperCase()}</StatusChip></td>
                <td className="px-4 py-3.5 font-mono text-xs tabular text-muted-foreground">{useCases.filter(u => u.wfId === c.id).length}</td>
              </tr>

              {expanded === c.id && (
                <tr className="bg-surface-muted/30 border-b border-border">
                  <td colSpan={12} className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-sm font-semibold">Evidence · {c.name}</div>
                      <div className="flex items-center gap-2">
                        <button className="h-8 px-3 text-xs font-medium rounded-md border border-border hover:bg-surface inline-flex items-center gap-1.5"><Upload className="h-3.5 w-3.5" />Upload SOP (PDF)</button>
                        <button className="h-8 px-3 text-xs font-medium rounded-md bg-accent-violet text-white inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" />Run Understanding Agent</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        ["Process documentability", true, "SOP-018 covers 92% of steps"],
                        ["Digital data accessibility", true, "Snowflake + REST APIs"],
                        ["Execution volume", true, "~1,400 runs/mo"],
                        ["Owner identified", true, "M. Okafor (T&D)"],
                        ["Data quality", true, "DQ score 0.86"],
                        ["Process stability", false, "Quarterly changes in NERC rules"],
                      ].map(([label, ok, note], i) => (
                        <div key={i} className={cn("rounded-lg border p-3", ok ? "border-border bg-surface" : "border-danger/40 bg-danger-soft")}>
                          <div className="flex items-center justify-between mb-1">
                            <div className="text-xs font-semibold">{label as string}</div>
                            <StatusChip variant={ok ? "pass" : "fail"} dot={false}>{ok ? "Yes" : "No"}</StatusChip>
                          </div>
                          <div className="text-xs text-muted-foreground">{note as string}</div>
                          {!ok && (
                            <div className="mt-2 space-y-1">
                              <input placeholder="Gap…" className="w-full h-7 px-2 text-xs rounded border border-border bg-surface" />
                              <input placeholder="Mitigation…" className="w-full h-7 px-2 text-xs rounded border border-border bg-surface" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </td>
                </tr>
              )}
            </Fragment>
          ))}
        </tbody>
      </table>
    </Card>
  );
}

/* =====================================================================
   3. IMPACT SIZING
===================================================================== */

const sizingRows = [
  { id: 1, name: "Daily Ops Brief Agent",     fn: "Generation",  vol: 1800, hrs: 0.9, fte: 320, savings: 480, conf: "H", payback: 4 },
  { id: 2, name: "Outage Communications",     fn: "Customer",    vol: 240,  hrs: 1.5, fte: 90,  savings: 220, conf: "H", payback: 6 },
  { id: 3, name: "Plant Performance Copilot", fn: "Generation",  vol: 540,  hrs: 2.4, fte: 200, savings: 410, conf: "M", payback: 7 },
  { id: 4, name: "Maintenance Triage",        fn: "Operations",  vol: 1100, hrs: 0.6, fte: 140, savings: 175, conf: "M", payback: 9 },
  { id: 5, name: "Fuel Procurement",          fn: "Supply Chain",vol: 60,   hrs: 6.0, fte: 60,  savings: 95,  conf: "L", payback: 12 },
  { id: 6, name: "Compliance Watcher",        fn: "Risk",        vol: 320,  hrs: 1.2, fte: 80,  savings: 130, conf: "H", payback: 5 },
];

function ImpactSizing({ view }: { view: ViewMode }) {
  const [selected, setSelected] = useState(1);
  const [selectedUC, setSelectedUC] = useState<string>("1a");
  const isUC = view === "usecase";

  const row = sizingRows.find(r => r.id === selected)!;
  const ucRow = useCases.find(u => u.id === selectedUC) ?? useCases[0];

  const totalVol = isUC ? useCases.reduce((a, u) => a + u.vol, 0) : sizingRows.reduce((a, r) => a + r.vol, 0);
  const totalFte = isUC ? useCases.reduce((a, u) => a + u.fte, 0) : sizingRows.reduce((a, r) => a + r.fte, 0);
  const totalSav = isUC ? useCases.reduce((a, u) => a + u.savings, 0) : sizingRows.reduce((a, r) => a + r.savings, 0);

  return (
    <div className="grid grid-cols-12 gap-5">
      {/* Table */}
      <div className="col-span-12 xl:col-span-8 space-y-5">
        <Card>
          <div className="px-5 py-3 border-b border-border flex items-center justify-between">
            <div className="text-sm">
              <span className="font-semibold">Impact estimates</span>
              <span className="text-muted-foreground"> · drivers: volume × handle time × FTE cost − automation cost</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground">{isUC ? `${useCases.length} use cases` : `${sizingRows.length} workflows`}</span>
              <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><BookOpen className="h-3.5 w-3.5" />Assumptions</button>
            </div>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left eyebrow border-b border-border bg-surface-muted/50">
                <th className="px-4 py-2.5">{isUC ? "Use case" : "Workflow"}</th>
                <th className="px-4 py-2.5 text-right">Volume / mo</th>
                <th className="px-4 py-2.5 text-right">Avg hrs</th>
                <th className="px-4 py-2.5 text-right">FTE saved ($k)</th>
                <th className="px-4 py-2.5 text-right">Net savings ($k/yr)</th>
                <th className="px-4 py-2.5">Confidence</th>
                <th className="px-4 py-2.5 text-right">Payback (mo)</th>
              </tr>
            </thead>
            <tbody>
              {isUC ? useCases.map(u => (
                <tr key={u.id} onClick={() => setSelectedUC(u.id)} className={cn(
                  "border-b border-border last:border-0 cursor-pointer hover:bg-surface-muted/40",
                  selectedUC === u.id && "bg-primary-soft/40"
                )}>
                  <td className="px-4 py-3 font-medium">
                    {u.name}
                    <div className="text-xs text-muted-foreground">{u.wf} · {u.fn}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular">{u.vol.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{u.hrs.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{u.fte}</td>
                  <td className="px-4 py-3 text-right"><span className="font-mono tabular font-semibold text-success">${u.savings}k</span></td>
                  <td className="px-4 py-3">
                    <StatusChip variant={u.conf === "H" ? "pass" : u.conf === "M" ? "review" : "fail"} dot={false}>
                      {u.conf === "H" ? "High" : u.conf === "M" ? "Medium" : "Low"}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{u.payback}</td>
                </tr>
              )) : sizingRows.map(r => {
                const ucCount = useCases.filter(u => u.wfId === r.id).length;
                return (
                <tr key={r.id} onClick={() => setSelected(r.id)} className={cn(
                  "border-b border-border last:border-0 cursor-pointer hover:bg-surface-muted/40",
                  selected === r.id && "bg-primary-soft/40"
                )}>
                  <td className="px-4 py-3 font-medium">
                    {r.name}
                    <div className="text-xs text-muted-foreground">{r.fn}{ucCount > 0 && <> · <span className="text-primary">{ucCount} use cases</span></>}</div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular">{r.vol.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{r.hrs.toFixed(1)}</td>
                  <td className="px-4 py-3 text-right font-mono tabular">{r.fte}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono tabular font-semibold text-success">${r.savings}k</span>
                  </td>
                  <td className="px-4 py-3">
                    <StatusChip variant={r.conf === "H" ? "pass" : r.conf === "M" ? "review" : "fail"} dot={false}>
                      {r.conf === "H" ? "High" : r.conf === "M" ? "Medium" : "Low"}
                    </StatusChip>
                  </td>
                  <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{r.payback}</td>
                </tr>
                );
              })}
              <tr className="bg-surface-muted/60 font-semibold">
                <td className="px-4 py-3">Portfolio total</td>
                <td className="px-4 py-3 text-right font-mono tabular">{totalVol.toLocaleString()}</td>
                <td />
                <td className="px-4 py-3 text-right font-mono tabular">{totalFte}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-success">${totalSav}k</td>
                <td />
                <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">~6</td>
              </tr>
            </tbody>
          </table>
        </Card>

        <Card className="p-5">
          <SectionHeader title={isUC ? "Sized impact — use cases" : "Sized impact — workflows"} sub="Net annual savings, $k — bar color = confidence" />
          <ImpactBars rows={isUC
            ? useCases.map(u => ({ id: u.id as any, name: u.name, savings: u.savings, conf: u.conf, payback: u.payback } as any))
            : sizingRows} />
        </Card>
      </div>


      {/* Sidecar — Drivers calculator */}
      <aside className="col-span-12 xl:col-span-4 space-y-4">
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="eyebrow">Sizing model · {isUC ? "use case" : "workflow"}</div>
              <div className="font-display text-base font-semibold">{isUC ? ucRow.name : row.name}</div>
              {isUC && <div className="text-[11px] text-muted-foreground">{ucRow.wf}</div>}
            </div>
            <StatusChip variant="violet" dot={false}>{isUC ? ucRow.fn : row.fn}</StatusChip>
          </div>

          {(() => {
            const sVol = isUC ? ucRow.vol : row.vol;
            const sHrs = isUC ? ucRow.hrs : row.hrs;
            return [
              { label: "Monthly volume",         val: sVol,  max: 2000, suffix: " runs" },
              { label: "Avg handle time",        val: sHrs,  max: 8,    suffix: " hrs" },
              { label: "Automation rate",        val: 70,    max: 100,  suffix: "%" },
              { label: "Loaded FTE cost",        val: 95,    max: 200,  suffix: "k/yr" },
              { label: "Implementation cost",    val: 120,   max: 500,  suffix: "k" },
            ];
          })().map(s => (
            <div key={s.label} className="mb-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-muted-foreground">{s.label}</span>
                <span className="font-mono tabular font-medium">{s.val}{s.suffix}</span>
              </div>
              <div className="h-1.5 rounded-full bg-surface-muted overflow-hidden">
                <div className="h-full bg-primary" style={{ width: `${(s.val / s.max) * 100}%` }} />
              </div>
            </div>
          ))}

          <div className="mt-4 rounded-lg border border-border p-3 bg-surface-muted/40 space-y-1 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">Gross savings</span><span>${(isUC ? ucRow.savings : row.savings) + 80}k</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">− Run cost</span><span>−$80k</span></div>
            <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
              <span>Net annual</span><span className="text-success">${isUC ? ucRow.savings : row.savings}k</span>
            </div>
            <div className="text-[10px] text-muted-foreground pt-1">Payback {isUC ? ucRow.payback : row.payback} mo · confidence {isUC ? ucRow.conf : row.conf}</div>
          </div>
        </Card>


        <Card className="p-5">
          <div className="eyebrow mb-2">Assumption log</div>
          <ul className="space-y-2 text-xs">
            <li className="flex justify-between"><span><span className="text-foreground font-medium">J. Liu</span> · volume +20%</span><span className="font-mono text-muted-foreground">2h</span></li>
            <li className="flex justify-between"><span><span className="text-foreground font-medium">M. Rivera</span> · automation 65→70%</span><span className="font-mono text-muted-foreground">1d</span></li>
            <li className="flex justify-between"><span><span className="text-foreground font-medium">CFO Office</span> · FTE rate update</span><span className="font-mono text-muted-foreground">3d</span></li>
          </ul>
        </Card>
      </aside>
    </div>
  );
}

type ImpactBarRow = { id: string | number; name: string; savings: number; conf: string; payback: number };
function ImpactBars({ rows }: { rows: ImpactBarRow[] }) {
  const max = Math.max(...rows.map(r => r.savings));
  return (
    <div className="space-y-2.5">
      {[...rows].sort((a, b) => b.savings - a.savings).map(r => (
        <div key={r.id} className="flex items-center gap-3">
          <div className="w-44 text-xs truncate">{r.name}</div>
          <div className="flex-1 h-6 rounded bg-surface-muted overflow-hidden relative">
            <div
              className={cn("h-full",
                r.conf === "H" ? "bg-success" : r.conf === "M" ? "bg-warning" : "bg-muted-foreground/50"
              )}
              style={{ width: `${(r.savings / max) * 100}%` }}
            />
            <span className="absolute inset-y-0 left-2 inline-flex items-center text-[10px] font-mono tabular text-white font-semibold">${r.savings}k</span>
          </div>
          <span className="w-12 text-right text-[11px] text-muted-foreground">{r.payback}mo</span>
        </div>
      ))}
    </div>
  );
}


/* =====================================================================
   4. PRIORITIZATION
===================================================================== */

function Prioritization({ view }: { view: ViewMode }) {
  const isUC = view === "usecase";

  // Use case rows
  const ucRows = useCases.map((u, i) => ({
    n: i + 1, key: u.id, uc: u.name, wf: u.wf, q: u.q, vm: u.vm, ddi: u.ddi, ras: u.ras, p: u.p, sol: u.sol,
  })).sort((a, b) => b.p - a.p).map((r, i) => ({ ...r, n: i + 1 }));

  // Workflow rows — aggregated from use cases (avg VM/DDI/RAS, weighted by sum of savings? — use simple avg for mock)
  const wfMap = new Map<string, { wf: string; ucs: typeof useCases; }>();
  useCases.forEach(u => {
    const e = wfMap.get(u.wf);
    if (e) e.ucs.push(u); else wfMap.set(u.wf, { wf: u.wf, ucs: [u] });
  });
  const wfRows = Array.from(wfMap.values()).map((g, i) => {
    const n = g.ucs.length;
    const vm = g.ucs.reduce((a, u) => a + u.vm, 0) / n;
    const ddi = g.ucs.reduce((a, u) => a + u.ddi, 0) / n;
    const ras = g.ucs.reduce((a, u) => a + u.ras, 0) / n;
    const p = ras * (1 + 0.25 * ddi);
    // dominant quadrant = quadrant of top-priority use case
    const top = [...g.ucs].sort((a, b) => b.p - a.p)[0];
    return { n: i + 1, key: g.wf, wf: g.wf, uc: g.wf, q: top.q, vm, ddi, ras, p, sol: top.sol, ucCount: n };
  }).sort((a, b) => b.p - a.p).map((r, i) => ({ ...r, n: i + 1 }));

  const rows: any[] = isUC ? ucRows : wfRows;

  const portfolioP = (rows.reduce((a, r) => a + r.p, 0) / rows.length).toFixed(2);
  const vmAvg = (rows.reduce((a, r) => a + r.vm, 0) / rows.length).toFixed(2);
  const ddiAvg = (rows.reduce((a, r) => a + r.ddi, 0) / rows.length).toFixed(2);
  const rasAvg = (rows.reduce((a, r) => a + r.ras, 0) / rows.length).toFixed(2);

  const quadCounts = (["q1","q2","q3","q4"] as const).map(q => ({
    q, n: rows.filter(r => r.q === q).length,
  }));
  const quadLabels: Record<string, string> = { q1: "Quick Win", q2: "Sponsor & Align", q3: "Invest & Prove", q4: "Defer & Mature" };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-12 gap-5">
        <Card className="col-span-12 xl:col-span-8 p-5">
          <SectionHeader
            title="Prioritization Matrix"
            sub={`Impact (VM × RAS) vs Implementation effort · bubble = Priority · ${isUC ? `${rows.length} use cases` : `${rows.length} workflows`}`}
            right={<div className="flex items-center gap-2 text-xs">
              <StatusChip variant="pass">Saved</StatusChip>
              <button className="h-8 px-3 rounded-md border border-border font-medium">PDF</button>
              <button className="h-8 px-3 rounded-md border border-border font-medium">XLSX</button>
            </div>}
          />
          <QuadrantMatrix rows={rows} />
          <div className="mt-4 grid grid-cols-4 gap-3 text-[11px]">
            {[
              { q: "q1", l: "Quick Win",       d: "High impact · low effort — execute now" },
              { q: "q2", l: "Sponsor & Align", d: "High impact · high effort — secure backing" },
              { q: "q3", l: "Invest & Prove",  d: "Lower impact · low effort — pilot rapidly" },
              { q: "q4", l: "Defer & Mature",  d: "Low impact · high effort — park" },
            ].map(x => (
              <div key={x.q} className="rounded-lg border border-border p-3">
                <StatusChip variant={x.q}>{x.l}</StatusChip>
                <div className="mt-1.5 text-muted-foreground">{x.d}</div>
              </div>
            ))}
          </div>
        </Card>

        <aside className="col-span-12 xl:col-span-4 space-y-4">
          <Card className="p-5">
            <div className="eyebrow">Portfolio Priority</div>
            <div className="mt-2 flex items-end gap-3">
              <span className="font-display text-[44px] leading-none font-semibold tabular">{portfolioP}</span>
              <StatusChip variant="pass">Healthy</StatusChip>
            </div>
            <div className="text-[11px] text-muted-foreground mt-1">avg over {rows.length} prioritized {isUC ? "use cases" : "workflows"}</div>

            <div className="mt-4 rounded-lg border border-border p-3 bg-surface-muted/40 space-y-1.5 text-xs font-mono">
              <div className="flex justify-between"><span className="text-muted-foreground">VM avg</span><span>{vmAvg}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">DDI avg</span><span>{ddiAvg}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">RAS avg</span><span>{rasAvg}</span></div>
              <div className="border-t border-border pt-1.5 flex justify-between font-semibold">
                <span>Priority</span><span>{portfolioP}</span>
              </div>
              <div className="text-[10px] text-muted-foreground pt-1">= RAS × (1 + 0.25 × DDI)</div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="eyebrow mb-2">Quadrant distribution</div>
            <div className="space-y-2">
              {quadCounts.map(d => (
                <div key={d.q} className="flex items-center gap-3">
                  <StatusChip variant={d.q}>{quadLabels[d.q]}</StatusChip>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-muted overflow-hidden">
                    <div className="h-full" style={{ width: `${(d.n / rows.length) * 100}%`, background: `hsl(var(--${d.q}))` }} />
                  </div>
                  <span className="font-mono text-xs tabular w-6 text-right">{d.n}</span>
                </div>
              ))}
            </div>
          </Card>
        </aside>
      </div>

      <Card>
        <div className="px-5 py-3 border-b border-border flex items-center justify-between">
          <div className="text-sm font-semibold">Ranked Portfolio · {isUC ? "Use cases" : "Workflows"}</div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-2.5 text-xs font-medium rounded-md border border-border inline-flex items-center gap-1.5"><Filter className="h-3.5 w-3.5" />Filter</button>
            <button className="h-8 px-3 text-xs font-medium rounded-md bg-primary text-primary-foreground inline-flex items-center gap-1.5">Promote top 5 to Design <ArrowUpRight className="h-3.5 w-3.5" /></button>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left eyebrow border-b border-border bg-surface-muted/50">
              <th className="px-4 py-2.5 w-6"></th>
              <th className="px-4 py-2.5 w-10">#</th>
              <th className="px-4 py-2.5">{isUC ? "Use case" : "Workflow"}</th>
              {isUC ? <th className="px-4 py-2.5">Workflow</th> : <th className="px-4 py-2.5 text-right">Use cases</th>}
              <th className="px-4 py-2.5">Quadrant</th>
              <th className="px-4 py-2.5 text-right">VM</th>
              <th className="px-4 py-2.5 text-right">DDI</th>
              <th className="px-4 py-2.5 text-right">RAS</th>
              <th className="px-4 py-2.5 text-right">Priority</th>
              <th className="px-4 py-2.5">Solution</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.key} className="border-b border-border last:border-0 hover:bg-surface-muted/40">
                <td className="px-4 py-3 text-muted-foreground"><GripVertical className="h-4 w-4" /></td>
                <td className="px-4 py-3 font-mono text-xs tabular text-muted-foreground">{r.n}</td>
                <td className="px-4 py-3 font-medium">{r.uc}</td>
                {isUC
                  ? <td className="px-4 py-3 text-muted-foreground">{r.wf}</td>
                  : <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{r.ucCount}</td>}
                <td className="px-4 py-3"><StatusChip variant={r.q}>{quadLabels[r.q]}</StatusChip></td>
                <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{r.vm.toFixed(1)}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{r.ddi.toFixed(2)}</td>
                <td className="px-4 py-3 text-right font-mono tabular text-muted-foreground">{r.ras.toFixed(1)}</td>
                <td className="px-4 py-3 text-right">
                  <span className={cn(
                    "font-mono text-sm tabular px-2 py-0.5 rounded",
                    r.p >= 4 ? "bg-success-soft text-success font-semibold" :
                    r.p >= 3 ? "text-foreground font-semibold" :
                    "text-muted-foreground"
                  )}>{r.p.toFixed(1)}</span>
                </td>
                <td className="px-4 py-3"><StatusChip variant="violet" dot={false}>{r.sol}</StatusChip></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}


function QuadrantMatrix({ rows }: { rows: { uc: string; q: string; vm: number; ras: number; ddi: number; p: number }[] }) {
  // Map each row to coords: x = effort (1-DDI), y = impact (VM·RAS rescaled), r = priority bubble
  const pts = rows.map(r => {
    const impact = (r.vm * r.ras) / 20; // ~0..1
    const effort = 1 - r.ddi;            // higher DDI = lower effort
    return {
      x: 8 + effort * 84,           // 8..92 (left=low effort)
      y: 92 - impact * 84,           // 8..92 (top=high impact)
      r: 6 + r.p * 2.2,
      q: r.q,
      l: r.uc.length > 18 ? r.uc.slice(0, 17) + "…" : r.uc,
    };
  });

  return (
    <svg viewBox="0 0 400 260" className="w-full h-72">
      <rect x="0" y="0" width="200" height="130" fill="hsl(var(--q3) / 0.07)" />
      <rect x="200" y="0" width="200" height="130" fill="hsl(var(--q1) / 0.08)" />
      <rect x="0" y="130" width="200" height="130" fill="hsl(var(--q4) / 0.06)" />
      <rect x="200" y="130" width="200" height="130" fill="hsl(var(--q2) / 0.08)" />
      <line x1="200" y1="0" x2="200" y2="260" stroke="hsl(var(--border))" />
      <line x1="0" y1="130" x2="400" y2="130" stroke="hsl(var(--border))" />
      <text x="8" y="16"  className="text-[10px] fill-current font-semibold text-q3">Invest & Prove</text>
      <text x="392" y="16" textAnchor="end" className="text-[10px] fill-current font-semibold text-q1">Quick Win</text>
      <text x="8" y="252" className="text-[10px] fill-current font-semibold text-q4">Defer & Mature</text>
      <text x="392" y="252" textAnchor="end" className="text-[10px] fill-current font-semibold text-q2">Sponsor & Align</text>
      <text x="200" y="258" textAnchor="middle" className="text-[9px] fill-current text-muted-foreground">Implementation effort →</text>
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p.x * 4} cy={p.y * 2.6} r={p.r} fill={`hsl(var(--${p.q}))`} fillOpacity="0.85" />
          <text x={p.x * 4 + p.r + 4} y={p.y * 2.6 + 3} className="text-[9px] fill-current text-foreground">{p.l}</text>
        </g>
      ))}
    </svg>
  );
}

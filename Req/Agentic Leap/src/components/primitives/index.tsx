import { cn } from "@/lib/utils";
import { Check, ChevronRight, TrendingUp, type LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

/* ---------------- KpiTile ---------------- */
export function KpiTile({
  label, value, sub, trend, accent, icon: Icon,
}: {
  label: string; value: ReactNode; sub?: string;
  trend?: { value: string; positive?: boolean };
  accent?: "primary" | "violet" | "success" | "warning";
  icon?: LucideIcon;
}) {
  const accentClass = {
    primary: "from-primary/10",
    violet: "from-accent-violet/10",
    success: "from-success/10",
    warning: "from-warning/10",
  }[accent ?? "primary"];
  return (
    <div className={cn("relative rounded-xl border border-border bg-surface p-5 overflow-hidden")}>
      <div className={cn("absolute inset-x-0 top-0 h-16 bg-gradient-to-b to-transparent pointer-events-none", accentClass)} />
      <div className="relative flex items-start justify-between">
        <div className="eyebrow">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="relative mt-2 flex items-baseline gap-2">
        <span className="font-display text-[32px] leading-9 font-semibold tabular">{value}</span>
        {trend && (
          <span className={cn(
            "inline-flex items-center gap-0.5 text-[11px] font-medium px-1.5 py-0.5 rounded",
            trend.positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
          )}>
            <TrendingUp className={cn("h-3 w-3", !trend.positive && "rotate-180")} />
            {trend.value}
          </span>
        )}
      </div>
      {sub && <div className="relative mt-1 text-xs text-muted-foreground">{sub}</div>}
    </div>
  );
}

/* ---------------- StatusChip ---------------- */
const chipMap: Record<string, string> = {
  pass: "bg-success-soft text-success",
  review: "bg-warning-soft text-warning",
  fail: "bg-danger-soft text-danger",
  screened: "bg-success-soft text-success",
  "not-ready": "bg-muted text-muted-foreground",
  info: "bg-info-soft text-info",
  q1: "bg-q1-soft text-q1",
  q2: "bg-q2-soft text-q2",
  q3: "bg-q3-soft text-q3",
  q4: "bg-q4-soft text-q4",
  violet: "bg-accent-violet-soft text-accent-violet",
  primary: "bg-primary-soft text-primary",
};

export function StatusChip({ variant = "info", children, dot = true }: { variant?: keyof typeof chipMap | string; children: ReactNode; dot?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold", chipMap[variant] ?? chipMap.info)}>
      {dot && <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}

/* ---------------- ScoreCell ---------------- */
export function ScoreCell({ score, total, items }: { score: number; total: number; items?: boolean[] }) {
  const segs = items ?? Array.from({ length: total }, (_, i) => i < score);
  return (
    <div className="flex items-center gap-2">
      <span className="font-mono text-sm tabular">{score}/{total}</span>
      <div className="flex gap-0.5">
        {segs.map((ok, i) => (
          <span key={i} className={cn("h-2 w-3 rounded-sm", ok ? "bg-success" : "bg-danger/70")} />
        ))}
      </div>
    </div>
  );
}

/* ---------------- PipelineStepper ---------------- */
export type Step = { label: string; count?: number; pct?: number; state: "done" | "current" | "next" | "disabled" };
export function PipelineStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-stretch w-full rounded-xl border border-border bg-surface overflow-hidden">
      {steps.map((s, i) => {
        const isLast = i === steps.length - 1;
        const stateCls =
          s.state === "done" ? "bg-success-soft text-success" :
          s.state === "current" ? "bg-primary text-primary-foreground" :
          s.state === "next" ? "bg-surface text-foreground" :
          "bg-surface text-muted-foreground";
        return (
          <div key={s.label} className={cn("flex-1 relative px-5 py-3 flex items-center gap-3", stateCls)}>
            <span className={cn(
              "h-6 w-6 rounded-full grid place-items-center text-[11px] font-semibold",
              s.state === "done" ? "bg-success text-success-foreground" :
              s.state === "current" ? "bg-primary-foreground/20" :
              "bg-surface-muted text-muted-foreground border border-border"
            )}>
              {s.state === "done" ? <Check className="h-3 w-3 text-white" /> : i + 1}
            </span>
            <div className="min-w-0">
              <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{s.label}</div>
              <div className="text-sm font-medium tabular">
                {s.count !== undefined ? s.count : "—"}
                {s.pct !== undefined && <span className="ml-1 opacity-70 text-xs">· {s.pct}%</span>}
              </div>
            </div>
            {!isLast && (
              <ChevronRight className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 text-border z-10 bg-surface rounded-full" />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------------- MiniPipeline ---------------- */
export function MiniPipeline({ stage }: { stage: number }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className={cn(
          "h-1.5 w-6 rounded-full",
          i < stage ? "bg-primary" : i === stage ? "bg-primary/60" : "bg-border"
        )} />
      ))}
    </div>
  );
}

/* ---------------- Section / Card ---------------- */
export function Card({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("rounded-xl border border-border bg-surface", className)}>{children}</div>;
}
export function SectionHeader({ title, sub, right }: { title: string; sub?: string; right?: ReactNode }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div>
        <h2 className="font-display text-lg font-semibold">{title}</h2>
        {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
      </div>
      {right}
    </div>
  );
}

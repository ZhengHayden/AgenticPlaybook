"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, FileText, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge, IdBadge } from "@/components/ui/badge";
import { StatusChip, type ChipState } from "@/components/ui/status-chip";
import { StatTile } from "@/components/ui/stat-tile";
import { Pill, type PillTone } from "@/components/ui/pill";
import { MiniPipeline } from "@/components/ui/mini-pipeline";
import { EmptyState } from "@/components/ui/empty-state";
import { OverflowMenu } from "@/components/ui/overflow-menu";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PhasePath } from "@/components/ui/phase-path";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { StackedBar } from "@/components/charts/stacked-bar";
import { ImpactEffortScatter } from "@/components/charts/impact-effort-scatter";

// Literal class strings — Tailwind v4 only generates utilities it sees verbatim.
const BRAND_RAMP: ReadonlyArray<[string, string]> = [
  ["brand-50", "bg-brand-50"],
  ["brand-100", "bg-brand-100"],
  ["brand-300", "bg-brand-300"],
  ["brand-600", "bg-brand-600"],
  ["brand-700", "bg-brand-700"],
  ["brand-800", "bg-brand-800"],
];
const STATES: ChipState[] = ["ready", "warn", "block", "info", "neutral"];
const STATE_FG: ReadonlyArray<[string, string]> = [
  ["state-ready", "bg-state-ready"],
  ["state-warn", "bg-state-warn"],
  ["state-block", "bg-state-block"],
  ["state-info", "bg-state-info"],
  ["state-neutral", "bg-state-neutral"],
];
const STATE_BG: ReadonlyArray<[string, string]> = [
  ["state-ready-bg", "bg-state-ready-bg"],
  ["state-warn-bg", "bg-state-warn-bg"],
  ["state-block-bg", "bg-state-block-bg"],
  ["state-info-bg", "bg-state-info-bg"],
  ["state-neutral-bg", "bg-state-neutral-bg"],
];
const ACCENTS: ReadonlyArray<[string, string]> = [
  ["primary", "bg-primary"],
  ["primary-deep", "bg-primary-deep"],
  ["primary-soft", "bg-primary-soft"],
  ["accent-violet", "bg-accent-violet"],
  ["accent-violet-soft", "bg-accent-violet-soft"],
];
const QUADRANTS: ReadonlyArray<[string, string]> = [
  ["q1", "bg-q1"],
  ["q2", "bg-q2"],
  ["q3", "bg-q3"],
  ["q4", "bg-q4"],
];
const PILL_TONES: PillTone[] = [
  "neutral",
  "primary",
  "violet",
  "info",
  "success",
  "warning",
  "danger",
  "q1",
  "q2",
  "q3",
  "q4",
];
const NEUTRALS: ReadonlyArray<[string, string]> = [
  ["canvas", "bg-canvas"],
  ["surface", "bg-surface"],
  ["subtle", "bg-subtle"],
  ["hairline", "bg-hairline"],
  ["hairline-strong", "bg-hairline-strong"],
  ["ink", "bg-ink"],
  ["ink-muted", "bg-ink-muted"],
  ["ink-faint", "bg-ink-faint"],
];

function Swatch({ token, className }: { token: string; className: string }) {
  return (
    <div className="flex flex-col gap-1">
      <div className={`h-12 w-full rounded-md border border-slate-200 ${className}`} />
      <code className="text-[11px] text-ink-faint">{token}</code>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-sm font-semibold uppercase tracking-[0.04em] text-ink-faint">{title}</h2>
      <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {children}
      </div>
    </section>
  );
}

const PHASE_STEPS = [
  { href: "#a", base: "#a", label: "Candidates", meta: "43" },
  { href: "#b", base: "#zzz", label: "Readiness", meta: "6" },
  { href: "#c", base: "#zzz", label: "Impact & Risk", meta: "6" },
  { href: "#d", base: "#zzz", label: "Priority", meta: "3" },
  { href: "#e", base: "#zzz", label: "Gate" },
];

export default function StyleguidePage() {
  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="mx-auto max-w-5xl space-y-8 py-2">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Style Guide</h1>
        <p className="mt-1 text-sm text-ink-muted">
          Design tokens, primitives, and states for QA (proposal §9.5).
        </p>
      </header>

      <Section title="Brand ramp">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
          {BRAND_RAMP.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
        </div>
      </Section>

      <Section title="Semantic state palette">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STATE_FG.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
          {STATE_BG.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
        </div>
      </Section>

      <Section title="Accent & AI">
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {ACCENTS.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
        </div>
      </Section>

      <Section title="Priority quadrants">
        <div className="grid grid-cols-4 gap-3">
          {QUADRANTS.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
        </div>
      </Section>

      <Section title="Neutrals">
        <div className="grid grid-cols-4 gap-3 sm:grid-cols-8">
          {NEUTRALS.map(([token, cls]) => (
            <Swatch key={token} token={token} className={cls} />
          ))}
        </div>
      </Section>

      <Section title="StatusChip">
        <div className="flex flex-wrap items-center gap-3">
          {STATES.map((s) => (
            <StatusChip key={s} state={s}>
              {s}
            </StatusChip>
          ))}
          {STATES.map((s) => (
            <StatusChip key={`${s}-sm`} state={s} size="sm">
              {s}
            </StatusChip>
          ))}
        </div>
      </Section>

      <Section title="Pill (category / quadrant)">
        <div className="flex flex-wrap items-center gap-2">
          {PILL_TONES.map((tone) => (
            <Pill key={tone} tone={tone} dot>
              {tone}
            </Pill>
          ))}
        </div>
      </Section>

      <Section title="MiniPipeline">
        <div className="flex flex-wrap items-center gap-6">
          {[0, 1, 2, 3].map((s) => (
            <div key={s} className="flex flex-col items-center gap-1">
              <MiniPipeline stage={s} total={4} />
              <code className="text-[11px] text-ink-faint">stage {s}</code>
            </div>
          ))}
        </div>
      </Section>

      <Section title="StatTile">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <StatTile label="Projects" value={6} accent="primary" />
          <StatTile label="Candidates" value={201} accent="violet" delta={{ value: 12, label: "this wk" }} />
          <StatTile label="In review" value={27} accent="success" hint="9 awaiting owner" />
          <StatTile label="Blocked" value={3} accent="warning" delta={{ value: -2, invert: true, label: "vs prior" }} />
        </div>
      </Section>

      <Section title="Buttons & badges">
        <div className="flex flex-wrap items-center gap-3">
          <Button>
            <Plus className="h-4 w-4" /> Primary
          </Button>
          <Button variant="secondary">
            <Pencil className="h-4 w-4" /> Secondary
          </Button>
          <Button variant="danger">
            <Trash2 className="h-4 w-4" /> Danger
          </Button>
          <Button variant="ghost">
            <Sparkles className="h-4 w-4" /> Ghost
          </Button>
          <Badge ok>validated</Badge>
          <Badge>neutral</Badge>
          <IdBadge>F-01</IdBadge>
        </div>
      </Section>

      <Section title="Overflow menu & confirm dialog">
        <div className="flex items-center gap-4">
          <OverflowMenu
            label="More actions"
            items={[
              { label: "Edit", icon: <Pencil className="h-4 w-4" />, onSelect: () => {} },
              { label: "Delete", icon: <Trash2 className="h-4 w-4" />, danger: true, onSelect: () => setConfirmOpen(true) },
            ]}
          />
          <Button variant="secondary" onClick={() => setConfirmOpen(true)}>
            Open confirm dialog
          </Button>
        </div>
        <ConfirmDialog
          open={confirmOpen}
          onClose={() => setConfirmOpen(false)}
          onConfirm={() => setConfirmOpen(false)}
          title="Delete sample?"
          description="This demonstrates the re-type gate."
          requireText="DELETE"
          requireTextLabel="Type DELETE to confirm"
          confirmLabel="Delete"
          cancelLabel="Cancel"
        />
      </Section>

      <Section title="Empty state">
        <EmptyState
          icon={<FileText className="h-4 w-4" />}
          title="No artifacts yet"
          description="Attach a playbook, SOP, or evaluation to this use case."
          action={<Button>+ Add artifact</Button>}
        />
      </Section>

      <Section title="Roadmap stepper (PhasePath)">
        <PhasePath steps={PHASE_STEPS} />
      </Section>

      <Section title="Charts">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-semibold">Funnel</h3>
            <FunnelChart
              data={[
                { name: "Candidates", value: 43 },
                { name: "Screened", value: 18 },
                { name: "Design", value: 6 },
                { name: "MVP", value: 3 },
                { name: "Production", value: 1 },
              ]}
            />
          </div>
          <div>
            <h3 className="mb-2 text-sm font-semibold">Stacked bar</h3>
            <StackedBar
              data={[
                { fn: "Finance", passed: 4, failed: 2 },
                { fn: "Supply Chain", passed: 3, failed: 3 },
                { fn: "R&D", passed: 2, failed: 1 },
              ]}
              xKey="fn"
              series={[
                { key: "passed", label: "Screened", color: "var(--color-state-ready)" },
                { key: "failed", label: "Below threshold", color: "var(--color-state-block)" },
              ]}
            />
          </div>
          <div className="lg:col-span-2">
            <h3 className="mb-2 text-sm font-semibold">Impact vs. effort</h3>
            <ImpactEffortScatter
              xLabel="Effort"
              yLabel="Impact"
              points={[
                { name: "A", effort: 20, impact: 80 },
                { name: "B", effort: 60, impact: 70 },
                { name: "C", effort: 40, impact: 35 },
                { name: "D", effort: 75, impact: 25 },
              ]}
            />
          </div>
        </div>
      </Section>
    </div>
  );
}

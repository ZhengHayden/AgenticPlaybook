"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import { PhasePath, type PhasePathStep } from "@/components/ui/phase-path";
import type { ScoringMode } from "@/content/sample-data";
import type { ImpactSizingKpis } from "@/content/impact-sizing-kpis";
import { ScoringModeSwitchSlot } from "./scoring-mode-switch-slot";

interface ImpactSizingShellProps {
  projectId: string;
  variant: "A" | "B" | "C";
  scoringMode: ScoringMode;
  kpis: ImpactSizingKpis;
  /** Whether the Readiness Check step is part of this variant's flow. */
  hasScreen: boolean;
  children: ReactNode;
}

const VARIANT_LABEL: Record<"A" | "B" | "C", { en: string; zh: string }> = {
  A: { en: "Variant A — Sequential", zh: "方案 A — 精确顺序" },
  B: { en: "Variant B — Funnel-First", zh: "方案 B — 漏斗优先" },
  C: { en: "Variant C — Adaptive Layered", zh: "方案 C — 自适应分层" },
};

const KPI_LABEL = {
  en: { candidates: "Candidates", screened: "Screened", notReady: "Not ready", top: "Top priority" },
  zh: { candidates: "候选", screened: "已筛选", notReady: "未就绪", top: "最高优先级" },
};

/**
 * Impact Sizing phase shell: a phase header, the chevron progress Path, and a
 * persistent highlights strip. Wraps every step so the methodology flow and the
 * key counts stay visible as the user moves through candidates → gate.
 */
export function ImpactSizingShell({
  projectId,
  variant,
  scoringMode,
  kpis,
  hasScreen,
  children,
}: ImpactSizingShellProps) {
  const { t, locale } = useLocale();
  const base = `/projects/${projectId}/impact-sizing`;
  const kpiLabel = KPI_LABEL[locale];

  const steps: PhasePathStep[] = [
    { href: `${base}/candidates`, label: t.impactSizing.candidates, meta: String(kpis.candidates) },
    ...(hasScreen
      ? [{ href: `${base}/screen`, label: t.impactSizing.screen, meta: String(kpis.screened) }]
      : []),
    { href: `${base}/scoring`, label: t.impactSizing.scoring, meta: String(kpis.screened) },
    { href: `${base}/portfolio`, label: t.impactSizing.portfolio },
    { href: `${base}/gate`, label: t.impactSizing.gate },
  ];

  const highlights: Array<{ label: string; value: string; tone?: "brand" }> = [
    { label: kpiLabel.candidates, value: String(kpis.candidates) },
    { label: kpiLabel.screened, value: String(kpis.screened) },
    { label: kpiLabel.notReady, value: String(kpis.notReady) },
    {
      label: kpiLabel.top,
      value: kpis.topPriority > 0 ? kpis.topPriority.toFixed(1) : "—",
      tone: "brand",
    },
  ];

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h1 className="text-xl font-semibold tracking-tight">{t.phases.impactSizing}</h1>
          <span className="text-xs text-slate-500">{VARIANT_LABEL[variant][locale]}</span>
        </div>
        <ScoringModeSwitchSlot projectId={projectId} mode={scoringMode} />
      </div>

      <PhasePath steps={steps} />

      <dl className="mt-4 flex flex-wrap items-stretch gap-px overflow-hidden rounded-md border border-slate-200 bg-slate-200 dark:border-slate-800 dark:bg-slate-800">
        {highlights.map((h) => (
          <div
            key={h.label}
            className="flex-1 bg-white px-4 py-2.5 dark:bg-slate-900"
            style={{ minWidth: "9rem" }}
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
              {h.label}
            </dt>
            <dd
              className={
                h.tone === "brand"
                  ? "mt-0.5 text-lg font-bold tabular-nums text-brand-700 dark:text-brand-300"
                  : "mt-0.5 text-lg font-bold tabular-nums text-slate-800 dark:text-slate-100"
              }
            >
              {h.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-5">{children}</div>
    </div>
  );
}

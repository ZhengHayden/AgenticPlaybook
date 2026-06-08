"use client";

import type { ReactNode } from "react";
import { useLocale } from "@/lib/locale-context";
import { PhasePath, type PhasePathStep } from "@/components/ui/phase-path";
import { StatTile, type StatTileAccent } from "@/components/ui/stat-tile";
import { Pill } from "@/components/ui/pill";
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

  const highlights: Array<{ label: string; value: string; accent: StatTileAccent }> = [
    { label: kpiLabel.candidates, value: String(kpis.candidates), accent: "primary" },
    { label: kpiLabel.screened, value: String(kpis.screened), accent: "success" },
    { label: kpiLabel.notReady, value: String(kpis.notReady), accent: "warning" },
    {
      label: kpiLabel.top,
      value: kpis.topPriority > 0 ? kpis.topPriority.toFixed(1) : "—",
      accent: "violet",
    },
  ];

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-[28px] font-semibold leading-9 tracking-tight">
            {t.phases.impactSizing}
          </h1>
          <Pill tone="violet">{VARIANT_LABEL[variant][locale]}</Pill>
        </div>
        <ScoringModeSwitchSlot projectId={projectId} mode={scoringMode} />
      </div>

      <PhasePath steps={steps} />

      <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {highlights.map((h) => (
          <StatTile key={h.label} label={h.label} value={h.value} accent={h.accent} />
        ))}
      </div>

      <div className="mt-6">{children}</div>
    </div>
  );
}

"use client";

import { useMemo } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Project } from "@/content/sample-data";
import { FunnelChart } from "@/components/charts/funnel-chart";
import { StackedBar } from "@/components/charts/stacked-bar";
import { ImpactEffortScatter } from "@/components/charts/impact-effort-scatter";
import { EmptyState } from "@/components/ui/empty-state";
import { BarChart3 } from "lucide-react";
import { overviewAnalytics } from "./overview-analytics-data";

interface OverviewAnalyticsProps {
  project: Project;
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <h3 className="mb-3 text-sm font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

/**
 * Portfolio analytics block (proposal §5.9): roadmap funnel, candidates by
 * function (stacked by readiness), and a Layer-2 impact/effort scatter. All
 * colors come from the semantic palette.
 */
export function OverviewAnalytics({ project }: OverviewAnalyticsProps) {
  const { t } = useLocale();
  const data = useMemo(
    () => overviewAnalytics(project, t.analytics.unassigned),
    [project, t.analytics.unassigned],
  );

  const funnelData = [
    { name: t.analytics.stageCandidates, value: data.funnel.candidates },
    { name: t.analytics.stageScreened, value: data.funnel.screened },
    { name: t.analytics.stageDesign, value: data.funnel.design },
    { name: t.analytics.stageMvp, value: data.funnel.mvp },
    { name: t.analytics.stageProduction, value: data.funnel.production },
  ];

  const hasCandidates = data.funnel.candidates > 0;

  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold tracking-tight">{t.analytics.title}</h2>
      {hasCandidates ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <ChartCard title={t.analytics.funnelTitle}>
            <FunnelChart data={funnelData} />
          </ChartCard>
          <ChartCard title={t.analytics.byFunctionTitle}>
            <StackedBar
              data={data.byFunction as unknown as Record<string, string | number>[]}
              xKey="fn"
              series={[
                { key: "passed", label: t.analytics.passed, color: "var(--color-state-ready)" },
                { key: "failed", label: t.analytics.failed, color: "var(--color-state-block)" },
              ]}
            />
          </ChartCard>
          <ChartCard title={t.analytics.scatterTitle}>
            {data.scatter.length > 0 ? (
              <ImpactEffortScatter
                points={data.scatter}
                xLabel={t.analytics.axisEffort}
                yLabel={t.analytics.axisImpact}
              />
            ) : (
              <EmptyState icon={<BarChart3 className="h-4 w-4" />} title={t.analytics.noData} />
            )}
          </ChartCard>
        </div>
      ) : (
        <EmptyState icon={<BarChart3 className="h-4 w-4" />} title={t.analytics.noData} />
      )}
    </section>
  );
}

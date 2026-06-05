"use client";

import { useLocale } from "@/lib/locale-context";
import { PillTabs, type PillTab } from "@/components/ui/pill-tabs";
import type { PhaseId } from "@/content/sample-data";

interface ProjectTabsProps {
  projectId: string;
  currentPhase: PhaseId;
}

export function ProjectTabs({ projectId, currentPhase: _currentPhase }: ProjectTabsProps) {
  const { t } = useLocale();

  const tabs: PillTab[] = [
    { href: `/projects/${projectId}/overview`, label: t.project.overview },
    { href: `/projects/${projectId}/impact-sizing/candidates`, label: t.phases.impactSizing, base: `/projects/${projectId}/impact-sizing` },
    { href: `/projects/${projectId}/design/workflow`, label: t.phases.design, base: `/projects/${projectId}/design` },
    { href: `/projects/${projectId}/opportunity`, label: t.project.opportunity },
    { href: `/projects/${projectId}/artifacts`, label: "Artifacts" },
  ];

  return <PillTabs tabs={tabs} />;
}

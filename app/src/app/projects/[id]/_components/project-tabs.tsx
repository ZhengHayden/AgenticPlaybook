"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";
import type { PhaseId } from "@/content/sample-data";

interface ProjectTabsProps {
  projectId: string;
  currentPhase: PhaseId;
}

export function ProjectTabs({ projectId, currentPhase: _currentPhase }: ProjectTabsProps) {
  const { t } = useLocale();
  const pathname = usePathname();

  const tabs = [
    { href: `/projects/${projectId}/overview`, label: t.project.overview },
    { href: `/projects/${projectId}/impact-sizing/candidates`, label: t.phases.impactSizing, base: `/projects/${projectId}/impact-sizing` },
    { href: `/projects/${projectId}/design/workflow`, label: t.phases.design, base: `/projects/${projectId}/design` },
    { href: `/projects/${projectId}/opportunity`, label: t.project.opportunity },
    { href: `/projects/${projectId}/artifacts`, label: "Artifacts" },
  ];

  return (
    <nav className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {tabs.map((tab) => {
        const active = tab.base ? pathname.startsWith(tab.base) : pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "border-b-2 px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "border-indigo-600 text-zinc-900 dark:text-zinc-50"
                : "border-transparent text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}

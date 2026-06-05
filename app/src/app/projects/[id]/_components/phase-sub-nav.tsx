"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "@/lib/locale-context";
import { cn } from "@/lib/utils";

type PhaseKey = "impactSizing" | "design";

interface PhaseSubNavTab {
  href: string;
  key: string;
}

interface PhaseSubNavProps {
  phase: PhaseKey;
  variant: "A" | "B" | "C";
  tabs: ReadonlyArray<PhaseSubNavTab>;
}

const variantNames: Record<PhaseKey, Record<"A" | "B" | "C", { en: string; zh: string }>> = {
  impactSizing: {
    A: { en: "Variant A — Sequential", zh: "方案 A — 精确顺序" },
    B: { en: "Variant B — Funnel-First", zh: "方案 B — 漏斗优先" },
    C: { en: "Variant C — Adaptive Layered", zh: "方案 C — 自适应分层" },
  },
  design: {
    A: { en: "Variant A — Taxonomy-First", zh: "方案 A — 分类法优先" },
    B: { en: "Variant B — Decision-Tree", zh: "方案 B — 决策树" },
    C: { en: "Variant C — Sprint Dual-Track", zh: "方案 C — 双轨冲刺" },
  },
};

export function PhaseSubNav({ phase, variant, tabs }: PhaseSubNavProps) {
  const { t, locale } = useLocale();
  const pathname = usePathname();

  const tabLabel = (key: string): string => {
    if (phase === "impactSizing") {
      const dict = t.impactSizing;
      return (dict[key as keyof typeof dict] as string) ?? key;
    }
    const dict = t.design;
    return (dict[key as keyof typeof dict] as string) ?? key;
  };

  const phaseTitle = phase === "impactSizing" ? t.phases.impactSizing : t.phases.design;
  const variantLabel = variantNames[phase][variant][locale];

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <h1 className="text-xl font-semibold tracking-tight">{phaseTitle}</h1>
        <span className="text-xs text-slate-500">{variantLabel}</span>
      </div>
      <nav className="mt-2 flex flex-wrap gap-1 border-b border-slate-200 dark:border-slate-800">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "border-b-2 px-3 py-1.5 text-sm font-medium transition-colors",
                active
                  ? "border-indigo-600 text-slate-900 dark:text-slate-50"
                  : "border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-100",
              )}
            >
              {tabLabel(tab.key)}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

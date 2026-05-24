"use client";

import { useLocale } from "@/lib/locale-context";
import type { Candidate } from "@/content/sample-data";
import {
  odsIndicators,
  orsIndicators,
  quadrants,
  quadrantFromScores,
  type QuadrantId,
} from "@/content/funnel-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import {
  computeVm,
  computeDdiRaw,
  computeRiskPenalty,
  computeRas,
  computePriority,
  PRIORITY_FLOOR,
} from "@/content/scoring-rubric";
import { Download } from "lucide-react";

interface PortfolioViewProps {
  candidates: ReadonlyArray<Candidate>;
}

interface RankedCandidate {
  candidate: Candidate;
  quadrant: QuadrantId | "failed";
  priorityScore: number;
  vm: number;
}

const quadrantBadge: Record<QuadrantId | "failed", string> = {
  quickWin: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  sponsorAlign: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
  investProve: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  deferMature: "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  failed: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
};

export function PortfolioView({ candidates }: PortfolioViewProps) {
  const { locale } = useLocale();

  const screenPassed = (c: Candidate): boolean =>
    screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0) >= SCREEN_PASS_THRESHOLD;

  const all = candidates.map<RankedCandidate>((c) => {
    if (!screenPassed(c)) {
      return { candidate: c, quadrant: "failed", priorityScore: 0, vm: 0 };
    }
    const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
    const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
    const quadrant = quadrantFromScores(ods, ors);
    const vm = computeVm(c.vm);
    const ddiRaw = computeDdiRaw(c.ddi, c.totalSteps);
    const ras = computeRas(vm, computeRiskPenalty(c.risk));
    // Normalize DDI against cohort max
    return { candidate: c, quadrant, priorityScore: 0, vm, _ddiRaw: ddiRaw, _ras: ras } as RankedCandidate & { _ddiRaw: number; _ras: number };
  }) as Array<RankedCandidate & { _ddiRaw?: number; _ras?: number }>;

  const maxDdiRaw = Math.max(...all.map((r) => r._ddiRaw ?? 0), 0.0001);
  all.forEach((r) => {
    if (r._ras !== undefined && r._ddiRaw !== undefined) {
      r.priorityScore = computePriority(r._ras, r._ddiRaw / maxDdiRaw);
    }
  });

  const ranked = all
    .filter((r) => r.quadrant !== "failed")
    .sort((a, b) => b.priorityScore - a.priorityScore);
  const failed = all.filter((r) => r.quadrant === "failed");

  const maxScore = Math.max(...ranked.map((r) => r.priorityScore), 5);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {locale === "en" ? "Prioritized Workflow Portfolio" : "优先级排序的工作流组合"}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" /> PDF
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Download className="h-4 w-4" /> XLSX
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Workflow" : "工作流"}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Quadrant" : "象限"}</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Timeline" : "时间窗"}</th>
              <th className="px-4 py-2 font-medium text-right">Priority</th>
              <th className="px-4 py-2 font-medium">{locale === "en" ? "Recommendation" : "建议"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {ranked.map((r, idx) => {
              const q = quadrants.find((x) => x.id === r.quadrant);
              const passesFloor = r.priorityScore >= PRIORITY_FLOOR;
              return (
                <tr key={r.candidate.id}>
                  <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3 font-medium">{r.candidate.name}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge[r.quadrant]}`}>
                      {q?.shortName[locale] ?? r.quadrant}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{q?.timeline[locale] ?? "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className={passesFloor ? "font-mono text-emerald-700 dark:text-emerald-300" : "font-mono text-rose-700 dark:text-rose-300"}>
                      {r.priorityScore.toFixed(2)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs">{r.candidate.recommendation}</td>
                </tr>
              );
            })}
            {failed.map((r) => (
              <tr key={r.candidate.id} className="text-zinc-500">
                <td className="px-4 py-3">—</td>
                <td className="px-4 py-3">{r.candidate.name}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantBadge.failed}`}>
                    FAIL L1
                  </span>
                </td>
                <td className="px-4 py-3 text-xs">—</td>
                <td className="px-4 py-3 text-right">—</td>
                <td className="px-4 py-3 text-xs">{r.candidate.recommendation}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <h3 className="mb-3 text-sm font-semibold">{locale === "en" ? "Priority bars" : "优先级条形图"}</h3>
        <div className="space-y-2">
          {ranked.map((r) => {
            const pct = (r.priorityScore / maxScore) * 100;
            const passesFloor = r.priorityScore >= PRIORITY_FLOOR;
            const barStyle: React.CSSProperties = { width: `${pct}%` };
            return (
              <div key={r.candidate.id} className="flex items-center gap-3 text-sm">
                <span className="w-44 shrink-0 truncate">{r.candidate.name}</span>
                <div className="h-2 flex-1 overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
                  <div
                    className={passesFloor ? "h-full bg-emerald-500" : "h-full bg-rose-500"}
                    style={barStyle}
                  />
                </div>
                <span className="w-12 shrink-0 text-right font-mono text-xs">{r.priorityScore.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
        <p className="mt-3 text-xs text-zinc-500">
          {locale === "en"
            ? `Bars in green clear the ${PRIORITY_FLOOR} Design-entry floor; bars in red do not.`
            : `绿色条形通过 ${PRIORITY_FLOOR} Design 进入门槛;红色未通过。`}
        </p>
      </section>
    </div>
  );
}

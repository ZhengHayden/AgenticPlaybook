"use client";

import { useLocale } from "@/lib/locale-context";
import type { Candidate } from "@/content/sample-data";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import { Plus, Upload, Sparkles } from "lucide-react";

interface CandidatesTableProps {
  candidates: ReadonlyArray<Candidate>;
}

const painLabels: Record<Candidate["pain"], { en: string; zh: string; cls: string }> = {
  low: { en: "Low", zh: "低", cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  med: { en: "Med", zh: "中", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  high: { en: "High", zh: "高", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
};

export function CandidatesTable({ candidates }: CandidatesTableProps) {
  const { t, locale } = useLocale();

  const screenScore = (c: Candidate): number =>
    screenCriteria.reduce((sum, cr) => sum + (c.screen[cr.id].yes ? 1 : 0), 0);

  const statusBadge = (c: Candidate) => {
    const passed = screenScore(c) >= SCREEN_PASS_THRESHOLD;
    if (!passed) return { label: locale === "en" ? "✗ Failed L1" : "✗ L1 未过", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" };
    return { label: locale === "en" ? "✓ Screened" : "✓ 已筛选", cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300" };
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold">
          {t.impactSizing.candidates} ({candidates.length})
        </h2>
        <div className="flex gap-2">
          <button className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800">
            <Upload className="h-4 w-4" /> {t.impactSizing.importCsv}
          </button>
          <button className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">
            <Plus className="h-4 w-4" /> {t.impactSizing.addCandidate}
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
            <tr>
              <th className="px-4 py-2 font-medium">#</th>
              <th className="px-4 py-2 font-medium">Name</th>
              <th className="px-4 py-2 font-medium">Source</th>
              <th className="px-4 py-2 font-medium text-right">Vol/mo</th>
              <th className="px-4 py-2 font-medium">Pain</th>
              <th className="px-4 py-2 font-medium">Status</th>
              <th className="px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {candidates.map((c, idx) => {
              const pain = painLabels[c.pain];
              const status = statusBadge(c);
              return (
                <tr key={c.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/50">
                  <td className="px-4 py-3 text-zinc-400">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium">{c.name}</div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{c.description}</div>
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">{c.sourceSystem}</td>
                  <td className="px-4 py-3 text-right tabular-nums">{c.volumePerMonth.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${pain.cls}`}>
                      {pain[locale]}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex rounded-md px-2 py-0.5 text-xs font-medium ${status.cls}`}>
                      {status.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
                      <Sparkles className="h-3.5 w-3.5" /> {t.common.suggest}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
        💡 {locale === "en"
          ? "AI Assist: Click [Suggest] on any row to draft Layer-1 answers and an initial readiness/determinism estimate."
          : "AI 助手: 在任意行点击「建议」即可起草 Layer-1 答案和初始的准备度/确定性估计。"}
      </div>
    </div>
  );
}

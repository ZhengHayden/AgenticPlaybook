"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate } from "@/content/sample-data";
import { makeBlankCandidate, type CandidateBasics } from "@/content/candidate-factory";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import { Plus, Upload, Sparkles, Trash2 } from "lucide-react";

interface CandidatesTableProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

const EMPTY_BASICS: CandidateBasics = {
  name: "",
  description: "",
  sourceSystem: "",
  volumePerMonth: 0,
  pain: "med",
};

const painLabels: Record<Candidate["pain"], { en: string; zh: string; cls: string }> = {
  low: { en: "Low", zh: "低", cls: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300" },
  med: { en: "Med", zh: "中", cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300" },
  high: { en: "High", zh: "高", cls: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300" },
};

export function CandidatesTable({ projectId, candidates }: CandidatesTableProps) {
  const { t, locale } = useLocale();
  const { status: saveStatus, error, save } = useProjectSave(projectId);
  const [showAdd, setShowAdd] = useState(false);

  const addCandidate = async (basics: CandidateBasics) => {
    await save({ candidates: [...candidates, makeBlankCandidate(basics)] });
    setShowAdd(false);
  };

  const deleteCandidate = async (id: string) => {
    const target = candidates.find((c) => c.id === id);
    const label = target?.name || (locale === "en" ? "this candidate" : "该候选");
    const confirmed = window.confirm(
      locale === "en" ? `Delete "${label}"? This cannot be undone.` : `删除「${label}」?此操作不可撤销。`,
    );
    if (!confirmed) return;
    await save({ candidates: candidates.filter((c) => c.id !== id) });
  };

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
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            <Upload className="h-4 w-4" /> {t.impactSizing.importCsv}
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" /> {t.impactSizing.addCandidate}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

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
                    <Link
                      href={`/projects/${projectId}/impact-sizing/screen`}
                      className="font-medium text-indigo-600 hover:underline dark:text-indigo-400"
                      title={locale === "en" ? "Open Readiness Check" : "打开准备度检查"}
                    >
                      {c.name}
                    </Link>
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
                    <div className="inline-flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> {t.common.suggest}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCandidate(c.id)}
                        disabled={saveStatus === "saving"}
                        aria-label={locale === "en" ? "Delete candidate" : "删除候选"}
                        className="inline-flex items-center text-xs text-zinc-400 hover:text-rose-600 disabled:opacity-40 dark:hover:text-rose-400"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
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

      {showAdd && (
        <AddCandidateModal
          saving={saveStatus === "saving"}
          onCancel={() => setShowAdd(false)}
          onSubmit={addCandidate}
        />
      )}
    </div>
  );
}

interface AddCandidateModalProps {
  saving: boolean;
  onCancel: () => void;
  onSubmit: (basics: CandidateBasics) => void;
}

function AddCandidateModal({ saving, onCancel, onSubmit }: AddCandidateModalProps) {
  const { locale } = useLocale();
  const [form, setForm] = useState<CandidateBasics>(EMPTY_BASICS);
  const update = (patch: Partial<CandidateBasics>) => setForm((prev) => ({ ...prev, ...patch }));
  const canSubmit = form.name.trim() !== "" && !saving;

  const labelCls = "block text-xs text-zinc-500";
  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">
          {locale === "en" ? "Add Candidate" : "添加候选"}
        </h2>
        <label className={labelCls}>
          {locale === "en" ? "Workflow name *" : "工作流名称 *"}
          <input
            autoFocus
            value={form.name}
            onChange={(e) => update({ name: e.target.value })}
            placeholder={locale === "en" ? "e.g. AP Invoice Match" : "例如:应付发票匹配"}
            className={inputCls}
          />
        </label>
        <label className={labelCls}>
          {locale === "en" ? "Description" : "描述"}
          <textarea
            rows={2}
            value={form.description}
            onChange={(e) => update({ description: e.target.value })}
            className={`${inputCls} resize-y`}
          />
        </label>
        <label className={labelCls}>
          {locale === "en" ? "Source system" : "源系统"}
          <input
            value={form.sourceSystem}
            onChange={(e) => update({ sourceSystem: e.target.value })}
            placeholder="e.g. SAP S/4 + Coupa"
            className={inputCls}
          />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className={labelCls}>
            {locale === "en" ? "Volume / month" : "月处理量"}
            <input
              type="number"
              min={0}
              value={form.volumePerMonth}
              onChange={(e) => update({ volumePerMonth: Math.max(0, Number(e.target.value) || 0) })}
              className={inputCls}
            />
          </label>
          <label className={labelCls}>
            {locale === "en" ? "Pain" : "痛点"}
            <select
              value={form.pain}
              onChange={(e) => update({ pain: e.target.value as CandidateBasics["pain"] })}
              className={inputCls}
            >
              <option value="low">{locale === "en" ? "Low" : "低"}</option>
              <option value="med">{locale === "en" ? "Medium" : "中"}</option>
              <option value="high">{locale === "en" ? "High" : "高"}</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ ...form, name: form.name.trim() })}
            disabled={!canSubmit}
            className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
          >
            {saving ? (locale === "en" ? "Adding…" : "添加中…") : locale === "en" ? "Add" : "添加"}
          </button>
        </div>
      </div>
    </div>
  );
}

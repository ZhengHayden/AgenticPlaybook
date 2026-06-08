"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import type { Candidate } from "@/content/sample-data";
import { makeBlankCandidate, type CandidateBasics } from "@/content/candidate-factory";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import { Plus, Upload, Sparkles, Pencil, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Pill, type PillTone } from "@/components/ui/pill";
import { StatusChip } from "@/components/ui/status-chip";

interface CandidatesTableProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

/** The editable "header" fields: candidate basics plus the business function. */
type CandidateForm = CandidateBasics & { businessFunction: string };

const EMPTY_FORM: CandidateForm = {
  name: "",
  description: "",
  sourceSystem: "",
  volumePerMonth: 0,
  pain: "med",
  businessFunction: "",
};

/** Pull the editable "header" fields out of a candidate. */
const toForm = (c: Candidate): CandidateForm => ({
  name: c.name,
  description: c.description,
  sourceSystem: c.sourceSystem,
  volumePerMonth: c.volumePerMonth,
  pain: c.pain,
  businessFunction: c.businessFunction ?? "",
});

const painLabels: Record<Candidate["pain"], { en: string; zh: string; tone: PillTone }> = {
  low: { en: "Low", zh: "低", tone: "neutral" },
  med: { en: "Med", zh: "中", tone: "warning" },
  high: { en: "High", zh: "高", tone: "danger" },
};

export function CandidatesTable({ projectId, candidates }: CandidatesTableProps) {
  const { t, locale } = useLocale();
  const { status: saveStatus, error, save } = useProjectSave(projectId);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState<Candidate | null>(null);

  const addCandidate = async (form: CandidateForm) => {
    const { businessFunction, ...basics } = form;
    const blank = makeBlankCandidate(basics);
    const fn = businessFunction.trim();
    const candidate = fn ? { ...blank, businessFunction: fn } : blank;
    await save({ candidates: [...candidates, candidate] });
    setShowAdd(false);
  };

  const saveEdit = async (form: CandidateForm) => {
    if (!editing) return;
    const id = editing.id;
    const { businessFunction, ...basics } = form;
    const fn = businessFunction.trim();
    // Merge the edited header fields back, preserving all rubric/scoring data.
    await save({
      candidates: candidates.map((c) =>
        c.id === id ? { ...c, ...basics, businessFunction: fn || undefined } : c,
      ),
    });
    setEditing(null);
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

  const isScreened = (c: Candidate): boolean => screenScore(c) >= SCREEN_PASS_THRESHOLD;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {t.impactSizing.candidates}{" "}
          <span className="font-mono-num text-ink-faint">({candidates.length})</span>
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            <Upload className="h-4 w-4" /> {t.impactSizing.importCsv}
          </button>
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-white hover:bg-primary-deep"
          >
            <Plus className="h-4 w-4" /> {t.impactSizing.addCandidate}
          </button>
        </div>
      </div>

      {error && (
        <p className="rounded-md border border-danger/30 bg-danger-soft p-2 text-xs text-danger">
          {error}
        </p>
      )}

      <Card className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-border bg-surface-muted/50 text-left eyebrow">
            <tr>
              <th className="px-4 py-2.5 w-8">#</th>
              <th className="px-4 py-2.5">Name</th>
              <th className="px-4 py-2.5">Function</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5 text-right">Vol/mo</th>
              <th className="px-4 py-2.5">Pain</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {candidates.map((c, idx) => {
              const pain = painLabels[c.pain];
              const screened = isScreened(c);
              return (
                <tr key={c.id} className="hover:bg-surface-muted/40">
                  <td className="px-4 py-3 font-mono-num text-xs text-ink-faint">{idx + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/projects/${projectId}/impact-sizing/screen`}
                      className="font-medium text-primary hover:underline"
                      title={locale === "en" ? "Open Readiness Check" : "打开准备度检查"}
                    >
                      {c.name}
                    </Link>
                    <div className="mt-0.5 line-clamp-1 text-xs text-ink-faint">{c.description}</div>
                  </td>
                  <td className="px-4 py-3">
                    {c.businessFunction ? (
                      <Pill tone="info">{c.businessFunction}</Pill>
                    ) : (
                      <span className="text-xs text-ink-faint">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-ink-muted">{c.sourceSystem}</td>
                  <td className="px-4 py-3 text-right font-mono-num tabular-nums">{c.volumePerMonth.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <Pill tone={pain.tone}>{pain[locale]}</Pill>
                  </td>
                  <td className="px-4 py-3">
                    {screened ? (
                      <StatusChip state="ready">{locale === "en" ? "Screened" : "已筛选"}</StatusChip>
                    ) : (
                      <StatusChip state="block">{locale === "en" ? "Failed L1" : "L1 未过"}</StatusChip>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="inline-flex items-center justify-end gap-3">
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 dark:text-brand-300"
                      >
                        <Sparkles className="h-3.5 w-3.5" /> {t.common.suggest}
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditing(c)}
                        disabled={saveStatus === "saving"}
                        aria-label={locale === "en" ? "Edit candidate" : "编辑候选"}
                        title={locale === "en" ? "Edit candidate" : "编辑候选"}
                        className="inline-flex items-center text-xs text-slate-400 hover:text-brand-600 disabled:opacity-40 dark:hover:text-brand-300"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteCandidate(c.id)}
                        disabled={saveStatus === "saving"}
                        aria-label={locale === "en" ? "Delete candidate" : "删除候选"}
                        title={locale === "en" ? "Delete candidate" : "删除候选"}
                        className="inline-flex items-center text-xs text-slate-400 hover:text-rose-600 disabled:opacity-40 dark:hover:text-rose-400"
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
      </Card>

      <div className="rounded-md border border-info/30 bg-info-soft p-3 text-xs text-info">
        💡 {locale === "en"
          ? "AI Assist: Click [Suggest] on any row to draft Layer-1 answers and an initial readiness/determinism estimate."
          : "AI 助手: 在任意行点击「建议」即可起草 Layer-1 答案和初始的准备度/确定性估计。"}
      </div>

      {showAdd && (
        <CandidateModal
          title={locale === "en" ? "Add Candidate" : "添加候选"}
          submitLabel={locale === "en" ? "Add" : "添加"}
          initial={EMPTY_FORM}
          saving={saveStatus === "saving"}
          onCancel={() => setShowAdd(false)}
          onSubmit={addCandidate}
        />
      )}

      {editing && (
        <CandidateModal
          title={locale === "en" ? "Edit Candidate" : "编辑候选"}
          submitLabel={t.common.save}
          initial={toForm(editing)}
          saving={saveStatus === "saving"}
          onCancel={() => setEditing(null)}
          onSubmit={saveEdit}
        />
      )}
    </div>
  );
}

interface CandidateModalProps {
  title: string;
  submitLabel: string;
  initial: CandidateForm;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (form: CandidateForm) => void;
}

function CandidateModal({ title, submitLabel, initial, saving, onCancel, onSubmit }: CandidateModalProps) {
  const { locale } = useLocale();
  const [form, setForm] = useState<CandidateForm>(initial);
  const update = (patch: Partial<CandidateForm>) => setForm((prev) => ({ ...prev, ...patch }));
  const canSubmit = form.name.trim() !== "" && !saving;

  const labelCls = "block text-xs text-ink-muted";
  const inputCls =
    "mt-1 w-full rounded-md border border-border bg-surface px-3 py-2 text-sm";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl border border-border bg-surface p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display text-lg font-semibold">{title}</h2>
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
        <label className={labelCls}>
          {locale === "en" ? "Business function" : "业务职能"}
          <input
            value={form.businessFunction}
            onChange={(e) => update({ businessFunction: e.target.value })}
            placeholder={locale === "en" ? "e.g. PPM, EM Sever, KPM" : "例如:PPM、EM Sever、KPM"}
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
            className="rounded-md border border-border px-3 py-1.5 text-sm hover:bg-surface-muted"
          >
            {locale === "en" ? "Cancel" : "取消"}
          </button>
          <button
            type="button"
            onClick={() => onSubmit({ ...form, name: form.name.trim() })}
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-1.5 text-sm font-medium text-white hover:bg-primary-deep disabled:opacity-40"
          >
            {saving ? (locale === "en" ? "Saving…" : "保存中…") : submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

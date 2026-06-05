"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { useProjectSave } from "@/lib/use-project-save";
import { uploadSop, requestUnderstanding } from "@/lib/api-client";
import type { Candidate, ScreenAnswer, SopFileRef, ProjectUseCase } from "@/content/sample-data";
import type { ReadinessSuggestions } from "@/lib/understanding-agent";
import { screenCriteria, SCREEN_PASS_THRESHOLD, SCREEN_TOTAL, type ScreenCriterionId } from "@/content/binary-screen";
import { ToolDrawer } from "@/components/tool-drawer";
import { InlineAnchor } from "@/components/inline-anchor";
import { UseCaseIdeasPanel } from "../_components/use-case-ideas-panel";
import { ChevronDown, ChevronRight, Sparkles, FileText, Upload, X } from "lucide-react";

interface ScreenMatrixProps {
  projectId: string;
  candidates: ReadonlyArray<Candidate>;
}

export function ScreenMatrix({ projectId, candidates }: ScreenMatrixProps) {
  const { locale } = useLocale();
  const { status, error, save } = useProjectSave(projectId);
  const [dirty, setDirty] = useState(false);
  const [answers, setAnswers] = useState<Record<string, Record<ScreenCriterionId, ScreenAnswer>>>(() => {
    const out: Record<string, Record<ScreenCriterionId, ScreenAnswer>> = {};
    candidates.forEach((c) => {
      out[c.id] = { ...c.screen };
    });
    return out;
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [sopByCandidate, setSopByCandidate] = useState<Record<string, SopFileRef | undefined>>(() => {
    const out: Record<string, SopFileRef | undefined> = {};
    candidates.forEach((c) => {
      out[c.id] = c.sopFile;
    });
    return out;
  });
  const [useCasesByCandidate, setUseCasesByCandidate] = useState<Record<string, ProjectUseCase[]>>(() => {
    const out: Record<string, ProjectUseCase[]> = {};
    candidates.forEach((c) => {
      out[c.id] = c.useCases ? [...c.useCases] : [];
    });
    return out;
  });

  /** Merge current screen answers, SOP refs, and use-case ideas back onto the candidates (immutably). */
  const buildMerged = (
    answersSnap: Record<string, Record<ScreenCriterionId, ScreenAnswer>>,
    sopsSnap: Record<string, SopFileRef | undefined>,
    useCasesSnap: Record<string, ProjectUseCase[]>,
  ): Candidate[] =>
    candidates.map((c) => {
      const { sopFile: _prev, ...rest } = c;
      const sop = sopsSnap[c.id];
      const ideas = useCasesSnap[c.id] ?? c.useCases ?? [];
      return {
        ...rest,
        screen: answersSnap[c.id] ?? c.screen,
        ...(sop ? { sopFile: sop } : {}),
        ...(ideas.length > 0 ? { useCases: ideas } : {}),
      };
    });

  const toggleYes = (candidateId: string, key: ScreenCriterionId) => {
    setAnswers((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [key]: { ...prev[candidateId][key], yes: !prev[candidateId][key].yes },
      },
    }));
    setDirty(true);
  };

  const updateField = (
    candidateId: string,
    key: ScreenCriterionId,
    patch: Partial<ScreenAnswer>,
  ) => {
    setAnswers((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [key]: { ...prev[candidateId][key], ...patch },
      },
    }));
    setDirty(true);
  };

  const onSave = async () => {
    await save({ candidates: buildMerged(answers, sopByCandidate, useCasesByCandidate) });
    setDirty(false);
  };

  /** Persist a SOP upload/removal immediately so the stored file is never orphaned. */
  const onSopChange = async (candidateId: string, ref: SopFileRef | undefined) => {
    const nextSops = { ...sopByCandidate, [candidateId]: ref };
    setSopByCandidate(nextSops);
    await save({ candidates: buildMerged(answers, nextSops, useCasesByCandidate) });
    setDirty(false);
  };

  const updateUseCases = (candidateId: string, next: ProjectUseCase[]) => {
    setUseCasesByCandidate((prev) => ({ ...prev, [candidateId]: next }));
    setDirty(true);
  };

  /** Apply grounded agent suggestions to local answers; null dimensions are left untouched. */
  const applySuggestions = (candidateId: string, suggestions: ReadinessSuggestions) => {
    setAnswers((prev) => {
      const cur = prev[candidateId];
      const next = { ...cur };
      for (const cr of screenCriteria) {
        const s = suggestions[cr.id];
        if (!s || s.yes === null) continue;
        next[cr.id] = {
          ...cur[cr.id],
          yes: s.yes,
          ...(s.evidence ? { evidence: s.evidence } : {}),
          ...(s.factValue ? { factValue: s.factValue } : {}),
        };
      }
      return { ...prev, [candidateId]: next };
    });
    setDirty(true);
  };

  const saveLabel =
    status === "saving"
      ? locale === "en"
        ? "Saving…"
        : "保存中…"
      : status === "saved" && !dirty
        ? locale === "en"
          ? "Saved ✓"
          : "已保存 ✓"
        : locale === "en"
          ? "Save"
          : "保存";

  const scoreFor = (candidateId: string): number =>
    screenCriteria.reduce((sum, cr) => sum + (answers[candidateId][cr.id].yes ? 1 : 0), 0);

  const passCount = candidates.filter((c) => scoreFor(c.id) >= SCREEN_PASS_THRESHOLD).length;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Layer 1 · Binary Readiness Screen" : "Layer 1 · 二元准备度筛选"}
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {locale === "en"
              ? `6 binary gates · Pass threshold: ${SCREEN_PASS_THRESHOLD} of ${SCREEN_TOTAL} Yes (one allowed exception requires mitigation plan)`
              : `6 项二元判断 · 通过门槛: ${SCREEN_TOTAL} 项中 ≥${SCREEN_PASS_THRESHOLD} 项 Yes(可有 1 项例外,需附缓解方案)`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onSave}
            disabled={status === "saving" || !dirty}
            className="rounded-md bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-40"
          >
            {saveLabel}
          </button>
          <ToolDrawer
            buttonLabel={locale === "en" ? "Tool Reference" : "工具参考"}
            title={locale === "en" ? "Binary Readiness Screen Guide" : "二元准备度筛选指南"}
            subtitle={
              locale === "en"
                ? "Detailed criteria definitions, pass/fail examples, interview protocol."
                : "详细判定定义、Pass/Fail 样例、访谈协议。"
            }
          >
            <ScreenToolReference />
          </ToolDrawer>
        </div>
      </header>

      {error && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {error}
        </p>
      )}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-950">
            <tr>
              <th className="w-8 px-3 py-2">
                <span className="sr-only">{locale === "en" ? "Expand" : "展开"}</span>
              </th>
              <th className="px-3 py-2 font-medium">{locale === "en" ? "Workflow" : "工作流"}</th>
              {screenCriteria.map((cr) => (
                <th key={cr.id} className="px-3 py-2 font-medium" title={cr.shortLabel[locale]}>
                  <div className="flex items-center gap-1">
                    <span className="line-clamp-2 leading-tight">{cr.shortLabel[locale]}</span>
                    <InlineAnchor
                      label={cr.question[locale]}
                      body={
                        <>
                          <span className="font-semibold">{locale === "en" ? "Pass:" : "通过:"}</span>{" "}
                          {cr.passExamples[locale][0]}
                          <br />
                          <span className="font-semibold">{locale === "en" ? "Fail:" : "未通过:"}</span>{" "}
                          {cr.failExamples[locale][0]}
                        </>
                      }
                    />
                  </div>
                </th>
              ))}
              <th className="px-3 py-2 text-right font-medium">{locale === "en" ? "Score" : "得分"}</th>
              <th className="px-3 py-2 font-medium">{locale === "en" ? "Status" : "状态"}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {candidates.map((c) => {
              const score = scoreFor(c.id);
              const pass = score >= SCREEN_PASS_THRESHOLD;
              const expanded = expandedRow === c.id;
              return (
                <Fragment key={c.id}>
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedRow(expanded ? null : c.id)}
                        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                        aria-label="Toggle evidence"
                      >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.sourceSystem}</div>
                    </td>
                    {screenCriteria.map((cr) => {
                      const a = answers[c.id][cr.id];
                      return (
                        <td key={cr.id} className="px-3 py-3">
                          <button
                            type="button"
                            onClick={() => toggleYes(c.id, cr.id)}
                            className={
                              a.yes
                                ? "inline-flex h-7 w-7 items-center justify-center rounded-md bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                                : "inline-flex h-7 w-7 items-center justify-center rounded-md bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                            }
                            title={a.evidence ?? a.mitigation ?? ""}
                          >
                            {a.yes ? "✓" : "✗"}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-3 text-right font-mono">
                      {score}/{SCREEN_TOTAL}
                    </td>
                    <td className="px-3 py-3">
                      <span
                        className={
                          pass
                            ? "inline-flex rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                            : "inline-flex rounded-md bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                        }
                      >
                        {pass ? "PASS" : "FAIL"}
                      </span>
                    </td>
                  </tr>
                  {expanded && (
                    <tr className="bg-slate-50/60 dark:bg-slate-950/40">
                      <td></td>
                      <td colSpan={screenCriteria.length + 3} className="px-3 py-4">
                        <EvidencePanel
                          projectId={projectId}
                          candidate={c}
                          answers={answers[c.id]}
                          sopFile={sopByCandidate[c.id]}
                          onUpdate={(key, patch) => updateField(c.id, key, patch)}
                          onSopChange={(ref) => onSopChange(c.id, ref)}
                          onApplySuggestions={(s) => applySuggestions(c.id, s)}
                        />
                        <div className="mt-4">
                          <UseCaseIdeasPanel
                            candidateId={c.id}
                            useCases={useCasesByCandidate[c.id] ?? []}
                            onChange={(next) => updateUseCases(c.id, next)}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-md border border-slate-200 bg-white px-4 py-3 text-sm dark:border-slate-800 dark:bg-slate-900">
        <span className="text-slate-600 dark:text-slate-400">
          {locale === "en"
            ? `${passCount} of ${candidates.length} advance to Layer 2 (2x2 Funnel)`
            : `${candidates.length} 个候选中有 ${passCount} 个进入 Layer 2 (2x2 漏斗)`}
        </span>
      </div>
    </div>
  );
}

interface EvidencePanelProps {
  projectId: string;
  candidate: Candidate;
  answers: Record<ScreenCriterionId, ScreenAnswer>;
  sopFile: SopFileRef | undefined;
  onUpdate: (key: ScreenCriterionId, patch: Partial<ScreenAnswer>) => void;
  onSopChange: (ref: SopFileRef | undefined) => Promise<void>;
  onApplySuggestions: (suggestions: ReadinessSuggestions) => void;
}

function EvidencePanel({
  projectId,
  candidate,
  answers,
  sopFile,
  onUpdate,
  onSopChange,
  onApplySuggestions,
}: EvidencePanelProps) {
  const { locale } = useLocale();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [agentLoading, setAgentLoading] = useState(false);
  const [agentError, setAgentError] = useState<string | null>(null);
  const [notStated, setNotStated] = useState<ReadonlyArray<ScreenCriterionId>>([]);

  const onFileSelected = async (file: File | undefined) => {
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    try {
      const ref = await uploadSop(projectId, file);
      await onSopChange(ref);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onRemoveSop = async () => {
    setUploadError(null);
    try {
      await onSopChange(undefined);
      setNotStated([]);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : "Remove failed");
    }
  };

  const onRunAgent = async () => {
    if (!sopFile) return;
    setAgentError(null);
    setAgentLoading(true);
    try {
      const result = await requestUnderstanding(projectId, candidate.id);
      onApplySuggestions(result.suggestions);
      setNotStated(result.notStated);
    } catch (error) {
      setAgentError(error instanceof Error ? error.message : "Agent failed");
    } finally {
      setAgentLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          {locale === "en" ? `Evidence — ${candidate.name}` : `证据 — ${candidate.name}`}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          {sopFile ? (
            <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-900">
              <FileText className="h-3.5 w-3.5 text-slate-400" />
              <a
                href={`/api/projects/${projectId}/sop/${sopFile.storedName}`}
                target="_blank"
                rel="noopener noreferrer"
                className="max-w-[12rem] truncate text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                title={sopFile.filename}
              >
                {sopFile.filename}
              </a>
              <button
                type="button"
                onClick={onRemoveSop}
                className="text-slate-400 hover:text-rose-600"
                aria-label={locale === "en" ? "Remove SOP" : "移除 SOP"}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ) : (
            <label className="inline-flex cursor-pointer items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
              <Upload className="h-3.5 w-3.5" />
              {uploading
                ? locale === "en"
                  ? "Uploading…"
                  : "上传中…"
                : locale === "en"
                  ? "Upload SOP (PDF)"
                  : "上传 SOP(PDF)"}
              <input
                type="file"
                accept="application/pdf,.pdf"
                className="hidden"
                disabled={uploading}
                onChange={(e) => {
                  void onFileSelected(e.target.files?.[0]);
                  e.target.value = "";
                }}
              />
            </label>
          )}
          <button
            type="button"
            onClick={onRunAgent}
            disabled={!sopFile || agentLoading}
            title={
              sopFile
                ? undefined
                : locale === "en"
                  ? "Upload a SOP first"
                  : "请先上传 SOP"
            }
            className="inline-flex items-center gap-1 rounded-md border border-indigo-200 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-900/50 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {agentLoading
              ? locale === "en"
                ? "Reading SOP…"
                : "读取 SOP…"
              : locale === "en"
                ? "Run Understanding Agent"
                : "运行流程理解智能体"}
          </button>
        </div>
      </div>

      {uploadError && (
        <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
          {uploadError}
        </p>
      )}
      {agentError && (
        <p className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          {agentError}
        </p>
      )}
      {notStated.length > 0 && (
        <p className="text-xs text-slate-500">
          {locale === "en"
            ? "Dimensions left blank were not stated in the SOP — review and fill them in manually."
            : "留空的维度在 SOP 中未提及 — 请人工复核并填写。"}
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {screenCriteria.map((cr) => {
          const a = answers[cr.id];
          const isNotStated = notStated.includes(cr.id);
          return (
            <div
              key={cr.id}
              className={
                "rounded-md border p-3 " +
                (a.yes
                  ? "border-emerald-200 bg-emerald-50/40 dark:border-emerald-900/40 dark:bg-emerald-950/20"
                  : "border-rose-200 bg-rose-50/40 dark:border-rose-900/40 dark:bg-rose-950/20")
              }
            >
              <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                <span className="font-semibold">{cr.shortLabel[locale]}</span>
                <div className="flex items-center gap-1">
                  {isNotStated && (
                    <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700 dark:bg-amber-900/40 dark:text-amber-300">
                      {locale === "en" ? "not stated in SOP" : "SOP 未提及"}
                    </span>
                  )}
                  <span
                    className={
                      a.yes
                        ? "rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                        : "rounded bg-rose-100 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-300"
                    }
                  >
                    {a.yes ? "Yes" : "No"}
                  </span>
                </div>
              </div>
              {cr.factField && (
                <label className="block text-xs">
                  <span className="text-slate-500">{cr.factField[locale]}</span>
                  <input
                    value={a.factValue ?? ""}
                    onChange={(e) => onUpdate(cr.id, { factValue: e.target.value })}
                    placeholder={cr.factField.placeholder}
                    className="mt-0.5 w-full rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
              )}
              <label className="mt-2 block text-xs">
                <span className="text-slate-500">
                  {a.yes ? (locale === "en" ? "Evidence" : "证据") : (locale === "en" ? "Gap description" : "缺口描述")}
                </span>
                <textarea
                  rows={2}
                  value={a.yes ? (a.evidence ?? "") : (a.evidence ?? "")}
                  onChange={(e) => onUpdate(cr.id, { evidence: e.target.value })}
                  className="mt-0.5 w-full resize-y rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                />
              </label>
              {!a.yes && (
                <label className="mt-2 block text-xs">
                  <span className="text-slate-500">
                    {locale === "en" ? "Mitigation feasibility" : "缓解方案可行性"}
                  </span>
                  <textarea
                    rows={2}
                    value={a.mitigation ?? ""}
                    onChange={(e) => onUpdate(cr.id, { mitigation: e.target.value })}
                    placeholder={
                      locale === "en"
                        ? "Describe gap + mitigation; only 1 No allowed."
                        : "描述缺口与缓解方案;仅允许 1 项 No。"
                    }
                    className="mt-0.5 w-full resize-y rounded border border-slate-200 bg-white px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-950"
                  />
                </label>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ScreenToolReference() {
  const { locale } = useLocale();
  return (
    <div className="space-y-5">
      <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
        <strong>{locale === "en" ? "Gate rule:" : "门槛规则:"}</strong>{" "}
        {locale === "en"
          ? `${SCREEN_PASS_THRESHOLD} of ${SCREEN_TOTAL} Yes required. One allowed exception must include a documented mitigation plan.`
          : `${SCREEN_TOTAL} 项中需 ≥${SCREEN_PASS_THRESHOLD} 项 Yes。可有 1 项例外,但必须附书面缓解方案。`}
      </div>

      {screenCriteria.map((cr, idx) => (
        <article key={cr.id} className="space-y-2 border-b border-slate-100 pb-4 last:border-b-0 dark:border-slate-800">
          <header>
            <h3 className="text-sm font-semibold">
              {idx + 1}. {cr.shortLabel[locale]}
            </h3>
            <p className="mt-0.5 text-xs italic text-slate-500">{cr.question[locale]}</p>
          </header>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {locale === "en" ? "What this means:" : "含义:"}
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{cr.whatItMeans[locale]}</span>
            </p>
            <p>
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                {locale === "en" ? "Why it matters:" : "重要性:"}
              </span>{" "}
              <span className="text-slate-600 dark:text-slate-400">{cr.whyItMatters[locale]}</span>
            </p>
          </div>
          <div className="grid grid-cols-1 gap-2 text-xs md:grid-cols-2">
            <div className="rounded-md border border-emerald-200 bg-emerald-50/40 p-2 dark:border-emerald-900/40 dark:bg-emerald-950/20">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
                {locale === "en" ? "Pass" : "通过"}
              </span>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-emerald-900 dark:text-emerald-200">
                {cr.passExamples[locale].map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
            <div className="rounded-md border border-rose-200 bg-rose-50/40 p-2 dark:border-rose-900/40 dark:bg-rose-950/20">
              <span className="block text-[10px] font-semibold uppercase tracking-wide text-rose-700 dark:text-rose-300">
                {locale === "en" ? "Fail" : "未通过"}
              </span>
              <ul className="mt-1 list-disc space-y-0.5 pl-4 text-rose-900 dark:text-rose-200">
                {cr.failExamples[locale].map((ex, i) => (
                  <li key={i}>{ex}</li>
                ))}
              </ul>
            </div>
          </div>
        </article>
      ))}

      <section className="rounded-md border border-slate-200 bg-slate-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950">
        <h3 className="font-semibold">
          {locale === "en" ? "Interview Protocol" : "访谈协议"}
        </h3>
        <p className="mt-1 text-slate-500">
          {locale === "en"
            ? "30 minutes per process owner, both team members for inter-rater calibration."
            : "每位负责人 30 分钟,两位团队成员同时参与以校准评分一致性。"}
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-slate-600 dark:text-slate-400">
          <li>{locale === "en" ? "Open (5 min): walk through trigger and final output." : "开场(5 分钟):梳理触发条件与最终输出。"}</li>
          <li>{locale === "en" ? "Probe each criterion (20 min): ask the question, then ask for a specific example." : "逐项探询(20 分钟):提问后请受访人给具体例子。"}</li>
          <li>{locale === "en" ? "Close (5 min): \"Is anything about this process about to change in 6 months?\"" : "收尾(5 分钟):「未来 6 个月内此流程会有变更吗?」"}</li>
        </ol>
        <p className="mt-2 text-slate-500">
          {locale === "en"
            ? "Tip: Do NOT explain the pass/fail threshold during interview — owners who know the gate bias their answers."
            : "提示: 访谈中不要解释通过门槛 — 已知规则的负责人会无意识地偏向 Yes。"}
        </p>
      </section>
    </div>
  );
}

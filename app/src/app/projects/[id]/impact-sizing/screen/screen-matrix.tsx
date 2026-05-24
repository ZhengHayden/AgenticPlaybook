"use client";

import { Fragment, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Candidate, ScreenAnswer } from "@/content/sample-data";
import { screenCriteria, SCREEN_PASS_THRESHOLD, SCREEN_TOTAL, type ScreenCriterionId } from "@/content/binary-screen";
import { ToolDrawer } from "@/components/tool-drawer";
import { InlineAnchor } from "@/components/inline-anchor";
import { ChevronDown, ChevronRight, Sparkles } from "lucide-react";

interface ScreenMatrixProps {
  candidates: ReadonlyArray<Candidate>;
}

export function ScreenMatrix({ candidates }: ScreenMatrixProps) {
  const { locale } = useLocale();
  const [answers, setAnswers] = useState<Record<string, Record<ScreenCriterionId, ScreenAnswer>>>(() => {
    const out: Record<string, Record<ScreenCriterionId, ScreenAnswer>> = {};
    candidates.forEach((c) => {
      out[c.id] = { ...c.screen };
    });
    return out;
  });
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const toggleYes = (candidateId: string, key: ScreenCriterionId) => {
    setAnswers((prev) => ({
      ...prev,
      [candidateId]: {
        ...prev[candidateId],
        [key]: { ...prev[candidateId][key], yes: !prev[candidateId][key].yes },
      },
    }));
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
  };

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
          <p className="mt-1 text-xs text-zinc-500">
            {locale === "en"
              ? `6 binary gates · Pass threshold: ${SCREEN_PASS_THRESHOLD} of ${SCREEN_TOTAL} Yes (one allowed exception requires mitigation plan)`
              : `6 项二元判断 · 通过门槛: ${SCREEN_TOTAL} 项中 ≥${SCREEN_PASS_THRESHOLD} 项 Yes(可有 1 项例外,需附缓解方案)`}
          </p>
        </div>
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
      </header>

      <div className="overflow-x-auto rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <table className="w-full min-w-[720px] text-sm">
          <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500 dark:bg-zinc-950">
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
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {candidates.map((c) => {
              const score = scoreFor(c.id);
              const pass = score >= SCREEN_PASS_THRESHOLD;
              const expanded = expandedRow === c.id;
              return (
                <Fragment key={c.id}>
                  <tr className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40">
                    <td className="px-3 py-3">
                      <button
                        type="button"
                        onClick={() => setExpandedRow(expanded ? null : c.id)}
                        className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
                        aria-label="Toggle evidence"
                      >
                        {expanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <div className="font-medium">{c.name}</div>
                      <div className="text-xs text-zinc-500">{c.sourceSystem}</div>
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
                    <tr className="bg-zinc-50/60 dark:bg-zinc-950/40">
                      <td></td>
                      <td colSpan={screenCriteria.length + 3} className="px-3 py-4">
                        <EvidencePanel
                          candidate={c}
                          answers={answers[c.id]}
                          onUpdate={(key, patch) => updateField(c.id, key, patch)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between rounded-md border border-zinc-200 bg-white px-4 py-3 text-sm dark:border-zinc-800 dark:bg-zinc-900">
        <span className="text-zinc-600 dark:text-zinc-400">
          {locale === "en"
            ? `${passCount} of ${candidates.length} advance to Layer 2 (2x2 Funnel)`
            : `${candidates.length} 个候选中有 ${passCount} 个进入 Layer 2 (2x2 漏斗)`}
        </span>
      </div>
    </div>
  );
}

interface EvidencePanelProps {
  candidate: Candidate;
  answers: Record<ScreenCriterionId, ScreenAnswer>;
  onUpdate: (key: ScreenCriterionId, patch: Partial<ScreenAnswer>) => void;
}

function EvidencePanel({ candidate, answers, onUpdate }: EvidencePanelProps) {
  const { locale } = useLocale();
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
          {locale === "en" ? `Evidence — ${candidate.name}` : `证据 — ${candidate.name}`}
        </h3>
        <button type="button" className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400">
          <Sparkles className="h-3.5 w-3.5" />{" "}
          {locale === "en" ? "Draft from description" : "基于描述起草"}
        </button>
      </div>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
        {screenCriteria.map((cr) => {
          const a = answers[cr.id];
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
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-semibold">{cr.shortLabel[locale]}</span>
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
              {cr.factField && (
                <label className="block text-xs">
                  <span className="text-zinc-500">{cr.factField[locale]}</span>
                  <input
                    value={a.factValue ?? ""}
                    onChange={(e) => onUpdate(cr.id, { factValue: e.target.value })}
                    placeholder={cr.factField.placeholder}
                    className="mt-0.5 w-full rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              )}
              <label className="mt-2 block text-xs">
                <span className="text-zinc-500">
                  {a.yes ? (locale === "en" ? "Evidence" : "证据") : (locale === "en" ? "Gap description" : "缺口描述")}
                </span>
                <textarea
                  rows={2}
                  value={a.yes ? (a.evidence ?? "") : (a.evidence ?? "")}
                  onChange={(e) => onUpdate(cr.id, { evidence: e.target.value })}
                  className="mt-0.5 w-full resize-y rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              {!a.yes && (
                <label className="mt-2 block text-xs">
                  <span className="text-zinc-500">
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
                    className="mt-0.5 w-full resize-y rounded border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
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
        <article key={cr.id} className="space-y-2 border-b border-zinc-100 pb-4 last:border-b-0 dark:border-zinc-800">
          <header>
            <h3 className="text-sm font-semibold">
              {idx + 1}. {cr.shortLabel[locale]}
            </h3>
            <p className="mt-0.5 text-xs italic text-zinc-500">{cr.question[locale]}</p>
          </header>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {locale === "en" ? "What this means:" : "含义:"}
              </span>{" "}
              <span className="text-zinc-600 dark:text-zinc-400">{cr.whatItMeans[locale]}</span>
            </p>
            <p>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                {locale === "en" ? "Why it matters:" : "重要性:"}
              </span>{" "}
              <span className="text-zinc-600 dark:text-zinc-400">{cr.whyItMatters[locale]}</span>
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

      <section className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold">
          {locale === "en" ? "Interview Protocol" : "访谈协议"}
        </h3>
        <p className="mt-1 text-zinc-500">
          {locale === "en"
            ? "30 minutes per process owner, both team members for inter-rater calibration."
            : "每位负责人 30 分钟,两位团队成员同时参与以校准评分一致性。"}
        </p>
        <ol className="mt-2 list-decimal space-y-1 pl-4 text-zinc-600 dark:text-zinc-400">
          <li>{locale === "en" ? "Open (5 min): walk through trigger and final output." : "开场(5 分钟):梳理触发条件与最终输出。"}</li>
          <li>{locale === "en" ? "Probe each criterion (20 min): ask the question, then ask for a specific example." : "逐项探询(20 分钟):提问后请受访人给具体例子。"}</li>
          <li>{locale === "en" ? "Close (5 min): \"Is anything about this process about to change in 6 months?\"" : "收尾(5 分钟):「未来 6 个月内此流程会有变更吗?」"}</li>
        </ol>
        <p className="mt-2 text-zinc-500">
          {locale === "en"
            ? "Tip: Do NOT explain the pass/fail threshold during interview — owners who know the gate bias their answers."
            : "提示: 访谈中不要解释通过门槛 — 已知规则的负责人会无意识地偏向 Yes。"}
        </p>
      </section>
    </div>
  );
}

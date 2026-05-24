"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Candidate, VmScores, DdiCounts, RiskAssessment } from "@/content/sample-data";
import {
  vmDimensions,
  decisionTypes,
  riskCategories,
  computeVm,
  computeDdiRaw,
  computeRiskPenalty,
  computeRas,
  computePriority,
  interpretPriority,
  interpretDdi,
  PRIORITY_FLOOR,
  priorityInterpretations,
  type VmDimensionId,
  type DecisionTypeId,
  type RiskCategoryId,
  type RiskLevel,
} from "@/content/scoring-rubric";
import { ToolDrawer } from "@/components/tool-drawer";

interface ScoringEditorProps {
  candidates: ReadonlyArray<Candidate>;
}

interface CandidateScoringState {
  vm: VmScores;
  ddi: DdiCounts;
  totalSteps: number;
  risk: RiskAssessment;
  notes: string;
}

export function ScoringEditor({ candidates }: ScoringEditorProps) {
  const { locale } = useLocale();
  const [activeIdx, setActiveIdx] = useState(0);
  const [state, setState] = useState<Record<string, CandidateScoringState>>(() => {
    const out: Record<string, CandidateScoringState> = {};
    candidates.forEach((c) => {
      out[c.id] = {
        vm: { ...c.vm },
        ddi: { ...c.ddi },
        totalSteps: c.totalSteps,
        risk: { ...c.risk },
        notes: c.scoringNotes ?? "",
      };
    });
    return out;
  });

  if (candidates.length === 0) {
    return (
      <p className="rounded-md border border-zinc-200 bg-white p-4 text-sm text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
        {locale === "en"
          ? "No Quick Win / Sponsor & Align / Invest & Prove candidates yet. Score them in the Funnel tab first."
          : "尚无 Quick Win / Sponsor & Align / Invest & Prove 候选。请先在漏斗页评分。"}
      </p>
    );
  }

  const candidate = candidates[activeIdx];
  const s = state[candidate.id];

  const update = (patch: Partial<CandidateScoringState>) => {
    setState((prev) => ({ ...prev, [candidate.id]: { ...prev[candidate.id], ...patch } }));
  };

  const setVm = (id: VmDimensionId, score: 1 | 2 | 3 | 4 | 5) => {
    update({ vm: { ...s.vm, [id]: score } });
  };

  const setDdi = (id: DecisionTypeId, value: number) => {
    update({ ddi: { ...s.ddi, [id]: Math.max(0, value) } });
  };

  const setRisk = (id: RiskCategoryId, level: RiskLevel) => {
    update({ risk: { ...s.risk, [id]: level } });
  };

  // ─── Calculations ──────────────────────────────────────────
  const vmTotal = computeVm(s.vm);
  const ddiRaw = computeDdiRaw(s.ddi, s.totalSteps);
  // Normalize against the max raw DDI in the current cohort
  const maxDdiRaw = Math.max(
    ...candidates.map((c) => computeDdiRaw(state[c.id].ddi, state[c.id].totalSteps)),
    0.0001,
  );
  const ddiNormalized = ddiRaw / maxDdiRaw;
  const riskPenalty = computeRiskPenalty(s.risk);
  const ras = computeRas(vmTotal, riskPenalty);
  const priority = computePriority(ras, ddiNormalized);
  const interp = interpretPriority(priority);
  const ddiInterp = interpretDdi(ddiNormalized);

  const passesFloor = priority >= PRIORITY_FLOOR;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Layer 3 · Detailed Scoring" : "Layer 3 · 详细评分"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {locale === "en"
              ? "Quick Win / Sponsor & Align / Invest & Prove candidates only."
              : "仅 Quick Win / Sponsor & Align / Invest & Prove 候选。"}
          </p>
        </div>
        <ToolDrawer
          buttonLabel={locale === "en" ? "Tool Reference" : "工具参考"}
          title={locale === "en" ? "Detailed Scoring Guide" : "详细评分指南"}
          subtitle={
            locale === "en"
              ? "VM anchors, DDI calculation, risk categories, formula reference."
              : "VM 锚点、DDI 计算、风险分类、公式参考。"
          }
        >
          <ScoringToolReference />
        </ToolDrawer>
      </header>

      {/* candidate switcher */}
      <div className="flex flex-wrap gap-1">
        {candidates.map((c, idx) => (
          <button
            key={c.id}
            type="button"
            onClick={() => setActiveIdx(idx)}
            className={
              idx === activeIdx
                ? "rounded-md bg-indigo-600 px-3 py-1 text-xs font-medium text-white"
                : "rounded-md bg-zinc-100 px-3 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
            }
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
        <div className="space-y-4">
          {/* VM section */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {locale === "en" ? "Value Magnitude (VM)" : "价值量 (VM)"}
              </h3>
              <span className="text-xs text-zinc-400">VM = Σ(weight × score)</span>
            </header>
            <div className="mt-3 space-y-4">
              {vmDimensions.map((d) => {
                const current = s.vm[d.id];
                const anchor = d.anchors.find((a) => a.score === current);
                return (
                  <div key={d.id}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium">
                        {d.label[locale]} <span className="text-zinc-400">×{d.weight}</span>
                      </span>
                      <div className="inline-flex overflow-hidden rounded border border-zinc-200 dark:border-zinc-700">
                        {[1, 2, 3, 4, 5].map((v) => (
                          <button
                            key={v}
                            type="button"
                            onClick={() => setVm(d.id, v as 1 | 2 | 3 | 4 | 5)}
                            className={
                              current === v
                                ? "bg-indigo-600 px-2 py-0.5 text-white"
                                : "bg-white px-2 py-0.5 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }
                          >
                            {v}
                          </button>
                        ))}
                      </div>
                    </div>
                    {anchor && (
                      <div className="mt-1 flex items-baseline gap-2 text-[11px]">
                        <span className="rounded bg-indigo-50 px-1.5 py-0.5 font-semibold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300">
                          {anchor.label[locale]}
                        </span>
                        <span className="text-zinc-500">{anchor.range[locale]}</span>
                        <span className="text-zinc-400">— {anchor.description[locale]}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-baseline justify-end gap-1 border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
              <span className="text-zinc-500">VM composite:</span>
              <span className="font-mono text-base font-semibold">{vmTotal.toFixed(2)}</span>
              <span className="text-zinc-400">/ 5.00</span>
            </div>
          </section>

          {/* DDI section */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {locale === "en" ? "Decision Density Index (DDI)" : "决策密度指数 (DDI)"}
              </h3>
              <span className="text-xs text-zinc-400">
                DDI<sub>raw</sub> = Σ(w × count) / steps
              </span>
            </header>
            <p className="mt-1 text-[11px] text-zinc-500">
              {locale === "en"
                ? "Map decision points by complexity. Normalized against the highest-DDI candidate in this cohort."
                : "按复杂度统计决策点。基于本组中最高 DDI 进行归一化。"}
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
              {decisionTypes.map((dt) => (
                <label key={dt.id} className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-700">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{dt.label[locale]}</span>
                    <span className="text-zinc-400">w={dt.weight}</span>
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[10px] text-zinc-500">
                    {dt.description[locale]}
                  </p>
                  <input
                    type="number"
                    min={0}
                    value={s.ddi[dt.id]}
                    onChange={(e) => setDdi(dt.id, Number(e.target.value) || 0)}
                    className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                  />
                </label>
              ))}
              <label className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-700">
                <div className="font-semibold">{locale === "en" ? "Total steps" : "总步骤数"}</div>
                <p className="mt-0.5 text-[10px] text-zinc-500">
                  {locale === "en" ? "Denominator" : "分母"}
                </p>
                <input
                  type="number"
                  min={1}
                  value={s.totalSteps}
                  onChange={(e) => update({ totalSteps: Math.max(1, Number(e.target.value) || 1) })}
                  className="mt-1 w-full rounded border border-zinc-200 bg-white px-2 py-1 font-mono text-sm dark:border-zinc-700 dark:bg-zinc-950"
                />
              </label>
              <div className="rounded-md border border-indigo-200 bg-indigo-50 p-2 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/30">
                <div className="font-semibold text-indigo-700 dark:text-indigo-300">
                  {locale === "en" ? "DDI normalized" : "DDI 归一化"}
                </div>
                <div className="mt-1 font-mono text-base font-semibold">{ddiNormalized.toFixed(2)}</div>
                <div className="text-[10px] text-zinc-500">
                  {ddiInterp.level[locale]} · {ddiInterp.implication[locale]}
                </div>
              </div>
            </div>
          </section>

          {/* Risk section */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <header className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {locale === "en" ? "Risk Assessment" : "风险评估"}
              </h3>
              <span className="text-xs text-zinc-400">
                {locale === "en" ? "RAS = VM × (1 − 0.15 × #High)" : "RAS = VM × (1 − 0.15 × 高风险数)"}
              </span>
            </header>
            <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
              {riskCategories.map((cat) => {
                const current = s.risk[cat.id];
                return (
                  <div key={cat.id} className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-700">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold">{cat.label[locale]}</span>
                      <div className="inline-flex overflow-hidden rounded border border-zinc-200 dark:border-zinc-700">
                        {(["L", "M", "H"] as RiskLevel[]).map((lvl) => (
                          <button
                            key={lvl}
                            type="button"
                            onClick={() => setRisk(cat.id, lvl)}
                            className={
                              current === lvl
                                ? lvl === "H"
                                  ? "bg-rose-600 px-2 py-0.5 text-white"
                                  : lvl === "M"
                                  ? "bg-amber-600 px-2 py-0.5 text-white"
                                  : "bg-emerald-600 px-2 py-0.5 text-white"
                                : "bg-white px-2 py-0.5 text-zinc-600 hover:bg-zinc-50 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
                            }
                          >
                            {lvl}
                          </button>
                        ))}
                      </div>
                    </div>
                    <p className="mt-1 text-[10px] text-zinc-500">{cat.basedOn[locale]}</p>
                    <p className="mt-0.5 text-[10px] italic text-zinc-500">
                      {cat.criteria.find((cr) => cr.level === current)?.[locale]}
                    </p>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 flex items-baseline justify-end gap-1 border-t border-zinc-100 pt-2 text-xs dark:border-zinc-800">
              <span className="text-zinc-500">
                {locale === "en" ? "High count:" : "高风险数:"}
              </span>
              <span className="font-mono">{riskPenalty}</span>
              <span className="text-zinc-400">→ penalty {(riskPenalty * 15)}%</span>
            </div>
          </section>

          {/* Notes */}
          <section className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <label className="block">
              <span className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
                {locale === "en" ? "Scoring notes" : "评分备注"}
              </span>
              <textarea
                rows={2}
                value={s.notes}
                onChange={(e) => update({ notes: e.target.value })}
                placeholder={
                  locale === "en"
                    ? "Document any borderline calls, calibration disagreements, or overrides."
                    : "记录边界情况、校准分歧或主动覆盖。"
                }
                className="mt-1 w-full resize-y rounded-md border border-zinc-200 bg-white px-2 py-1 text-sm dark:border-zinc-700 dark:bg-zinc-950"
              />
            </label>
          </section>
        </div>

        {/* Right rail — final score */}
        <aside className="space-y-3">
          <div
            className={
              "rounded-xl border-2 p-4 " +
              (passesFloor
                ? "border-emerald-300 bg-emerald-50 dark:border-emerald-900/40 dark:bg-emerald-950/30"
                : "border-rose-300 bg-rose-50 dark:border-rose-900/40 dark:bg-rose-950/30")
            }
          >
            <div className="text-xs uppercase tracking-wide text-zinc-500">
              {locale === "en" ? "Priority Score" : "优先级分数"}
            </div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="font-mono text-3xl font-bold">{priority.toFixed(2)}</span>
              <span className="text-xs text-zinc-400">
                {locale === "en" ? "floor" : "门槛"} ≥ {PRIORITY_FLOOR}
              </span>
            </div>
            <span
              className={
                "mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold " +
                (passesFloor
                  ? "bg-emerald-600 text-white"
                  : "bg-rose-600 text-white")
              }
            >
              {interp.label[locale]}
            </span>
            <p className="mt-2 text-[11px] text-zinc-600 dark:text-zinc-400">
              {interp.action[locale]}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 text-xs dark:border-zinc-800 dark:bg-zinc-900">
            <h4 className="text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
              {locale === "en" ? "Breakdown" : "拆解"}
            </h4>
            <dl className="mt-2 space-y-1">
              <div className="flex justify-between">
                <dt className="text-zinc-500">VM</dt>
                <dd className="font-mono">{vmTotal.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">RiskPenalty</dt>
                <dd className="font-mono">{riskPenalty} × 15%</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">RAS</dt>
                <dd className="font-mono">{ras.toFixed(2)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-zinc-500">DDI&nbsp;norm.</dt>
                <dd className="font-mono">{ddiNormalized.toFixed(2)}</dd>
              </div>
            </dl>
            <p className="mt-3 font-mono text-[10px] text-zinc-400">
              Priority = RAS × (1 + 0.25 × DDI)
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ─── Tool drawer body ────────────────────────────────────────

function ScoringToolReference() {
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold">
          {locale === "en" ? "Value Magnitude (VM)" : "价值量 (VM)"}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          VM = Cost×0.35 + Quality×0.25 + Speed×0.20 + Strategic×0.20
        </p>
        {vmDimensions.map((d) => (
          <article
            key={d.id}
            className="mt-3 rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800"
          >
            <header className="flex items-center justify-between font-semibold">
              <span>{d.label[locale]}</span>
              <span className="text-zinc-400">×{d.weight}</span>
            </header>
            <table className="mt-2 w-full text-[11px]">
              <tbody>
                {d.anchors.map((a) => (
                  <tr key={a.score} className="border-t border-zinc-100 dark:border-zinc-800">
                    <td className="w-6 py-1 font-mono">{a.score}</td>
                    <td className="w-20 py-1 font-semibold">{a.label[locale]}</td>
                    <td className="w-24 py-1 text-zinc-500">{a.range[locale]}</td>
                    <td className="py-1 text-zinc-500">{a.description[locale]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </section>

      <section>
        <h3 className="text-sm font-semibold">
          {locale === "en" ? "Decision Density Index (DDI)" : "决策密度指数 (DDI)"}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {locale === "en"
            ? "DDI_raw = Σ(weight × count) / total_steps; normalize across cohort."
            : "DDI_raw = Σ(权重 × 计数) / 总步骤数;按本组归一化。"}
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          {decisionTypes.map((dt) => (
            <li key={dt.id} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <div className="flex items-center justify-between font-semibold">
                <span>{dt.label[locale]}</span>
                <span className="text-zinc-400">w = {dt.weight}</span>
              </div>
              <p className="mt-0.5 text-zinc-500">{dt.description[locale]}</p>
              <p className="mt-0.5 italic text-zinc-500">e.g. {dt.example[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">
          {locale === "en" ? "Risk Categories" : "风险类别"}
        </h3>
        <ul className="mt-2 space-y-1 text-xs">
          {riskCategories.map((cat) => (
            <li key={cat.id} className="rounded-md border border-zinc-200 p-2 dark:border-zinc-800">
              <div className="flex items-center justify-between font-semibold">
                <span>{cat.label[locale]}</span>
                <span className="text-zinc-400">{cat.basedOn[locale]}</span>
              </div>
              <dl className="mt-1 space-y-0.5">
                {cat.criteria.map((cr) => (
                  <div key={cr.level} className="flex gap-2">
                    <dt
                      className={
                        "w-5 shrink-0 text-center font-mono " +
                        (cr.level === "H"
                          ? "text-rose-600"
                          : cr.level === "M"
                          ? "text-amber-600"
                          : "text-emerald-600")
                      }
                    >
                      {cr.level}
                    </dt>
                    <dd className="text-zinc-500">{cr[locale]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-zinc-500">
          {locale === "en"
            ? "RiskPenalty = count of High; RAS = VM × (1 − 0.15 × RiskPenalty)."
            : "RiskPenalty = 高风险数量;RAS = VM × (1 − 0.15 × RiskPenalty)。"}
        </p>
      </section>

      <section className="rounded-md border border-indigo-200 bg-indigo-50 p-3 text-xs dark:border-indigo-900/50 dark:bg-indigo-950/20">
        <h3 className="font-semibold text-indigo-700 dark:text-indigo-300">
          {locale === "en" ? "Final Priority Score" : "最终优先级分数"}
        </h3>
        <p className="mt-1 font-mono">PriorityScore = RAS × (1 + 0.25 × DDI_normalized)</p>
        <p className="mt-1 text-indigo-900 dark:text-indigo-200">
          {locale === "en"
            ? `Hard floor for Design entry: ${PRIORITY_FLOOR}.`
            : `进入 Design 阶段的硬性门槛: ${PRIORITY_FLOOR}。`}
        </p>
        <table className="mt-2 w-full text-[11px]">
          <tbody>
            {priorityInterpretations.map((i, idx) => (
              <tr key={idx} className="border-t border-indigo-200/50 dark:border-indigo-900/40">
                <td className="w-20 py-1 font-mono">
                  {i.range[0]}–{i.range[1] === 999 ? "∞" : i.range[1]}
                </td>
                <td className="w-20 py-1 font-semibold">{i.label[locale]}</td>
                <td className="py-1 text-zinc-600 dark:text-zinc-400">{i.action[locale]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

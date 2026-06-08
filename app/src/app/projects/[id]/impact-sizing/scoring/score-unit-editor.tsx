"use client";

import { useLocale } from "@/lib/locale-context";
import {
  vmDimensions,
  decisionTypes,
  riskCategories,
  computeVm,
  computeDdiRaw,
  computeRiskPenalty,
  computeRas,
  computeUnitPriority,
  interpretPriority,
  interpretDdi,
  PRIORITY_FLOOR,
  priorityInterpretations,
  type VmDimensionId,
  type DecisionTypeId,
  type RiskCategoryId,
  type RiskLevel,
} from "@/content/scoring-rubric";
import type { VmScores, DdiCounts, RiskAssessment } from "@/content/sample-data";

/**
 * A scorable unit plus its free-text notes — the editable value of one editor.
 * Uses the strict domain score types so edits merge cleanly back onto a
 * Candidate or ProjectUseCase; assignable to ScorableUnit for the rubric fns.
 */
export interface ScoreUnitValue {
  vm: VmScores;
  ddi: DdiCounts;
  totalSteps: number;
  risk: RiskAssessment;
  notes: string;
}

interface ScoreUnitEditorProps {
  value: ScoreUnitValue;
  /** Cohort max raw DDI for normalization (workflow cohort or all scored use cases). */
  maxDdiRaw: number;
  onChange: (patch: Partial<ScoreUnitValue>) => void;
}

/**
 * Presentational VM / DDI / Risk / Notes editor with a Priority readout for a
 * single scorable unit. State is owned by the parent (candidate in workflow
 * mode, use case in use-case mode); this component is grain-agnostic.
 */
export function ScoreUnitEditor({ value: s, maxDdiRaw, onChange }: ScoreUnitEditorProps) {
  const { locale } = useLocale();

  const setVm = (id: VmDimensionId, score: 1 | 2 | 3 | 4 | 5) =>
    onChange({ vm: { ...s.vm, [id]: score } });
  const setDdi = (id: DecisionTypeId, v: number) =>
    onChange({ ddi: { ...s.ddi, [id]: Math.max(0, v) } });
  const setRisk = (id: RiskCategoryId, level: RiskLevel) =>
    onChange({ risk: { ...s.risk, [id]: level } });

  const vmTotal = computeVm(s.vm);
  const ddiNormalized = maxDdiRaw > 0 ? computeDdiRaw(s.ddi, s.totalSteps) / maxDdiRaw : 0;
  const riskPenalty = computeRiskPenalty(s.risk);
  const ras = computeRas(vmTotal, riskPenalty);
  const priority = computeUnitPriority(s, maxDdiRaw);
  const interp = interpretPriority(priority);
  const ddiInterp = interpretDdi(ddiNormalized);
  const passesFloor = priority >= PRIORITY_FLOOR;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_280px]">
      <div className="space-y-4">
        {/* VM section */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {locale === "en" ? "Value Magnitude (VM)" : "价值量 (VM)"}
            </h3>
            <span className="text-xs text-ink-faint">VM = Σ(weight × score)</span>
          </header>
          <div className="mt-3 space-y-4">
            {vmDimensions.map((d) => {
              const current = s.vm[d.id];
              const anchor = d.anchors.find((a) => a.score === current);
              return (
                <div key={d.id}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium">
                      {d.label[locale]} <span className="text-ink-faint">×{d.weight}</span>
                    </span>
                    <div className="inline-flex overflow-hidden rounded border border-border">
                      {[1, 2, 3, 4, 5].map((v) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => setVm(d.id, v as 1 | 2 | 3 | 4 | 5)}
                          className={
                            current === v
                              ? "bg-brand-600 px-2 py-0.5 text-white"
                              : "bg-surface px-2 py-0.5 text-ink-muted hover:bg-surface-muted/40"
                          }
                        >
                          {v}
                        </button>
                      ))}
                    </div>
                  </div>
                  {anchor && (
                    <div className="mt-1 flex items-baseline gap-2 text-[11px]">
                      <span className="rounded bg-brand-50 px-1.5 py-0.5 font-semibold text-brand-700 dark:bg-brand-800/40 dark:text-brand-300">
                        {anchor.label[locale]}
                      </span>
                      <span className="text-ink-muted">{anchor.range[locale]}</span>
                      <span className="text-ink-faint">— {anchor.description[locale]}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-baseline justify-end gap-1 border-t border-border pt-2 text-xs">
            <span className="text-ink-muted">VM composite:</span>
            <span className="font-mono text-base font-semibold">{vmTotal.toFixed(2)}</span>
            <span className="text-ink-faint">/ 5.00</span>
          </div>
        </section>

        {/* DDI section */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {locale === "en" ? "Decision Density Index (DDI)" : "决策密度指数 (DDI)"}
            </h3>
            <span className="text-xs text-ink-faint">
              DDI<sub>raw</sub> = Σ(w × count) / steps
            </span>
          </header>
          <p className="mt-1 text-[11px] text-ink-muted">
            {locale === "en"
              ? "Map decision points by complexity. Normalized against the highest-DDI unit in this cohort."
              : "按复杂度统计决策点。基于本组中最高 DDI 进行归一化。"}
          </p>
          <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
            {decisionTypes.map((dt) => (
              <label key={dt.id} className="rounded-md border border-border p-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-semibold">{dt.label[locale]}</span>
                  <span className="text-ink-faint">w={dt.weight}</span>
                </div>
                <p className="mt-0.5 line-clamp-2 text-[10px] text-ink-muted">{dt.description[locale]}</p>
                <input
                  type="number"
                  min={0}
                  value={s.ddi[dt.id]}
                  onChange={(e) => setDdi(dt.id, Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded border border-border bg-surface px-2 py-1 font-mono text-sm"
                />
              </label>
            ))}
            <label className="rounded-md border border-border p-2 text-xs">
              <div className="font-semibold">{locale === "en" ? "Total steps" : "总步骤数"}</div>
              <p className="mt-0.5 text-[10px] text-ink-muted">{locale === "en" ? "Denominator" : "分母"}</p>
              <input
                type="number"
                min={1}
                value={s.totalSteps}
                onChange={(e) => onChange({ totalSteps: Math.max(1, Number(e.target.value) || 1) })}
                className="mt-1 w-full rounded border border-border bg-surface px-2 py-1 font-mono text-sm"
              />
            </label>
            <div className="rounded-md border border-brand-100 bg-brand-50 p-2 text-xs dark:border-brand-800/50 dark:bg-brand-800/30">
              <div className="font-semibold text-brand-700 dark:text-brand-300">
                {locale === "en" ? "DDI normalized" : "DDI 归一化"}
              </div>
              <div className="mt-1 font-mono text-base font-semibold">{ddiNormalized.toFixed(2)}</div>
              <div className="text-[10px] text-ink-muted">
                {ddiInterp.level[locale]} · {ddiInterp.implication[locale]}
              </div>
            </div>
          </div>
        </section>

        {/* Risk section */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <header className="flex items-center justify-between">
            <h3 className="font-display text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {locale === "en" ? "Risk Assessment" : "风险评估"}
            </h3>
            <span className="text-xs text-ink-faint">
              {locale === "en" ? "RAS = VM × (1 − 0.15 × #High)" : "RAS = VM × (1 − 0.15 × 高风险数)"}
            </span>
          </header>
          <div className="mt-3 grid grid-cols-1 gap-2 md:grid-cols-2">
            {riskCategories.map((cat) => {
              const current = s.risk[cat.id];
              return (
                <div key={cat.id} className="rounded-md border border-border p-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">{cat.label[locale]}</span>
                    <div className="inline-flex overflow-hidden rounded border border-border">
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
                              : "bg-surface px-2 py-0.5 text-ink-muted hover:bg-surface-muted/40"
                          }
                        >
                          {lvl}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="mt-1 text-[10px] text-ink-muted">{cat.basedOn[locale]}</p>
                  <p className="mt-0.5 text-[10px] italic text-ink-muted">
                    {cat.criteria.find((cr) => cr.level === current)?.[locale]}
                  </p>
                </div>
              );
            })}
          </div>
          <div className="mt-3 flex items-baseline justify-end gap-1 border-t border-border pt-2 text-xs">
            <span className="text-ink-muted">{locale === "en" ? "High count:" : "高风险数:"}</span>
            <span className="font-mono">{riskPenalty}</span>
            <span className="text-ink-faint">→ penalty {riskPenalty * 15}%</span>
          </div>
        </section>

        {/* Notes */}
        <section className="rounded-xl border border-border bg-surface p-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
              {locale === "en" ? "Scoring notes" : "评分备注"}
            </span>
            <textarea
              rows={2}
              value={s.notes}
              onChange={(e) => onChange({ notes: e.target.value })}
              placeholder={
                locale === "en"
                  ? "Document any borderline calls, calibration disagreements, or overrides."
                  : "记录边界情况、校准分歧或主动覆盖。"
              }
              className="mt-1 w-full resize-y rounded-md border border-border bg-surface px-2 py-1 text-sm"
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
              ? "border-success/30 bg-success-soft"
              : "border-danger/30 bg-danger-soft")
          }
        >
          <div className="text-xs uppercase tracking-wide text-ink-muted">
            {locale === "en" ? "Priority Score" : "优先级分数"}
          </div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="font-mono text-3xl font-bold">{priority.toFixed(2)}</span>
            <span className="text-xs text-ink-faint">
              {locale === "en" ? "floor" : "门槛"} ≥ {PRIORITY_FLOOR}
            </span>
          </div>
          <span
            className={
              "mt-2 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold " +
              (passesFloor ? "bg-emerald-600 text-white" : "bg-rose-600 text-white")
            }
          >
            {interp.label[locale]}
          </span>
          <p className="mt-2 text-[11px] text-ink-muted">{interp.action[locale]}</p>
        </div>

        <div className="rounded-xl border border-border bg-surface p-4 text-xs">
          <h4 className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
            {locale === "en" ? "Breakdown" : "拆解"}
          </h4>
          <dl className="mt-2 space-y-1">
            <div className="flex justify-between">
              <dt className="text-ink-muted">VM</dt>
              <dd className="font-mono">{vmTotal.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">RiskPenalty</dt>
              <dd className="font-mono">{riskPenalty} × 15%</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">RAS</dt>
              <dd className="font-mono">{ras.toFixed(2)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-muted">DDI&nbsp;norm.</dt>
              <dd className="font-mono">{ddiNormalized.toFixed(2)}</dd>
            </div>
          </dl>
          <p className="mt-3 font-mono text-[10px] text-ink-faint">Priority = RAS × (1 + 0.25 × DDI)</p>
        </div>
      </aside>
    </div>
  );
}

// ─── Shared tool drawer body (used by both scoring modes) ─────

export function ScoringToolReference() {
  const { locale } = useLocale();

  return (
    <div className="space-y-5">
      <section>
        <h3 className="font-display text-sm font-semibold">
          {locale === "en" ? "Value Magnitude (VM)" : "价值量 (VM)"}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          VM = Cost×0.35 + Quality×0.25 + Speed×0.20 + Strategic×0.20
        </p>
        {vmDimensions.map((d) => (
          <article key={d.id} className="mt-3 rounded-md border border-border p-2 text-xs">
            <header className="flex items-center justify-between font-semibold">
              <span>{d.label[locale]}</span>
              <span className="text-ink-faint">×{d.weight}</span>
            </header>
            <table className="mt-2 w-full text-[11px]">
              <tbody>
                {d.anchors.map((a) => (
                  <tr key={a.score} className="border-t border-border">
                    <td className="w-6 py-1 font-mono">{a.score}</td>
                    <td className="w-20 py-1 font-semibold">{a.label[locale]}</td>
                    <td className="w-24 py-1 text-ink-muted">{a.range[locale]}</td>
                    <td className="py-1 text-ink-muted">{a.description[locale]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </article>
        ))}
      </section>

      <section>
        <h3 className="font-display text-sm font-semibold">
          {locale === "en" ? "Decision Density Index (DDI)" : "决策密度指数 (DDI)"}
        </h3>
        <p className="mt-1 text-xs text-ink-muted">
          {locale === "en"
            ? "DDI_raw = Σ(weight × count) / total_steps; normalize across cohort."
            : "DDI_raw = Σ(权重 × 计数) / 总步骤数;按本组归一化。"}
        </p>
        <ul className="mt-2 space-y-1 text-xs">
          {decisionTypes.map((dt) => (
            <li key={dt.id} className="rounded-md border border-border p-2">
              <div className="flex items-center justify-between font-semibold">
                <span>{dt.label[locale]}</span>
                <span className="text-ink-faint">w = {dt.weight}</span>
              </div>
              <p className="mt-0.5 text-ink-muted">{dt.description[locale]}</p>
              <p className="mt-0.5 italic text-ink-muted">e.g. {dt.example[locale]}</p>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="font-display text-sm font-semibold">{locale === "en" ? "Risk Categories" : "风险类别"}</h3>
        <ul className="mt-2 space-y-1 text-xs">
          {riskCategories.map((cat) => (
            <li key={cat.id} className="rounded-md border border-border p-2">
              <div className="flex items-center justify-between font-semibold">
                <span>{cat.label[locale]}</span>
                <span className="text-ink-faint">{cat.basedOn[locale]}</span>
              </div>
              <dl className="mt-1 space-y-0.5">
                {cat.criteria.map((cr) => (
                  <div key={cr.level} className="flex gap-2">
                    <dt
                      className={
                        "w-5 shrink-0 text-center font-mono " +
                        (cr.level === "H"
                          ? "text-danger"
                          : cr.level === "M"
                            ? "text-warning"
                            : "text-success")
                      }
                    >
                      {cr.level}
                    </dt>
                    <dd className="text-ink-muted">{cr[locale]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-ink-muted">
          {locale === "en"
            ? "RiskPenalty = count of High; RAS = VM × (1 − 0.15 × RiskPenalty)."
            : "RiskPenalty = 高风险数量;RAS = VM × (1 − 0.15 × RiskPenalty)。"}
        </p>
      </section>

      <section className="rounded-md border border-brand-100 bg-brand-50 p-3 text-xs dark:border-brand-800/50 dark:bg-brand-800/20">
        <h3 className="font-display font-semibold text-brand-700 dark:text-brand-300">
          {locale === "en" ? "Final Priority Score" : "最终优先级分数"}
        </h3>
        <p className="mt-1 font-mono">PriorityScore = RAS × (1 + 0.25 × DDI_normalized)</p>
        <p className="mt-1 text-brand-800 dark:text-brand-100">
          {locale === "en"
            ? `Hard floor for Design entry: ${PRIORITY_FLOOR}.`
            : `进入 Design 阶段的硬性门槛: ${PRIORITY_FLOOR}。`}
        </p>
        <table className="mt-2 w-full text-[11px]">
          <tbody>
            {priorityInterpretations.map((i, idx) => (
              <tr key={idx} className="border-t border-brand-100/50 dark:border-brand-800/40">
                <td className="w-20 py-1 font-mono">
                  {i.range[0]}–{i.range[1] === 999 ? "∞" : i.range[1]}
                </td>
                <td className="w-20 py-1 font-semibold">{i.label[locale]}</td>
                <td className="py-1 text-ink-muted">{i.action[locale]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

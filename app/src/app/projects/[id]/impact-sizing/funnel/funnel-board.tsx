"use client";

import { useMemo, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { Candidate, OdsScores, OrsScores } from "@/content/sample-data";
import {
  odsIndicators,
  orsIndicators,
  quadrants,
  quadrantFromScores,
  FUNNEL_THRESHOLD,
  type OdsIndicatorId,
  type OrsIndicatorId,
  type QuadrantId,
} from "@/content/funnel-rubric";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import { ToolDrawer } from "@/components/tool-drawer";

interface FunnelBoardProps {
  candidates: ReadonlyArray<Candidate>;
}

type Mode = "score" | "free";

interface FreePosition {
  candidateId: string;
  x: number;
  y: number;
}

const odsTotal = (s: OdsScores): number =>
  odsIndicators.reduce((sum, ind) => sum + s[ind.id] * ind.weight, 0);

const orsTotal = (s: OrsScores): number =>
  orsIndicators.reduce((sum, ind) => sum + s[ind.id] * ind.weight, 0);

const quadrantPalette: Record<QuadrantId, { bg: string; ring: string; text: string }> = {
  quickWin: {
    bg: "bg-emerald-50 dark:bg-emerald-950/30",
    ring: "ring-emerald-300 dark:ring-emerald-800",
    text: "text-emerald-700 dark:text-emerald-300",
  },
  sponsorAlign: {
    bg: "bg-amber-50 dark:bg-amber-950/30",
    ring: "ring-amber-300 dark:ring-amber-800",
    text: "text-amber-700 dark:text-amber-300",
  },
  investProve: {
    bg: "bg-sky-50 dark:bg-sky-950/30",
    ring: "ring-sky-300 dark:ring-sky-800",
    text: "text-sky-700 dark:text-sky-300",
  },
  deferMature: {
    bg: "bg-zinc-100 dark:bg-zinc-800/40",
    ring: "ring-zinc-300 dark:ring-zinc-700",
    text: "text-zinc-700 dark:text-zinc-300",
  },
};

export function FunnelBoard({ candidates }: FunnelBoardProps) {
  const { locale } = useLocale();

  const eligible = useMemo(
    () =>
      candidates.filter((c) => {
        const score = screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0);
        return score >= SCREEN_PASS_THRESHOLD;
      }),
    [candidates],
  );

  const [mode, setMode] = useState<Mode>("score");
  const [odsByCandidate, setOds] = useState<Record<string, OdsScores>>(() => {
    const out: Record<string, OdsScores> = {};
    eligible.forEach((c) => (out[c.id] = { ...c.ods }));
    return out;
  });
  const [orsByCandidate, setOrs] = useState<Record<string, OrsScores>>(() => {
    const out: Record<string, OrsScores> = {};
    eligible.forEach((c) => (out[c.id] = { ...c.ors }));
    return out;
  });
  const [free, setFree] = useState<FreePosition[]>(() =>
    eligible.map((c) => ({
      candidateId: c.id,
      x: odsTotal(c.ods) / 2, // 0..2 → 0..1
      y: 1 - orsTotal(c.ors) / 2,
    })),
  );
  const [selected, setSelected] = useState<string | null>(eligible[0]?.id ?? null);

  const getCandidate = (id: string): Candidate | undefined =>
    candidates.find((c) => c.id === id);

  const positionOf = (candidateId: string): { x: number; y: number } => {
    if (mode === "score") {
      return {
        x: odsTotal(odsByCandidate[candidateId]) / 2,
        y: 1 - orsTotal(orsByCandidate[candidateId]) / 2,
      };
    }
    const p = free.find((p) => p.candidateId === candidateId);
    return { x: p?.x ?? 0.5, y: p?.y ?? 0.5 };
  };

  const quadrantOf = (candidateId: string): QuadrantId => {
    if (mode === "score") {
      return quadrantFromScores(odsTotal(odsByCandidate[candidateId]), orsTotal(orsByCandidate[candidateId]));
    }
    const { x, y } = positionOf(candidateId);
    const ods = x * 2;
    const ors = (1 - y) * 2;
    return quadrantFromScores(ods, ors);
  };

  // ── Drag ────────────────────────────────────────────────────
  const [drag, setDrag] = useState<{ candidateId: string; offsetX: number; offsetY: number } | null>(null);

  const onTokenDown = (e: React.MouseEvent<HTMLButtonElement>, candidateId: string) => {
    if (mode !== "free") {
      setSelected(candidateId);
      return;
    }
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setDrag({ candidateId, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
    setSelected(candidateId);
  };

  const onBoardMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!drag) return;
    const board = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - board.left - drag.offsetX + 14) / board.width;
    const y = (e.clientY - board.top - drag.offsetY + 14) / board.height;
    setFree((prev) =>
      prev.map((p) =>
        p.candidateId === drag.candidateId
          ? { ...p, x: Math.max(0, Math.min(1, x)), y: Math.max(0, Math.min(1, y)) }
          : p,
      ),
    );
  };

  const onBoardUp = () => setDrag(null);

  // ── Score updates ───────────────────────────────────────────
  const setOdsScore = (candidateId: string, ind: OdsIndicatorId, value: 0 | 1 | 2) => {
    setOds((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], [ind]: value } }));
  };

  const setOrsScore = (candidateId: string, ind: OrsIndicatorId, value: 0 | 1 | 2) => {
    setOrs((prev) => ({ ...prev, [candidateId]: { ...prev[candidateId], [ind]: value } }));
  };

  const selectedCandidate = selected ? getCandidate(selected) : undefined;
  const selectedQuadrantId = selected ? quadrantOf(selected) : undefined;
  const selectedQuadrant = quadrants.find((q) => q.id === selectedQuadrantId);
  const selectedOdsScores = selected ? odsByCandidate[selected] : undefined;
  const selectedOrsScores = selected ? orsByCandidate[selected] : undefined;
  const selectedOdsTotal = selectedOdsScores ? odsTotal(selectedOdsScores) : 0;
  const selectedOrsTotal = selectedOrsScores ? orsTotal(selectedOrsScores) : 0;

  return (
    <div className="space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">
            {locale === "en" ? "Layer 2 · 2x2 Prioritization Funnel" : "Layer 2 · 2x2 优先级漏斗"}
          </h2>
          <p className="mt-1 text-xs text-zinc-500">
            {locale === "en"
              ? `ODS × ORS (each 0–2, threshold ${FUNNEL_THRESHOLD}). Toggle between structured scoring and free positioning.`
              : `ODS × ORS(各 0–2,阈值 ${FUNNEL_THRESHOLD})。可在结构化评分与自由拖动之间切换。`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md border border-zinc-200 bg-white p-0.5 text-xs dark:border-zinc-700 dark:bg-zinc-900">
            <button
              type="button"
              onClick={() => setMode("score")}
              className={
                mode === "score"
                  ? "rounded bg-indigo-600 px-2.5 py-1 font-medium text-white"
                  : "rounded px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }
            >
              {locale === "en" ? "Structured" : "结构化"}
            </button>
            <button
              type="button"
              onClick={() => setMode("free")}
              className={
                mode === "free"
                  ? "rounded bg-indigo-600 px-2.5 py-1 font-medium text-white"
                  : "rounded px-2.5 py-1 text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              }
            >
              {locale === "en" ? "Free drag" : "自由拖动"}
            </button>
          </div>
          <ToolDrawer
            buttonLabel={locale === "en" ? "Tool Reference" : "工具参考"}
            title={locale === "en" ? "Prioritization Matrix Guide" : "优先级矩阵指南"}
            subtitle={
              locale === "en"
                ? "ODS & ORS indicator definitions, quadrant action paths, inter-rater protocol."
                : "ODS 与 ORS 指标定义、象限行动路径、跨评审者协议。"
            }
          >
            <FunnelToolReference />
          </ToolDrawer>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
        <section className="space-y-2">
          <div className="flex justify-between text-xs text-zinc-500">
            <span>ODS — {locale === "en" ? "Output Determinism" : "输出确定性"} →</span>
            <span>↑ ORS — {locale === "en" ? "Organizational Readiness" : "组织准备度"}</span>
          </div>
          <div
            className="relative h-[440px] w-full select-none rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900"
            onMouseMove={onBoardMove}
            onMouseUp={onBoardUp}
            onMouseLeave={onBoardUp}
          >
            {/* quadrant backgrounds */}
            {quadrants.map((q) => {
              const left = q.hi.ods ? "left-1/2" : "left-0";
              const top = q.hi.ors ? "top-0" : "top-1/2";
              const palette = quadrantPalette[q.id];
              return (
                <div
                  key={q.id}
                  className={`absolute h-1/2 w-1/2 ${left} ${top} ${palette.bg}`}
                />
              );
            })}

            {/* axis lines */}
            <div className="absolute left-1/2 top-0 h-full w-px bg-zinc-300 dark:bg-zinc-700" />
            <div className="absolute left-0 top-1/2 h-px w-full bg-zinc-300 dark:bg-zinc-700" />

            {/* quadrant labels */}
            {quadrants.map((q) => {
              const palette = quadrantPalette[q.id];
              const x = q.hi.ods ? "right-3" : "left-3";
              const y = q.hi.ors ? "top-2" : "bottom-2";
              return (
                <span
                  key={`label-${q.id}`}
                  className={`absolute ${x} ${y} text-xs font-semibold ${palette.text}`}
                >
                  {q.shortName[locale]}
                  <span className="ml-1 font-normal opacity-70">· {q.timeline[locale]}</span>
                </span>
              );
            })}

            {/* tokens — inline style required for dynamic computed positions */}
            {eligible.map((c) => {
              const { x, y } = positionOf(c.id);
              const isSelected = selected === c.id;
              const tokenStyle: React.CSSProperties = {
                left: `${x * 100}%`,
                top: `${y * 100}%`,
              };
              return (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={(e) => onTokenDown(e, c.id)}
                  className={
                    "absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-2.5 py-1 text-xs font-medium shadow-sm transition-shadow " +
                    (mode === "free" ? "cursor-grab active:cursor-grabbing " : "cursor-pointer ") +
                    (isSelected
                      ? "z-10 bg-indigo-600 text-white shadow-md ring-2 ring-indigo-300"
                      : "bg-white text-zinc-900 ring-1 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-50 dark:ring-zinc-700")
                  }
                  style={tokenStyle}
                >
                  {c.name}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="space-y-3">
          {selectedCandidate && selectedQuadrant ? (
            <>
              <div
                className={`rounded-xl border bg-white p-4 dark:bg-zinc-900 ring-2 ${quadrantPalette[selectedQuadrant.id].ring}`}
              >
                <div className="text-xs uppercase tracking-wide text-zinc-500">
                  {locale === "en" ? "Selected" : "已选"}
                </div>
                <div className="mt-0.5 font-semibold">{selectedCandidate.name}</div>
                <div
                  className={`mt-3 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ${quadrantPalette[selectedQuadrant.id].bg} ${quadrantPalette[selectedQuadrant.id].text}`}
                >
                  {selectedQuadrant.shortName[locale]} · {selectedQuadrant.timeline[locale]}
                </div>
                <dl className="mt-3 space-y-1 text-xs">
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">ODS</dt>
                    <dd className="font-mono">
                      {selectedOdsTotal.toFixed(2)}{" "}
                      <span className="text-zinc-400">/ 2.0</span>
                    </dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-zinc-500">ORS</dt>
                    <dd className="font-mono">
                      {selectedOrsTotal.toFixed(2)}{" "}
                      <span className="text-zinc-400">/ 2.0</span>
                    </dd>
                  </div>
                </dl>
                <p className="mt-3 text-xs text-zinc-600 dark:text-zinc-400">
                  {selectedQuadrant.rationale[locale]}
                </p>
                <h4 className="mt-3 text-[10px] font-semibold uppercase tracking-wide text-zinc-500">
                  {locale === "en" ? "Action path" : "行动路径"}
                </h4>
                <ul className="mt-1 list-disc space-y-0.5 pl-4 text-xs text-zinc-700 dark:text-zinc-300">
                  {selectedQuadrant.actionPath[locale].map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </div>

              {mode === "score" && selectedOdsScores && selectedOrsScores && (
                <ScoreEditor
                  ods={selectedOdsScores}
                  ors={selectedOrsScores}
                  onOds={(ind, v) => setOdsScore(selectedCandidate.id, ind, v)}
                  onOrs={(ind, v) => setOrsScore(selectedCandidate.id, ind, v)}
                />
              )}
            </>
          ) : (
            <p className="rounded-md border border-zinc-200 bg-white p-4 text-xs text-zinc-500 dark:border-zinc-800 dark:bg-zinc-900">
              {locale === "en"
                ? "Select a token to score it or see its action path."
                : "选择卡片以评分或查看行动路径。"}
            </p>
          )}
        </aside>
      </div>
    </div>
  );
}

// ─── Score editor sub-component ──────────────────────────────

interface ScoreEditorProps {
  ods: OdsScores;
  ors: OrsScores;
  onOds: (ind: OdsIndicatorId, v: 0 | 1 | 2) => void;
  onOrs: (ind: OrsIndicatorId, v: 0 | 1 | 2) => void;
}

function ScoreEditor({ ods, ors, onOds, onOrs }: ScoreEditorProps) {
  const { locale } = useLocale();

  const row = <TId extends string>(
    label: string,
    weight: number,
    current: 0 | 1 | 2,
    anchors: ReadonlyArray<{ score: 0 | 1 | 2; en: string; zh: string }>,
    onChange: (v: 0 | 1 | 2) => void,
  ) => {
    const currentAnchor = anchors.find((a) => a.score === current);
    return (
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium">
            {label} <span className="text-zinc-400">×{weight}</span>
          </span>
          <div className="inline-flex overflow-hidden rounded border border-zinc-200 dark:border-zinc-700">
            {[0, 1, 2].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => onChange(v as 0 | 1 | 2)}
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
        {currentAnchor && (
          <p className="text-[11px] italic text-zinc-500">
            {currentAnchor[locale]}
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
      <h3 className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
        ODS — {locale === "en" ? "Output Determinism" : "输出确定性"}
      </h3>
      <div className="mt-2 space-y-3">
        {odsIndicators.map((ind) =>
          row(ind.label[locale], ind.weight, ods[ind.id], ind.anchors, (v) => onOds(ind.id, v)),
        )}
      </div>

      <h3 className="mt-5 text-xs font-semibold uppercase tracking-wide text-zinc-500">
        ORS — {locale === "en" ? "Organizational Readiness" : "组织准备度"}
      </h3>
      <div className="mt-2 space-y-3">
        {orsIndicators.map((ind) =>
          row(ind.label[locale], ind.weight, ors[ind.id], ind.anchors, (v) => onOrs(ind.id, v)),
        )}
      </div>
    </div>
  );
}

// ─── Tool drawer body ────────────────────────────────────────

function FunnelToolReference() {
  const { locale } = useLocale();
  return (
    <div className="space-y-5">
      <section>
        <h3 className="text-sm font-semibold">
          ODS — {locale === "en" ? "Output Determinism Score (X-axis)" : "输出确定性分数(X 轴)"}
        </h3>
        <p className="mt-1 text-xs text-zinc-500">
          {locale === "en"
            ? `Range 0.0–2.0. Threshold ${FUNNEL_THRESHOLD} separates High from Low.`
            : `范围 0.0–2.0。阈值 ${FUNNEL_THRESHOLD} 区分高/低。`}
        </p>
        <ul className="mt-2 space-y-2">
          {odsIndicators.map((ind) => (
            <li key={ind.id} className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800">
              <div className="flex items-center justify-between font-semibold">
                <span>{ind.label[locale]}</span>
                <span className="text-zinc-400">×{ind.weight}</span>
              </div>
              <dl className="mt-1 space-y-0.5">
                {ind.anchors.map((a) => (
                  <div key={a.score} className="flex gap-2">
                    <dt className="w-4 shrink-0 font-mono text-zinc-500">{a.score}</dt>
                    <dd className="text-zinc-600 dark:text-zinc-400">{a[locale]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">
          ORS — {locale === "en" ? "Organizational Readiness Score (Y-axis)" : "组织准备度分数(Y 轴)"}
        </h3>
        <ul className="mt-2 space-y-2">
          {orsIndicators.map((ind) => (
            <li key={ind.id} className="rounded-md border border-zinc-200 p-2 text-xs dark:border-zinc-800">
              <div className="flex items-center justify-between font-semibold">
                <span>{ind.label[locale]}</span>
                <span className="text-zinc-400">×{ind.weight}</span>
              </div>
              <dl className="mt-1 space-y-0.5">
                {ind.anchors.map((a) => (
                  <div key={a.score} className="flex gap-2">
                    <dt className="w-4 shrink-0 font-mono text-zinc-500">{a.score}</dt>
                    <dd className="text-zinc-600 dark:text-zinc-400">{a[locale]}</dd>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section>
        <h3 className="text-sm font-semibold">
          {locale === "en" ? "Quadrant action paths" : "象限行动路径"}
        </h3>
        <div className="mt-2 grid grid-cols-1 gap-2">
          {quadrants.map((q) => {
            const palette = quadrantPalette[q.id];
            return (
              <article
                key={q.id}
                className={`rounded-md border border-zinc-200 p-3 text-xs dark:border-zinc-800`}
              >
                <header className="flex items-center justify-between">
                  <span className={`rounded-md px-2 py-0.5 font-semibold ${palette.bg} ${palette.text}`}>
                    {q.shortName[locale]}
                  </span>
                  <span className="text-zinc-500">{q.timeline[locale]}</span>
                </header>
                <p className="mt-2 text-zinc-600 dark:text-zinc-400">{q.rationale[locale]}</p>
                <ul className="mt-2 list-disc space-y-0.5 pl-4 text-zinc-600 dark:text-zinc-400">
                  {q.actionPath[locale].map((step, i) => (
                    <li key={i}>{step}</li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      <section className="rounded-md border border-zinc-200 bg-zinc-50 p-3 text-xs dark:border-zinc-800 dark:bg-zinc-950">
        <h3 className="font-semibold">
          {locale === "en" ? "Inter-Rater Protocol" : "跨评审者协议"}
        </h3>
        <ol className="mt-1 list-decimal space-y-1 pl-4 text-zinc-600 dark:text-zinc-400">
          <li>
            {locale === "en"
              ? "Both team members score ODS and ORS independently (no discussion)."
              : "两位团队成员独立评分(评分中不讨论)。"}
          </li>
          <li>
            {locale === "en"
              ? "If gap > 0.4 on either axis, discuss evidence and re-score."
              : "若任一轴差异 > 0.4,讨论证据并重新评分。"}
          </li>
          <li>{locale === "en" ? "Final score is the agreed value (not an average)." : "最终分数为协商一致值(非平均)。"}</li>
          <li>
            {locale === "en"
              ? "Target Cohen's κ ≥ 0.70 on quadrant assignment."
              : "象限分配的 Cohen's κ ≥ 0.70 为目标。"}
          </li>
        </ol>
      </section>
    </div>
  );
}

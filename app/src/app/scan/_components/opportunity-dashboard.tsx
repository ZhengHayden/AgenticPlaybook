"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ScanMode, ScanModel } from "@/lib/scan/types";
import { formatValue, totalValue } from "@/lib/scan/format";
import { DataSummary } from "./data-summary";
import { Heatmap } from "./heatmap";
import { FunctionDetailModal } from "./function-detail-modal";
import { EditDataPanel } from "./edit-data-panel";

interface OpportunityDashboardProps {
  model: ScanModel;
  /** Show the "linked to client" badge (true on the project tab). */
  showClientLink?: boolean;
}

const MODES: { id: ScanMode; labelKey: "modeUsd" | "modeFte" | "modeBaseline"; descKey: "modeUsdLabel" | "modeFteLabel" | "modeBaselineLabel" }[] = [
  { id: "usd", labelKey: "modeUsd", descKey: "modeUsdLabel" },
  { id: "fte", labelKey: "modeFte", descKey: "modeFteLabel" },
  { id: "baseline", labelKey: "modeBaseline", descKey: "modeBaselineLabel" },
];

/**
 * The Opportunity Dashboard for one company's scan: manifest header, the data
 * summary (shown first), then the automation-impact heatmap revealed on demand
 * with the USD/FTE/Baseline toggle and the per-function drill-down modal.
 */
export function OpportunityDashboard({ model: initialModel, showClientLink = false }: OpportunityDashboardProps) {
  const { t } = useLocale();
  const [model, setModel] = useState<ScanModel>(initialModel);
  const [mode, setMode] = useState<ScanMode>("usd");
  const [selectedFn, setSelectedFn] = useState<string | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [showEdit, setShowEdit] = useState(false);

  const selectedMeta = selectedFn ? model.detail[selectedFn] : null;

  const modeBtnCls = (active: boolean): string =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      active
        ? "bg-indigo-600 text-white"
        : "border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900"
    }`;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{model.company}</h1>
          <p className="mt-1 text-sm text-zinc-500">
            {model.sector} · {t.scan.generatedAt} {new Date(model.generatedAt).toLocaleString()}
          </p>
        </div>
        {showClientLink && (
          <span className="rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900/50 dark:bg-indigo-950 dark:text-indigo-300">
            {t.scan.linkedToClient}: {model.company}
          </span>
        )}
      </header>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowEdit(true)}
          className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm font-medium hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
        >
          {t.scan.editData}
        </button>
      </div>

      <DataSummary model={model} />

      {!showHeatmap ? (
        <button
          type="button"
          onClick={() => setShowHeatmap(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.scan.runScan}
        </button>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex gap-2">
              {MODES.map((m) => (
                <button key={m.id} type="button" className={modeBtnCls(mode === m.id)} onClick={() => setMode(m.id)} title={t.scan[m.descKey]}>
                  {t.scan[m.labelKey]}
                </button>
              ))}
            </div>
            <span className="text-sm text-zinc-500">
              {t.scan[MODES.find((m) => m.id === mode)!.descKey]}:{" "}
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {formatValue(totalValue(model.totals, mode), mode)}
              </span>
            </span>
          </div>

          <p className="text-xs text-zinc-400">{t.scan.clickHint}</p>

          <div className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
            <Heatmap model={model} mode={mode} onCellClick={setSelectedFn} />
          </div>

          <div className="flex items-center gap-2 text-xs text-zinc-500">
            <span>{t.scan.legendLow}</span>
            <span
              className="h-3 w-40 rounded-sm"
              style={{ background: "linear-gradient(to right, rgba(79,70,229,0.1), rgba(79,70,229,0.95))" }}
            />
            <span>{t.scan.legendHigh}</span>
          </div>

          {model.warnings.length > 0 && (
            <details className="rounded-md border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-900/40 dark:bg-amber-900/20 dark:text-amber-200">
              <summary className="cursor-pointer font-medium">
                {t.scan.warnings} ({model.warnings.length})
              </summary>
              <ul className="mt-2 list-disc space-y-0.5 pl-5">
                {model.warnings.map((w) => (
                  <li key={w}>{w}</li>
                ))}
              </ul>
            </details>
          )}
        </section>
      )}

      {selectedMeta && <FunctionDetailModal meta={selectedMeta} onClose={() => setSelectedFn(null)} />}

      {showEdit && (
        <EditDataPanel
          companyKey={model.companyKey}
          onClose={() => setShowEdit(false)}
          onSaved={(next) => setModel(next)}
        />
      )}
    </div>
  );
}

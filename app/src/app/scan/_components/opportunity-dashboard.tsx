"use client";

import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ScanMode, ScanModel } from "@/lib/scan/types";
import { formatValue, totalValue } from "@/lib/scan/format";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { SegTabs } from "@/components/ui/seg-tabs";
import { Radar } from "lucide-react";
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

  return (
    <div className="space-y-6">
      <PageHeader
        icon={<Radar className="h-5 w-5" />}
        title={model.company}
        subtitle={`${model.sector} · ${t.scan.generatedAt} ${new Date(model.generatedAt).toLocaleString()}`}
        actions={
          <>
            {showClientLink && (
              <span className="rounded-full border border-brand-100 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700 dark:border-brand-800/50 dark:bg-brand-800/20 dark:text-brand-300">
                {t.scan.linkedToClient}: {model.company}
              </span>
            )}
            <Button variant="secondary" onClick={() => setShowEdit(true)}>
              {t.scan.editData}
            </Button>
          </>
        }
      />

      <DataSummary model={model} />

      {!showHeatmap ? (
        <Button onClick={() => setShowHeatmap(true)}>{t.scan.runScan}</Button>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <SegTabs<ScanMode>
              value={mode}
              onChange={setMode}
              tabs={MODES.map((m) => ({ value: m.id, label: t.scan[m.labelKey] }))}
            />
            <span className="text-sm text-ink-muted">
              {t.scan[MODES.find((m) => m.id === mode)!.descKey]}:{" "}
              <span className="font-semibold text-foreground">
                {formatValue(totalValue(model.totals, mode), mode)}
              </span>
            </span>
          </div>

          <p className="text-xs text-ink-faint">{t.scan.clickHint}</p>

          <div className="rounded-xl border border-border bg-surface p-4">
            <Heatmap model={model} mode={mode} onCellClick={setSelectedFn} />
          </div>

          <div className="flex items-center gap-2 text-xs text-ink-muted">
            <span>{t.scan.legendLow}</span>
            <span
              className="h-3 w-40 rounded-sm"
              style={{ background: "linear-gradient(to right, rgba(1,118,211,0.1), rgba(1,118,211,0.95))" }}
            />
            <span>{t.scan.legendHigh}</span>
          </div>

          {model.warnings.length > 0 && (
            <details className="rounded-md border border-warning/30 bg-warning-soft p-3 text-xs text-warning">
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

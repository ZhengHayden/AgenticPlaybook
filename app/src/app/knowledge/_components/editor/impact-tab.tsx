"use client";

import { useState } from "react";
import type { KnowledgeUseCase, KpiMetric } from "@/content/knowledge";
import type { UpdateUseCaseInput } from "@/db/knowledge-validation";
import { useLocale } from "@/lib/locale-context";
import { Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Field, FIELD_CLASS, SaveBar, fromLines, toLines } from "../field";
import { FormSection } from "../form-section";

interface ImpactTabProps {
  useCase: KnowledgeUseCase;
  onPatch: (patch: UpdateUseCaseInput) => Promise<void>;
  /** When false, fields render read-only (no Save bar). */
  editing: boolean;
}

const EMPTY_ROW: KpiMetric = { metric: "", baseline: "", target: "", unit: "", source: "" };

const CELL_CLASS =
  "w-full rounded-md border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 " +
  "disabled:cursor-default disabled:appearance-none disabled:border-transparent disabled:bg-transparent disabled:px-0 disabled:text-slate-900 disabled:opacity-100 dark:disabled:bg-transparent dark:disabled:text-slate-100";

/** Drop rows whose metric name is blank. */
function cleanMetrics(rows: KpiMetric[]): KpiMetric[] {
  return rows
    .map((r) => ({
      metric: r.metric.trim(),
      baseline: r.baseline.trim(),
      target: r.target.trim(),
      unit: r.unit.trim(),
      source: r.source.trim(),
    }))
    .filter((r) => r.metric.length > 0);
}

/**
 * Impact tab (proposal §5.6): structured KPI rows (metric · baseline · target ·
 * unit · source) as the primary representation, with free-text KPIs kept as a
 * Notes field and business objectives below.
 */
export function ImpactTab({ useCase, onPatch, editing }: ImpactTabProps) {
  const { t } = useLocale();
  const [metrics, setMetrics] = useState<KpiMetric[]>(useCase.kpiMetrics ?? []);
  const [notes, setNotes] = useState(toLines(useCase.kpis));
  const [objectives, setObjectives] = useState(toLines(useCase.businessObjectives));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty =
    JSON.stringify(cleanMetrics(metrics)) !== JSON.stringify(useCase.kpiMetrics ?? []) ||
    notes !== toLines(useCase.kpis) ||
    objectives !== toLines(useCase.businessObjectives);

  const setCell = (i: number, key: keyof KpiMetric, value: string) =>
    setMetrics((prev) => prev.map((r, j) => (j === i ? { ...r, [key]: value } : r)));

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      await onPatch({
        kpiMetrics: cleanMetrics(metrics),
        kpis: fromLines(notes),
        businessObjectives: fromLines(objectives),
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : t.knowledge.saveError);
    } finally {
      setSaving(false);
    }
  }

  const columns = [
    { key: "metric" as const, label: t.knowledge.kpiMetric, w: "w-[30%]" },
    { key: "baseline" as const, label: t.knowledge.kpiBaseline, w: "w-[16%]" },
    { key: "target" as const, label: t.knowledge.kpiTarget, w: "w-[16%]" },
    { key: "unit" as const, label: t.knowledge.kpiUnit, w: "w-[12%]" },
    { key: "source" as const, label: t.knowledge.kpiSource, w: "w-[26%]" },
  ];

  return (
    <fieldset disabled={!editing} className="contents">
      <div className="space-y-6">
        <FormSection title={t.knowledge.kpiMetricsTitle}>
          {metrics.length === 0 && !editing ? (
            <EmptyState title={t.knowledge.noKpis} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-[0.04em] text-ink-faint">
                    {columns.map((c) => (
                      <th key={c.key} className={`pb-1 pr-2 font-semibold ${c.w}`}>
                        {c.label}
                      </th>
                    ))}
                    {editing && <th className="w-8 pb-1" />}
                  </tr>
                </thead>
                <tbody>
                  {metrics.map((row, i) => (
                    <tr key={i} className="align-top">
                      {columns.map((c) => (
                        <td key={c.key} className="py-1 pr-2">
                          <input
                            className={CELL_CLASS}
                            value={row[c.key]}
                            onChange={(e) => setCell(i, c.key, e.target.value)}
                          />
                        </td>
                      ))}
                      {editing && (
                        <td className="py-1">
                          <button
                            type="button"
                            onClick={() => setMetrics((prev) => prev.filter((_, j) => j !== i))}
                            aria-label={t.knowledge.removeReference}
                            className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-state-block-bg hover:text-state-block"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editing && (
            <Button
              variant="secondary"
              className="mt-3 text-xs"
              onClick={() => setMetrics((prev) => [...prev, { ...EMPTY_ROW }])}
            >
              <Plus className="h-3.5 w-3.5" /> {t.knowledge.addKpi}
            </Button>
          )}
        </FormSection>

        <FormSection title={t.knowledge.kpiNotes}>
          <Field label={t.knowledge.fieldKpis} hint={t.knowledge.kpisHint}>
            <textarea className={FIELD_CLASS} rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </Field>
        </FormSection>

        <FormSection title={t.knowledge.fieldObjectives}>
          <Field label={t.knowledge.fieldObjectives} hint={t.knowledge.objectivesHint}>
            <textarea
              className={FIELD_CLASS}
              rows={5}
              value={objectives}
              onChange={(e) => setObjectives(e.target.value)}
            />
          </Field>
        </FormSection>
      </div>

      {editing && (
        <SaveBar
          dirty={dirty}
          saving={saving}
          error={error}
          saveLabel={t.common.save}
          savingLabel={t.common.save + "…"}
          onSave={handleSave}
        >
          {dirty ? t.knowledge.unsavedChanges : t.common.saved}
        </SaveBar>
      )}
    </fieldset>
  );
}

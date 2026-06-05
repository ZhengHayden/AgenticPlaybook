"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchScanInputs, updateScanInputs } from "@/lib/api-client";
import type { FunctionMeta, HcRow, LaborRateRow, ScanInputs, ScanModel } from "@/lib/scan/types";
import { LaborRateEditor } from "./labor-rate-editor";
import { HeadcountEditor } from "./headcount-editor";
import { WorkContentEditor } from "./work-content-editor";

interface EditDataPanelProps {
  companyKey: string;
  onClose: () => void;
  /** Called with the freshly recomputed model after a successful save. */
  onSaved: (model: ScanModel) => void;
}

type Tab = "labor" | "hc" | "work";

/**
 * Tabbed "Edit Data" modal. Lazily loads the company's editable input layer,
 * holds it in immutable local state across three editors, and on "Save &
 * recompute" PUTs the edits, then hands the fresh model back to the dashboard.
 */
export function EditDataPanel({ companyKey, onClose, onSaved }: EditDataPanelProps) {
  const { t } = useLocale();
  const [inputs, setInputs] = useState<ScanInputs | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("labor");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    // `loading` initializes to true, so no synchronous setState is needed here;
    // the async callbacks below resolve it. companyKey is stable per dashboard.
    let active = true;
    fetchScanInputs(companyKey)
      .then((data) => {
        if (active) setInputs(data);
      })
      .catch((err) => {
        if (active) setLoadError(err instanceof Error ? err.message : "Unexpected error");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [companyKey]);

  const setLaborRows = (laborRows: LaborRateRow[]) =>
    setInputs((prev) => (prev ? { ...prev, laborRows } : prev));
  const setHcRows = (hcRows: HcRow[]) => setInputs((prev) => (prev ? { ...prev, hcRows } : prev));
  const setAutomation = (automation: Record<string, FunctionMeta>) =>
    setInputs((prev) => (prev ? { ...prev, automation } : prev));

  const handleSave = async () => {
    if (!inputs) return;
    setSaving(true);
    setSaveError(null);
    try {
      const model = await updateScanInputs(companyKey, inputs);
      onSaved(model);
      onClose();
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setSaving(false);
    }
  };

  const tabCls = (active: boolean): string =>
    `rounded-md px-3 py-1.5 text-sm font-medium ${
      active
        ? "bg-indigo-600 text-white"
        : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900"
    }`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t.scan.editData}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t.scan.editDataSubtitle}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-slate-200 px-2 py-1 text-xs hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800"
          >
            {t.scan.close}
          </button>
        </div>

        {loading ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.scan.loadingInputs}</p>
        ) : loadError ? (
          <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {loadError}
          </p>
        ) : !inputs ? (
          <p className="py-8 text-center text-sm text-slate-500">{t.scan.noEditableData}</p>
        ) : (
          <>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={tabCls(tab === "labor")} onClick={() => setTab("labor")}>
                {t.scan.tabLaborRate}
              </button>
              <button type="button" className={tabCls(tab === "hc")} onClick={() => setTab("hc")}>
                {t.scan.tabHeadcount}
              </button>
              <button type="button" className={tabCls(tab === "work")} onClick={() => setTab("work")}>
                {t.scan.tabWorkContent}
              </button>
            </div>

            <div className="min-h-[16rem]">
              {tab === "labor" && <LaborRateEditor rows={inputs.laborRows} onChange={setLaborRows} />}
              {tab === "hc" && <HeadcountEditor rows={inputs.hcRows} onChange={setHcRows} />}
              {tab === "work" && <WorkContentEditor automation={inputs.automation} onChange={setAutomation} />}
            </div>

            {saveError && (
              <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
                {saveError}
              </p>
            )}

            <div className="flex justify-end gap-2 border-t border-slate-100 pt-3 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                disabled={saving}
                className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 disabled:opacity-40 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
              >
                {saving ? t.scan.saving : t.scan.saveRecompute}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

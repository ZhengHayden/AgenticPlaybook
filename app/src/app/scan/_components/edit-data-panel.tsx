"use client";

import { useEffect, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { fetchScanInputs, updateScanInputs } from "@/lib/api-client";
import type { FunctionMeta, HcRow, LaborRateRow, ScanInputs, ScanModel } from "@/lib/scan/types";
import { Button } from "@/components/ui/button";
import { SegTabs } from "@/components/ui/seg-tabs";
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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-4xl flex-col gap-4 overflow-y-auto rounded-md border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold">{t.scan.editData}</h2>
            <p className="mt-0.5 text-xs text-slate-500">{t.scan.editDataSubtitle}</p>
          </div>
          <Button variant="ghost" className="px-2 py-1 text-xs" onClick={onClose}>
            {t.scan.close}
          </Button>
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
            <SegTabs<Tab>
              value={tab}
              onChange={setTab}
              tabs={[
                { value: "labor", label: t.scan.tabLaborRate },
                { value: "hc", label: t.scan.tabHeadcount },
                { value: "work", label: t.scan.tabWorkContent },
              ]}
            />


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
              <Button variant="secondary" onClick={onClose} disabled={saving}>
                {t.common.cancel}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? t.scan.saving : t.scan.saveRecompute}
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

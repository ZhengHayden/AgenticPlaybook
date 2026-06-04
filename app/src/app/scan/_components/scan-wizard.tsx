"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { computeScan } from "@/lib/api-client";
import type { ScanModel } from "@/lib/scan/types";
import { INDUSTRY_SECTORS, OTHER_SECTOR } from "@/lib/scan/sectors";

interface ScanWizardProps {
  /** Pre-fills the company name (e.g. a project's client). */
  defaultCompany?: string;
  onClose: () => void;
  /** Called with the freshly computed model after a successful scan. */
  onDone: (model: ScanModel) => void;
}

type Step = "identity" | "upload";

/**
 * Two-step modal for launching an Opportunity Scan: company + industry sector,
 * then the three source-file uploads. Reuses the overlay/tab styling from
 * `add-workflow-modal.tsx`. The single POST computes the full model; the
 * dashboard then reveals the heatmap on demand.
 */
export function ScanWizard({ defaultCompany = "", onClose, onDone }: ScanWizardProps) {
  const { t, locale } = useLocale();
  const [step, setStep] = useState<Step>("identity");
  const [company, setCompany] = useState(defaultCompany);
  const [sectorChoice, setSectorChoice] = useState("");
  const [sectorOther, setSectorOther] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const laborRef = useRef<HTMLInputElement>(null);
  const hcRef = useRef<HTMLInputElement>(null);
  const autoRef = useRef<HTMLInputElement>(null);

  const sector = sectorChoice === OTHER_SECTOR ? sectorOther.trim() : sectorChoice;
  const identityValid = company.trim().length > 0 && sector.length > 0;

  const onSubmit = async () => {
    const laborRate = laborRef.current?.files?.[0];
    const headcount = hcRef.current?.files?.[0];
    const automation = autoRef.current?.files?.[0];
    if (!laborRate || !headcount || !automation) {
      setError(t.scan.empty);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const model = await computeScan({ company: company.trim(), sector, laborRate, headcount, automation });
      onDone(model);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  const labelCls = "block text-xs text-zinc-500";
  const inputCls =
    "mt-1 w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950";
  const fileInputCls =
    "mt-1 block w-full text-xs text-zinc-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-zinc-400 dark:file:bg-indigo-950 dark:file:text-indigo-300";
  const stepDotCls = (active: boolean): string =>
    `h-1.5 w-8 rounded-full ${active ? "bg-indigo-600" : "bg-zinc-200 dark:bg-zinc-700"}`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold">{t.scan.wizardTitle}</h2>
          <div className="flex gap-1.5">
            <span className={stepDotCls(step === "identity")} />
            <span className={stepDotCls(step === "upload")} />
          </div>
        </div>

        {step === "identity" ? (
          <>
            <label className={labelCls}>
              {t.scan.companyName} *
              <input
                autoFocus
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder={locale === "en" ? "e.g. Acme Corp" : "例如:Acme 公司"}
                className={inputCls}
              />
              <span className="mt-1 block text-[11px] text-zinc-400">{t.scan.companyNameHint}</span>
            </label>
            <label className={labelCls}>
              {t.scan.sector} *
              <select value={sectorChoice} onChange={(e) => setSectorChoice(e.target.value)} className={inputCls}>
                <option value="">{t.scan.sectorSelect}</option>
                {INDUSTRY_SECTORS.map((s) => (
                  <option key={s.code} value={s.label}>
                    {s.label}
                  </option>
                ))}
                <option value={OTHER_SECTOR}>{t.scan.sectorOther}</option>
              </select>
            </label>
            {sectorChoice === OTHER_SECTOR && (
              <input
                value={sectorOther}
                onChange={(e) => setSectorOther(e.target.value)}
                placeholder={t.scan.sectorOtherHint}
                className={inputCls}
              />
            )}
          </>
        ) : (
          <div className="space-y-3">
            <label className="block">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.scan.uploadLabor}</span>
              <input ref={laborRef} type="file" accept=".xlsx" className={fileInputCls} />
              <span className="mt-1 block text-[11px] text-zinc-400">{t.scan.uploadLaborHint}</span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.scan.uploadHc}</span>
              <input ref={hcRef} type="file" accept=".xlsx" className={fileInputCls} />
              <span className="mt-1 block text-[11px] text-zinc-400">{t.scan.uploadHcHint}</span>
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">{t.scan.uploadAutomation}</span>
              <input ref={autoRef} type="file" accept=".md,.markdown,.txt" className={fileInputCls} />
              <span className="mt-1 block text-[11px] text-zinc-400">{t.scan.uploadAutomationHint}</span>
            </label>
          </div>
        )}

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          {step === "upload" && (
            <button
              type="button"
              onClick={() => setStep("identity")}
              disabled={busy}
              className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 disabled:opacity-40 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
            >
              {t.common.back}
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            className="rounded-md border border-zinc-200 bg-white px-3 py-1.5 text-sm hover:bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800"
          >
            {t.common.cancel}
          </button>
          {step === "identity" ? (
            <button
              type="button"
              onClick={() => setStep("upload")}
              disabled={!identityValid}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {t.common.next}
            </button>
          ) : (
            <button
              type="button"
              onClick={onSubmit}
              disabled={busy}
              className="rounded-md bg-indigo-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-40"
            >
              {busy ? t.scan.computing : t.scan.launchScan}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

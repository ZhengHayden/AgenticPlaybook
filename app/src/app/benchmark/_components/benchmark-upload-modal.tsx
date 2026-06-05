"use client";

import { useRef, useState } from "react";
import { useLocale } from "@/lib/locale-context";
import { uploadBenchmarkVersion } from "@/lib/api-client";
import type { BenchmarkVersion } from "@/lib/benchmark/types";

interface BenchmarkUploadModalProps {
  companyKey: string;
  region: string;
  sector: string;
  onClose: () => void;
  /** Called with the freshly created version after a successful upload. */
  onDone: (version: BenchmarkVersion) => void;
}

/**
 * Modal to upload a labor `.xlsx` and/or automation `.md` file as a new named
 * company benchmark version. At least one file is required; an omitted half
 * keeps the regional default (resolved server-side).
 */
export function BenchmarkUploadModal({ companyKey, region, sector, onClose, onDone }: BenchmarkUploadModalProps) {
  const { t } = useLocale();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const laborRef = useRef<HTMLInputElement>(null);
  const autoRef = useRef<HTMLInputElement>(null);

  const onSubmit = async () => {
    const laborRate = laborRef.current?.files?.[0];
    const automation = autoRef.current?.files?.[0];
    if (!name.trim() || (!laborRate && !automation)) {
      setError(t.benchmark.uploadHint);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const version = await uploadBenchmarkVersion(companyKey, {
        name: name.trim(),
        region,
        sector,
        laborRate,
        automation,
      });
      onDone(version);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unexpected error");
    } finally {
      setBusy(false);
    }
  };

  const labelCls = "block text-xs text-slate-500";
  const inputCls =
    "mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950";
  const fileInputCls =
    "mt-1 block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-indigo-700 hover:file:bg-indigo-100 dark:text-slate-400 dark:file:bg-indigo-950 dark:file:text-indigo-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-base font-semibold">{t.benchmark.uploadTitle}</h2>

        <label className={labelCls}>
          {t.benchmark.versionName} *
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={t.benchmark.versionNamePlaceholder}
            className={inputCls}
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.benchmark.uploadLaborOptional}
          </span>
          <input ref={laborRef} type="file" accept=".xlsx" className={fileInputCls} />
        </label>
        <label className="block">
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
            {t.benchmark.uploadAutomationOptional}
          </span>
          <input ref={autoRef} type="file" accept=".md,.markdown,.txt" className={fileInputCls} />
        </label>
        <p className="text-[11px] text-slate-400">{t.benchmark.uploadHint}</p>

        {error && (
          <p className="rounded-md border border-red-200 bg-red-50 p-2 text-xs text-red-900 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-200">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-semibold shadow-sm transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {t.common.cancel}
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={busy}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
          >
            {busy ? t.benchmark.saving : t.benchmark.upload}
          </button>
        </div>
      </div>
    </div>
  );
}

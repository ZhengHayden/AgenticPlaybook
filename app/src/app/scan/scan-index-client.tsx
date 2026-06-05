"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ScanManifest, ScanModel } from "@/lib/scan/types";
import { ScanWizard } from "./_components/scan-wizard";

interface ScanIndexClientProps {
  manifests: ScanManifest[];
}

/** The `/scan` landing: a card per scanned company + a "New scan" launcher. */
export function ScanIndexClient({ manifests }: ScanIndexClientProps) {
  const { t } = useLocale();
  const router = useRouter();
  const [wizardOpen, setWizardOpen] = useState(false);

  const onDone = (model: ScanModel) => {
    setWizardOpen(false);
    router.push(`/scan/${model.companyKey}`);
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-xl font-semibold tracking-tight">{t.scan.indexTitle}</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{t.scan.indexSubtitle}</p>
        </div>
        <button
          type="button"
          onClick={() => setWizardOpen(true)}
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {t.scan.newScan}
        </button>
      </header>

      {manifests.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
          {t.scan.noScans}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {manifests.map((m) => (
            <Link
              key={m.companyKey}
              href={`/scan/${m.companyKey}`}
              className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-indigo-300 hover:bg-indigo-50/40 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-900/60 dark:hover:bg-indigo-950/20"
            >
              <h2 className="truncate font-semibold tracking-tight">{m.company}</h2>
              <p className="mt-1 text-xs text-slate-500">{m.sector}</p>
              <p className="mt-3 text-[11px] text-slate-400">
                {t.scan.generatedAt} {new Date(m.generatedAt).toLocaleString()}
              </p>
            </Link>
          ))}
        </div>
      )}

      {wizardOpen && <ScanWizard onClose={() => setWizardOpen(false)} onDone={onDone} />}
    </div>
  );
}

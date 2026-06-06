"use client";

import { useState } from "react";
import { Radar } from "lucide-react";
import { useLocale } from "@/lib/locale-context";
import type { ScanModel } from "@/lib/scan/types";
import { OpportunityDashboard } from "@/app/scan/_components/opportunity-dashboard";
import { ScanWizard } from "@/app/scan/_components/scan-wizard";

interface OpportunityClientProps {
  /** The project's client name — the default company and the scan join key. */
  client: string;
  initialModel: ScanModel | null;
}

/**
 * Project "Opportunity Scan" tab. Resolves the client's scan server-side; if
 * none exists yet, shows an empty state with a launch button that opens the
 * wizard pre-filled with the project's client. The scan is keyed by the client,
 * so every project for the same client shares it.
 */
export function OpportunityClient({ client, initialModel }: OpportunityClientProps) {
  const { t } = useLocale();
  const [model, setModel] = useState<ScanModel | null>(initialModel);
  const [wizardOpen, setWizardOpen] = useState(false);

  if (model) {
    return (
      <section className="space-y-4">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => setWizardOpen(true)}
            className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800"
          >
            {t.scan.recompute}
          </button>
        </div>
        <OpportunityDashboard model={model} showClientLink />
        {wizardOpen && (
          <ScanWizard
            defaultCompany={client}
            onClose={() => setWizardOpen(false)}
            onDone={(next) => {
              setModel(next);
              setWizardOpen(false);
            }}
          />
        )}
      </section>
    );
  }

  return (
    <section className="flex flex-col items-center gap-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-10 text-center dark:border-slate-700 dark:bg-slate-900/40">
      <Radar className="h-8 w-8 text-slate-400" />
      <div className="space-y-1">
        <p className="text-sm font-medium text-slate-700 dark:text-slate-300">{t.scan.noScanYet}</p>
        <p className="text-xs text-slate-500">{t.scan.noScanYetHint}</p>
      </div>
      <button
        type="button"
        onClick={() => setWizardOpen(true)}
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
      >
        {t.scan.startScan}
      </button>
      {wizardOpen && (
        <ScanWizard
          defaultCompany={client}
          onClose={() => setWizardOpen(false)}
          onDone={(next) => {
            setModel(next);
            setWizardOpen(false);
          }}
        />
      )}
    </section>
  );
}

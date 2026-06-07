"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { useLocale } from "@/lib/locale-context";
import type { ScanManifest, ScanModel } from "@/lib/scan/types";
import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Radar, Plus } from "lucide-react";
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
    <section>
      <PageHeader
        icon={<Radar className="h-5 w-5" />}
        title={t.scan.indexTitle}
        subtitle={t.scan.indexSubtitle}
        actions={
          <Button onClick={() => setWizardOpen(true)}>
            <Plus className="h-4 w-4" /> {t.scan.newScan}
          </Button>
        }
      />

      {manifests.length === 0 ? (
        <p className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-8 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40">
          {t.scan.noScans}
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {manifests.map((m) => (
            <Link
              key={m.companyKey}
              href={`/scan/${m.companyKey}`}
              className="card-lift rounded-md border border-slate-200 bg-white p-4 shadow-sm transition-colors hover:border-brand-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-brand-800/60"
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
    </section>
  );
}

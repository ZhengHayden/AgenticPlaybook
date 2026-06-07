import { notFound } from "next/navigation";
import Link from "next/link";
import { readScanModel } from "@/lib/scan/store";
import { OpportunityDashboard } from "../_components/opportunity-dashboard";

export const dynamic = "force-dynamic";

interface ScanCompanyPageProps {
  params: Promise<{ company: string }>;
}

export default async function ScanCompanyPage({ params }: ScanCompanyPageProps) {
  const { company } = await params;
  const model = await readScanModel(company);
  if (!model) notFound();

  return (
    <section className="space-y-4">
      <Link href="/scan" className="text-sm text-slate-500 hover:text-brand-700 dark:hover:text-brand-300">
        ‹ Opportunity Scans
      </Link>
      <OpportunityDashboard model={model} />
    </section>
  );
}

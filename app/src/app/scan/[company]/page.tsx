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
    <div className="mx-auto max-w-7xl space-y-6 px-6 py-8">
      <Link href="/scan" className="text-sm text-slate-500 hover:text-slate-900 dark:hover:text-slate-100">
        ‹ Opportunity Scans
      </Link>
      <OpportunityDashboard model={model} />
    </div>
  );
}

import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { readScanModel, scanCompanyKey } from "@/lib/scan/store";
import { OpportunityClient } from "./opportunity-client";

export const dynamic = "force-dynamic";

interface OpportunityPageProps {
  params: Promise<{ id: string }>;
}

export default async function OpportunityPage({ params }: OpportunityPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const model = await readScanModel(scanCompanyKey(project.client));
  return <OpportunityClient client={project.client} initialModel={model} />;
}

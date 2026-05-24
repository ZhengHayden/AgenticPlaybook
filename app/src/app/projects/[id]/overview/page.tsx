import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { OverviewClient } from "./overview-client";

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <OverviewClient project={project} />;
}

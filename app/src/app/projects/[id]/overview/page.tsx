import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { OverviewClient } from "./overview-client";

interface OverviewPageProps {
  params: Promise<{ id: string }>;
}

export default async function OverviewPage({ params }: OverviewPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <OverviewClient project={project} />;
}

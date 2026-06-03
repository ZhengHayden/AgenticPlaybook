import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { FunnelBoard } from "./funnel-board";

interface FunnelPageProps {
  params: Promise<{ id: string }>;
}

export default async function FunnelPage({ params }: FunnelPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <FunnelBoard projectId={project.id} candidates={project.candidates} />;
}

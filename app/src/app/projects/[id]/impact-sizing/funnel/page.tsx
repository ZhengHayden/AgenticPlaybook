import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { FunnelBoard } from "./funnel-board";

interface FunnelPageProps {
  params: Promise<{ id: string }>;
}

export default async function FunnelPage({ params }: FunnelPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <FunnelBoard candidates={project.candidates} />;
}

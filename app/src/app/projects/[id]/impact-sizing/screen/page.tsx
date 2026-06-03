import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { ScreenMatrix } from "./screen-matrix";

interface ScreenPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScreenPage({ params }: ScreenPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <ScreenMatrix projectId={project.id} candidates={project.candidates} />;
}

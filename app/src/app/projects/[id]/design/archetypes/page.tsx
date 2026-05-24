import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { ArchetypeAssigner } from "./archetype-assigner";

interface ArchetypesPageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchetypesPage({ params }: ArchetypesPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ArchetypeAssigner steps={project.workflowSteps} />;
}

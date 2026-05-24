import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { InteractionAssigner } from "./interaction-assigner";

interface InteractionsPageProps {
  params: Promise<{ id: string }>;
}

export default async function InteractionsPage({ params }: InteractionsPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <InteractionAssigner steps={project.workflowSteps} />;
}

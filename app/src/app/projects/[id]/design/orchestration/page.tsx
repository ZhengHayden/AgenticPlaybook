import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { OrchestrationPicker } from "./orchestration-picker";

interface OrchestrationPageProps {
  params: Promise<{ id: string }>;
}

export default async function OrchestrationPage({ params }: OrchestrationPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <OrchestrationPicker steps={project.workflowSteps} initialPattern={project.a2aPattern} />;
}

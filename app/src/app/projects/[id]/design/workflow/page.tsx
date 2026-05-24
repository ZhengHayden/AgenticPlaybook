import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { WorkflowMapper } from "./workflow-mapper";

interface WorkflowPageProps {
  params: Promise<{ id: string }>;
}

export default async function WorkflowPage({ params }: WorkflowPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <WorkflowMapper steps={project.workflowSteps} />;
}

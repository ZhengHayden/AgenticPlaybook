import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { HitlEditor } from "./hitl-editor";

interface HitlPageProps {
  params: Promise<{ id: string }>;
}

export default async function HitlPage({ params }: HitlPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <HitlEditor steps={project.workflowSteps} />;
}

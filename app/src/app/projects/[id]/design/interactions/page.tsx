import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { resolveWorkflow } from "../_components/resolve-workflow";
import { NoWorkflow } from "../_components/no-workflow";
import { InteractionAssigner } from "./interaction-assigner";

interface InteractionsPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ w?: string }>;
}

export default async function InteractionsPage({ params, searchParams }: InteractionsPageProps) {
  const { id } = await params;
  const { w } = await searchParams;
  const project = await getProject(id);
  if (!project) notFound();
  const workflow = resolveWorkflow(project, w);
  if (!workflow) return <NoWorkflow />;
  return <InteractionAssigner projectId={project.id} workflows={project.workflows} workflow={workflow} />;
}

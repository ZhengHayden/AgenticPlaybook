import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { ArchitectureDoc } from "./architecture-doc";

interface ArchitecturePageProps {
  params: Promise<{ id: string }>;
}

export default async function ArchitecturePage({ params }: ArchitecturePageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ArchitectureDoc project={project} />;
}

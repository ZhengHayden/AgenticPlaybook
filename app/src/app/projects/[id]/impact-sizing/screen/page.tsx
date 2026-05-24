import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { ScreenMatrix } from "./screen-matrix";

interface ScreenPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScreenPage({ params }: ScreenPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <ScreenMatrix candidates={project.candidates} />;
}

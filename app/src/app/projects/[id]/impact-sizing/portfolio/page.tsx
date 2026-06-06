import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { PortfolioView } from "./portfolio-view";

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return (
    <PortfolioView
      projectId={project.id}
      scoringMode={project.scoringMode ?? "workflow"}
      candidates={project.candidates}
    />
  );
}

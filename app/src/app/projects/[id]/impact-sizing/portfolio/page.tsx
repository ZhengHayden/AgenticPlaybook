import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { PortfolioView } from "./portfolio-view";

interface PortfolioPageProps {
  params: Promise<{ id: string }>;
}

export default async function PortfolioPage({ params }: PortfolioPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <PortfolioView candidates={project.candidates} />;
}

import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { CandidatesTable } from "./candidates-table";

interface CandidatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatesPage({ params }: CandidatesPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return <CandidatesTable projectId={project.id} candidates={project.candidates} />;
}

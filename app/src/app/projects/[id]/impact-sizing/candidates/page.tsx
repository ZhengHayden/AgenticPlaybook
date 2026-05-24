import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { CandidatesTable } from "./candidates-table";

interface CandidatesPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidatesPage({ params }: CandidatesPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();
  return <CandidatesTable candidates={project.candidates} />;
}

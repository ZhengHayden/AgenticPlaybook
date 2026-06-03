import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { screenCriteria, SCREEN_PASS_THRESHOLD } from "@/content/binary-screen";
import { ScoringEditor } from "./scoring-editor";

interface ScoringPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoringPage({ params }: ScoringPageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  // Eligible = candidates that passed the Readiness Check (binary screen ≥ threshold).
  const eligible = project.candidates.filter(
    (c) => screenCriteria.reduce((s, cr) => s + (c.screen[cr.id].yes ? 1 : 0), 0) >= SCREEN_PASS_THRESHOLD,
  );

  return (
    <ScoringEditor
      projectId={project.id}
      candidates={eligible}
      allCandidates={project.candidates}
    />
  );
}

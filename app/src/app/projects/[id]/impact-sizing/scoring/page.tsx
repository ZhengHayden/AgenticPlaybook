import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { quadrantFromScores, odsIndicators, orsIndicators } from "@/content/funnel-rubric";
import { ScoringEditor } from "./scoring-editor";

interface ScoringPageProps {
  params: Promise<{ id: string }>;
}

export default async function ScoringPage({ params }: ScoringPageProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const eligible = project.candidates.filter((c) => {
    const ods = odsIndicators.reduce((s, i) => s + c.ods[i.id] * i.weight, 0);
    const ors = orsIndicators.reduce((s, i) => s + c.ors[i.id] * i.weight, 0);
    const q = quadrantFromScores(ods, ors);
    return q === "quickWin" || q === "sponsorAlign" || q === "investProve";
  });

  return <ScoringEditor candidates={eligible} />;
}

import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { impactSizingKpis } from "@/content/impact-sizing-kpis";
import { ImpactSizingShell } from "./_components/impact-sizing-shell";

interface ImpactSizingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ImpactSizingLayout({ children, params }: ImpactSizingLayoutProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const kpis = impactSizingKpis(project.candidates);

  return (
    <ImpactSizingShell
      projectId={project.id}
      variant={project.p1Variant}
      scoringMode={project.scoringMode ?? "workflow"}
      kpis={kpis}
      hasScreen={project.p1Variant === "C"}
    >
      {children}
    </ImpactSizingShell>
  );
}

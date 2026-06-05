import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { PhaseSubNav } from "../_components/phase-sub-nav";
import { ScoringModeSwitch } from "./_components/scoring-mode-switch";

interface ImpactSizingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ImpactSizingLayout({ children, params }: ImpactSizingLayoutProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  const base = `/projects/${project.id}/impact-sizing`;
  const tabs = [
    { href: `${base}/candidates`, key: "candidates" },
    ...(project.p1Variant === "C" ? [{ href: `${base}/screen`, key: "screen" }] : []),
    { href: `${base}/scoring`, key: "scoring" },
    { href: `${base}/portfolio`, key: "portfolio" },
    { href: `${base}/gate`, key: "gate" },
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PhaseSubNav phase="impactSizing" variant={project.p1Variant} tabs={tabs} />
        <ScoringModeSwitch projectId={project.id} mode={project.scoringMode ?? "workflow"} />
      </div>
      <div className="mt-4">{children}</div>
    </div>
  );
}

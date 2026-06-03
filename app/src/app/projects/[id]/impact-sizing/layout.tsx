import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { PhaseSubNav } from "../_components/phase-sub-nav";

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
    { href: `${base}/funnel`, key: "funnel" },
    { href: `${base}/portfolio`, key: "portfolio" },
    { href: `${base}/gate`, key: "gate" },
  ];

  return (
    <div>
      <PhaseSubNav phase="impactSizing" variant={project.p1Variant} tabs={tabs} />
      <div className="mt-4">{children}</div>
    </div>
  );
}

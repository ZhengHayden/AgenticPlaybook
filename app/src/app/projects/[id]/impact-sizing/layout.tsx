import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { PhaseSubNav } from "../_components/phase-sub-nav";

interface ImpactSizingLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function ImpactSizingLayout({ children, params }: ImpactSizingLayoutProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const base = `/projects/${project.id}/impact-sizing`;
  const tabs = [
    { href: `${base}/candidates`, key: "candidates" },
    ...(project.p1Variant === "C" ? [{ href: `${base}/screen`, key: "screen" }] : []),
    { href: `${base}/funnel`, key: "funnel" },
    { href: `${base}/scoring`, key: "scoring" },
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

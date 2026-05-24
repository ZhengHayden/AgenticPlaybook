import { notFound } from "next/navigation";
import { getProject } from "@/content/sample-data";
import { PhaseSubNav } from "../_components/phase-sub-nav";

interface DesignLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function DesignLayout({ children, params }: DesignLayoutProps) {
  const { id } = await params;
  const project = getProject(id);
  if (!project) notFound();

  const base = `/projects/${project.id}/design`;
  const tabs = [
    { href: `${base}/workflow`, key: "workflow" },
    { href: `${base}/archetypes`, key: "archetypes" },
    { href: `${base}/interactions`, key: "interactions" },
    { href: `${base}/orchestration`, key: "orchestration" },
    { href: `${base}/hitl`, key: "hitl" },
    { href: `${base}/architecture`, key: "architecture" },
    { href: `${base}/gate`, key: "gate" },
  ];

  return (
    <div>
      <PhaseSubNav phase="design" variant={project.p2Variant} tabs={tabs} />
      <div className="mt-4">{children}</div>
    </div>
  );
}

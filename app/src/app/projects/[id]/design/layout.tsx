import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { WorkflowBar } from "./_components/workflow-bar";

interface DesignLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function DesignLayout({ children, params }: DesignLayoutProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div>
      <WorkflowBar
        projectId={project.id}
        workflows={project.workflows}
        candidates={project.candidates}
        variant={project.p2Variant}
      />
      <div className="mt-4">{children}</div>
    </div>
  );
}

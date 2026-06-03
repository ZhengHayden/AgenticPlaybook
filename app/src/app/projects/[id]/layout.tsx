import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/db/projects-repo";
import { ProjectTabs } from "./_components/project-tabs";

interface ProjectLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

// Project data is read from SQLite at request time — never prerender at build.
export const dynamic = "force-dynamic";

export default async function ProjectLayout({ children, params }: ProjectLayoutProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <section>
      <div className="mb-4 flex items-baseline gap-2 text-sm text-zinc-500">
        <Link href="/projects" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Projects
        </Link>
        <span>›</span>
        <span className="text-zinc-900 dark:text-zinc-100">{project.name}</span>
      </div>
      <ProjectTabs projectId={project.id} currentPhase={project.currentPhase} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

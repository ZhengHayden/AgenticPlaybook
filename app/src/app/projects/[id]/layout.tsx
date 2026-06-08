import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getProject } from "@/db/projects-repo";
import { Pill } from "@/components/ui/pill";
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
      <div className="mb-4 flex items-center gap-2 text-xs text-ink-muted">
        <Link href="/projects" className="hover:text-foreground">
          Projects
        </Link>
        <ChevronRight className="h-3 w-3 text-ink-faint" aria-hidden />
        <span className="font-medium text-foreground">{project.name}</span>
        {project.domain && (
          <Pill tone="info" className="ml-1">
            {project.domain}
          </Pill>
        )}
      </div>
      <ProjectTabs projectId={project.id} currentPhase={project.currentPhase} />
      <div className="mt-6">{children}</div>
    </section>
  );
}

import { listProjects } from "@/db/projects-repo";
import { ProjectListClient } from "./_components/project-list-client";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await listProjects();
  return <ProjectListClient projects={projects} />;
}

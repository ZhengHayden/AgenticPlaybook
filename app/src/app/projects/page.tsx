import { sampleProjects } from "@/content/sample-data";
import { ProjectListClient } from "./_components/project-list-client";

export default function ProjectsPage() {
  return <ProjectListClient projects={sampleProjects} />;
}

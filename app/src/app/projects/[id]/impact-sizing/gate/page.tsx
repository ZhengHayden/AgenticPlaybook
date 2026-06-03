import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { EditableGate } from "@/components/editable-gate";

const P1_DEFAULTS: ReadonlyArray<string> = [
  "At least one Q1 candidate with Priority ≥ 6.0",
  "Top-3 ranking variance documented",
  "Risk classifications approved by sponsor",
  "Deliverable PDF generated and timestamped",
  "Top candidate selected for Design phase",
];

interface GatePageProps {
  params: Promise<{ id: string }>;
}

export default async function GatePage({ params }: GatePageProps) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();
  return (
    <EditableGate
      title="Phase 1 → Phase 2 Gate"
      initialCriteria={project.p1Gate}
      defaults={P1_DEFAULTS}
    />
  );
}

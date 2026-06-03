import { notFound } from "next/navigation";
import { getProject } from "@/db/projects-repo";
import { EditableGate } from "@/components/editable-gate";

const P2_DEFAULTS: ReadonlyArray<string> = [
  "Every workflow step has exactly one archetype assigned",
  "Every step has exactly one interaction mode assigned",
  "A2A pattern selected with dependency rationale",
  "Acceptance criteria written in Given/When/Then for each agent",
  "HITL checkpoints have SLA + escalation path",
  "Architecture passes technical review checklist (7 items)",
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
      title="Phase 2 → MVP Gate"
      initialCriteria={project.p2Gate}
      defaults={P2_DEFAULTS}
    />
  );
}

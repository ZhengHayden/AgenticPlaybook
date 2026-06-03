import type { NextRequest } from "next/server";
import { getProject } from "@/db/projects-repo";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { runUnderstandingAgent, UnderstandingAgentError } from "@/lib/understanding-agent";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/:id/understand — runs the Workflow Understanding Agent
 * over a candidate's uploaded SOP and returns grounded readiness suggestions.
 * Body: { candidateId: string }. The candidate must already have a `sopFile`.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const project = await getProject(id);
    if (!project) return fail("Project not found", 404);

    const body = (await request.json()) as { candidateId?: unknown };
    if (typeof body.candidateId !== "string") {
      return fail("Missing 'candidateId'", 400);
    }

    const candidate = project.candidates.find((c) => c.id === body.candidateId);
    if (!candidate) return fail("Candidate not found", 404);
    if (!candidate.sopFile) return fail("This workflow has no uploaded SOP to analyze", 400);

    const result = await runUnderstandingAgent(id, candidate);
    return ok(result);
  } catch (error) {
    if (error instanceof UnderstandingAgentError) {
      return fail(error.message, 400);
    }
    console.error("[POST /api/projects/:id/understand]", error);
    return fail(errorMessage(error), 500);
  }
}

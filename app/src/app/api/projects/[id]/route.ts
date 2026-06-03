import type { NextRequest } from "next/server";
import { getProject, updateProject, deleteProject } from "@/db/projects-repo";
import { projectPatchSchema } from "@/db/validation";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** GET /api/projects/:id */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const project = await getProject(id);
    if (!project) return fail("Project not found", 404);
    return ok(project);
  } catch (error) {
    console.error("[GET /api/projects/:id]", error);
    return fail(errorMessage(error), 500);
  }
}

/** PATCH /api/projects/:id — partial update; each editor sends the field(s) it owns. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = projectPatchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
  }

  try {
    const project = await updateProject(id, parsed.data);
    if (!project) return fail("Project not found", 404);
    return ok(project);
  } catch (error) {
    console.error("[PATCH /api/projects/:id]", error);
    return fail(errorMessage(error), 500);
  }
}

/** DELETE /api/projects/:id */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await deleteProject(id);
    if (!deleted) return fail("Project not found", 404);
    return ok({ id });
  } catch (error) {
    console.error("[DELETE /api/projects/:id]", error);
    return fail(errorMessage(error), 500);
  }
}

import type { NextRequest } from "next/server";
import { listProjects, createProject } from "@/db/projects-repo";
import { createProjectSchema } from "@/db/validation";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/** GET /api/projects?status=active|archived — list projects. */
export async function GET(request: NextRequest) {
  try {
    const statusParam = request.nextUrl.searchParams.get("status");
    const status =
      statusParam === "active" || statusParam === "archived" ? statusParam : undefined;
    const projects = await listProjects(status ? { status } : undefined);
    return ok(projects);
  } catch (error) {
    console.error("[GET /api/projects]", error);
    return fail(errorMessage(error), 500);
  }
}

/** POST /api/projects — create a project from the wizard fields. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createProjectSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => i.message).join("; "), 400);
  }

  try {
    const project = await createProject(parsed.data);
    return ok(project, 201);
  } catch (error) {
    console.error("[POST /api/projects]", error);
    return fail(errorMessage(error), 500);
  }
}

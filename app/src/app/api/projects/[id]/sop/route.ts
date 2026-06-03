import type { NextRequest } from "next/server";
import { getProject } from "@/db/projects-repo";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { saveSop, SopValidationError } from "@/lib/sop-storage";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/projects/:id/sop — multipart upload of a single SOP PDF.
 * Returns a SopFileRef; the client merges it into the candidate and PATCHes.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  try {
    const project = await getProject(id);
    if (!project) return fail("Project not found", 404);

    const form = await request.formData();
    const file = form.get("file");
    if (!(file instanceof File)) {
      return fail("Missing 'file' in form data", 400);
    }

    const ref = await saveSop(id, file);
    return ok(ref, 201);
  } catch (error) {
    if (error instanceof SopValidationError) {
      return fail(error.message, 400);
    }
    console.error("[POST /api/projects/:id/sop]", error);
    return fail(errorMessage(error), 500);
  }
}

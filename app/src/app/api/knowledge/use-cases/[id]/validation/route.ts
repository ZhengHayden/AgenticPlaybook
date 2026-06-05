import type { NextRequest } from "next/server";
import { setValidation } from "@/db/knowledge-repo";
import { validationPatchSchema } from "@/db/knowledge-validation";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** PATCH /api/knowledge/use-cases/:id/validation — set status + note. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = validationPatchSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
  }

  try {
    const useCase = await setValidation(id, parsed.data);
    if (!useCase) return fail("Use case not found", 404);
    return ok(useCase);
  } catch (error) {
    console.error("[PATCH /api/knowledge/use-cases/:id/validation]", error);
    return fail(errorMessage(error), 500);
  }
}

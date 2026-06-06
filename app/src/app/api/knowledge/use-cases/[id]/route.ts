import type { NextRequest } from "next/server";
import { updateUseCase, deleteUseCase } from "@/db/knowledge-repo";
import { updateUseCaseSchema } from "@/db/knowledge-validation";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

/** PATCH /api/knowledge/use-cases/:id — edit a use case's editable fields. */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = updateUseCaseSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
  }

  try {
    const useCase = await updateUseCase(id, parsed.data);
    if (!useCase) return fail("Use case not found", 404);
    return ok(useCase);
  } catch (error) {
    console.error("[PATCH /api/knowledge/use-cases/:id]", error);
    return fail(errorMessage(error), 500);
  }
}

/** DELETE /api/knowledge/use-cases/:id */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    const deleted = await deleteUseCase(id);
    if (!deleted) return fail("Use case not found", 404);
    return ok({ id });
  } catch (error) {
    console.error("[DELETE /api/knowledge/use-cases/:id]", error);
    return fail(errorMessage(error), 500);
  }
}

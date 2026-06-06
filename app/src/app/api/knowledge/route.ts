import type { NextRequest } from "next/server";
import { getLibrary, createUseCase } from "@/db/knowledge-repo";
import { createUseCaseSchema } from "@/db/knowledge-validation";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

/** GET /api/knowledge — the full Agentic Use Case Library. */
export async function GET() {
  try {
    const library = await getLibrary();
    return ok(library);
  } catch (error) {
    console.error("[GET /api/knowledge]", error);
    return fail(errorMessage(error), 500);
  }
}

/** POST /api/knowledge — create a use case under an existing workflow. */
export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  const parsed = createUseCaseSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
  }

  try {
    const useCase = await createUseCase(parsed.data);
    return ok(useCase, 201);
  } catch (error) {
    console.error("[POST /api/knowledge]", error);
    return fail(errorMessage(error), 500);
  }
}

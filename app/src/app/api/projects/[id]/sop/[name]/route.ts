import type { NextRequest } from "next/server";
import { fail, errorMessage } from "@/lib/api-response";
import { readSop, SopValidationError } from "@/lib/sop-storage";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string; name: string }>;
}

/**
 * GET /api/projects/:id/sop/:name — streams a stored SOP PDF back to the client.
 * The storage name is validated against path traversal inside `readSop`.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  const { id, name } = await params;

  try {
    const buffer = await readSop(id, name);
    const body = new Uint8Array(buffer);
    return new Response(body, {
      status: 200,
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `inline; filename="${name}"`,
        "cache-control": "private, no-store",
      },
    });
  } catch (error) {
    if (error instanceof SopValidationError) {
      return fail(error.message, 400);
    }
    if (error instanceof Error && "code" in error && (error as NodeJS.ErrnoException).code === "ENOENT") {
      return fail("File not found", 404);
    }
    console.error("[GET /api/projects/:id/sop/:name]", error);
    return fail(errorMessage(error), 500);
  }
}

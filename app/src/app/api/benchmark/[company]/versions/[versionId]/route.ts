import type { NextRequest } from "next/server";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { deleteVersion, readVersion } from "@/lib/benchmark/store";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ company: string; versionId: string }>;
}

/** GET /api/benchmark/:company/versions/:versionId — one full version, or null. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { company, versionId } = await params;
    return ok(await readVersion(company, versionId));
  } catch (error) {
    console.error("[GET /api/benchmark/:company/versions/:versionId]", error);
    return fail(errorMessage(error), 500);
  }
}

/** DELETE /api/benchmark/:company/versions/:versionId — remove a saved version. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { company, versionId } = await params;
    const removed = await deleteVersion(company, versionId);
    if (!removed) return fail("Version not found", 404);
    return ok({ versionId });
  } catch (error) {
    console.error("[DELETE /api/benchmark/:company/versions/:versionId]", error);
    return fail(errorMessage(error), 500);
  }
}

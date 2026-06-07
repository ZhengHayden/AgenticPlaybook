import type { NextRequest } from "next/server";
import {
  updateArtifact,
  replaceArtifactFile,
  deleteArtifact,
} from "@/db/knowledge-artifacts-repo";
import { updateArtifactSchema } from "@/db/knowledge-artifacts-validation";
import { MAX_ARTIFACT_BYTES, isAllowedArtifactFile } from "@/content/knowledge-artifacts";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ aid: string }>;
}

function zodMessage(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues.map((i) => `${i.path.map(String).join(".")}: ${i.message}`).join("; ");
}

/** PATCH — metadata/status update (JSON) or file replace (multipart). */
export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const { aid } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    // Treat any non-JSON body as multipart (matches Task 7 pattern).
    const isJson = contentType.includes("application/json");
    if (!isJson) {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return fail("Invalid form data", 400);
      }
      const file = form.get("file");
      if (!(file instanceof File)) return fail("file is required", 400);
      if (file.size > MAX_ARTIFACT_BYTES) return fail("File exceeds 25 MB limit", 400);
      if (!isAllowedArtifactFile(file.type, file.name)) {
        return fail(`Unsupported file type: ${file.type || file.name}`, 400);
      }
      const bytes = Buffer.from(await file.arrayBuffer());
      const replaced = await replaceArtifactFile(
        aid,
        { fileName: file.name, mimeType: file.type, bytes },
        (form.get("changeNote") as string) || undefined,
        (form.get("versionLabel") as string) || undefined,
      );
      if (!replaced) return fail("File artifact not found", 404);
      return ok(replaced);
    }

    const body = await request.json().catch(() => null);
    if (body === null) return fail("Invalid JSON body", 400);
    const parsed = updateArtifactSchema.safeParse(body);
    if (!parsed.success) return fail(zodMessage(parsed.error), 400);
    const updated = await updateArtifact(aid, parsed.data);
    if (!updated) return fail("Artifact not found", 404);
    return ok(updated);
  } catch (error) {
    console.error("[PATCH artifact]", error);
    return fail(errorMessage(error), 500);
  }
}

/** DELETE — remove an artifact and its bytes. */
export async function DELETE(_request: NextRequest, { params }: RouteContext) {
  try {
    const { aid } = await params;
    const deleted = await deleteArtifact(aid);
    if (!deleted) return fail("Artifact not found", 404);
    return ok({ id: aid });
  } catch (error) {
    console.error("[DELETE artifact]", error);
    return fail(errorMessage(error), 500);
  }
}

import type { NextRequest } from "next/server";
import {
  listArtifacts,
  createLinkArtifact,
  createFileArtifact,
} from "@/db/knowledge-artifacts-repo";
import {
  createLinkArtifactSchema,
  createFileMetaSchema,
} from "@/db/knowledge-artifacts-validation";
import { MAX_ARTIFACT_BYTES, isAllowedArtifactFile } from "@/content/knowledge-artifacts";
import { ok, fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ id: string }>;
}

function zodMessage(error: { issues: { path: PropertyKey[]; message: string }[] }): string {
  return error.issues.map((i) => `${i.path.map(String).join(".")}: ${i.message}`).join("; ");
}

/** GET — list artifacts for a use case. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { id } = await params;
    return ok(await listArtifacts(id));
  } catch (error) {
    console.error("[GET artifacts]", error);
    return fail(errorMessage(error), 500);
  }
}

/** POST — create a link (JSON) or file (multipart) artifact. */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { id } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    // jsdom (test env) sets content-type to "text/plain" when Request is built
    // from a FormData instance, so we treat any non-JSON body as multipart.
    const isJson = contentType.includes("application/json");
    if (!isJson) {
      let form: FormData;
      try {
        form = await request.formData();
      } catch {
        return fail("Invalid form data", 400);
      }
      const meta = createFileMetaSchema.safeParse({
        title: form.get("title"),
        type: form.get("type"),
        status: form.get("status"),
        owner: form.get("owner"),
        versionLabel: form.get("versionLabel") ?? undefined,
        changeNote: form.get("changeNote") ?? undefined,
      });
      if (!meta.success) return fail(zodMessage(meta.error), 400);

      const file = form.get("file");
      if (!(file instanceof File)) return fail("file is required", 400);
      if (file.size > MAX_ARTIFACT_BYTES) return fail("File exceeds 25 MB limit", 400);
      if (!isAllowedArtifactFile(file.type, file.name)) {
        return fail(`Unsupported file type: ${file.type || file.name}`, 400);
      }

      const bytes = Buffer.from(await file.arrayBuffer());
      const created = await createFileArtifact(id, meta.data, {
        fileName: file.name, mimeType: file.type, bytes,
      });
      return ok(created, 201);
    }

    // JSON branch — link artifact
    const body = await request.json().catch(() => null);
    if (body === null) return fail("Invalid JSON body", 400);
    const parsed = createLinkArtifactSchema.safeParse(body);
    if (!parsed.success) return fail(zodMessage(parsed.error), 400);
    return ok(await createLinkArtifact(id, parsed.data), 201);
  } catch (error) {
    console.error("[POST artifacts]", error);
    return fail(errorMessage(error), 500);
  }
}

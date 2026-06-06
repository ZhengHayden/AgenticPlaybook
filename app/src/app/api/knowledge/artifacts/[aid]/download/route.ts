import type { NextRequest } from "next/server";
import { getArtifact } from "@/db/knowledge-artifacts-repo";
import { readArtifactFile } from "@/lib/artifact-storage";
import { fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ aid: string }>;
}

/** GET — stream the current file bytes of a file artifact. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { aid } = await params;
    const artifact = await getArtifact(aid);
    if (!artifact || artifact.kind !== "file" || !artifact.file) {
      return fail("File artifact not found", 404);
    }
    const bytes = await readArtifactFile(artifact.file.storagePath);
    return new Response(new Uint8Array(bytes), {
      headers: {
        "Content-Type": artifact.file.mimeType,
        "Content-Disposition": `attachment; filename="${encodeURIComponent(artifact.file.fileName)}"`,
      },
    });
  } catch (error) {
    console.error("[GET artifact download]", error);
    return fail(errorMessage(error), 500);
  }
}

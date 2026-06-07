import type { NextRequest } from "next/server";
import { getArtifact } from "@/db/knowledge-artifacts-repo";
import { readArtifactFile } from "@/lib/artifact-storage";
import { fail, errorMessage } from "@/lib/api-response";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ aid: string }>;
}

const HTML_MIME_TYPES = new Set(["text/html", "application/xhtml+xml"]);

/**
 * GET — stream the current file bytes of a file artifact.
 *
 * Defaults to `Content-Disposition: attachment` (download). Pass
 * `?disposition=inline` to serve the bytes for in-browser preview (iframe /
 * native PDF viewer). Inline responses are sent with `X-Content-Type-Options:
 * nosniff`, and inline HTML additionally with `Content-Security-Policy: sandbox`
 * so that even a direct hit on the URL cannot execute scripts in this origin.
 */
export async function GET(request: NextRequest, { params }: RouteContext) {
  try {
    const { aid } = await params;
    const artifact = await getArtifact(aid);
    if (!artifact || artifact.kind !== "file" || !artifact.file) {
      return fail("File artifact not found", 404);
    }

    const inline = new URL(request.url).searchParams.get("disposition") === "inline";
    const fileName = encodeURIComponent(artifact.file.fileName);
    const headers: Record<string, string> = {
      "Content-Type": artifact.file.mimeType,
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${fileName}"`,
    };
    if (inline) {
      headers["X-Content-Type-Options"] = "nosniff";
      if (HTML_MIME_TYPES.has(artifact.file.mimeType.toLowerCase())) {
        headers["Content-Security-Policy"] = "sandbox";
      }
    }

    const bytes = await readArtifactFile(artifact.file.storagePath);
    return new Response(new Uint8Array(bytes), { headers });
  } catch (error) {
    console.error("[GET artifact download]", error);
    return fail(errorMessage(error), 500);
  }
}

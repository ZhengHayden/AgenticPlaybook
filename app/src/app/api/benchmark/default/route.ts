import type { NextRequest } from "next/server";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { getDefaultBenchmark } from "@/lib/benchmark/defaults";

export const dynamic = "force-dynamic";

/**
 * GET /api/benchmark/default?region=&sector= — the shipped read-only benchmark
 * snapshot for a (region, sector) pair, resolved via the fallback chain. Always
 * returns a non-empty snapshot.
 */
export async function GET(request: NextRequest) {
  try {
    const region = request.nextUrl.searchParams.get("region");
    const sector = request.nextUrl.searchParams.get("sector");
    if (!region || !sector) {
      return fail("Both 'region' and 'sector' query params are required", 400);
    }
    return ok(getDefaultBenchmark(region, sector));
  } catch (error) {
    console.error("[GET /api/benchmark/default]", error);
    return fail(errorMessage(error), 500);
  }
}

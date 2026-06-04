import type { NextRequest } from "next/server";
import { z } from "zod";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { parseLaborRate, parseHeadcount, ScanParseError } from "@/lib/scan/parse-xlsx";
import { parseAutomationMd } from "@/lib/scan/parse-automation-md";
import { buildScanInputs, parseScanInputs, recomputeFromInputs } from "@/lib/scan/inputs";
import {
  readScanInputs,
  readScanManifest,
  readUpload,
  writeScanInputs,
  writeScanModel,
} from "@/lib/scan/store";
import type { ScanInputs } from "@/lib/scan/types";

export const dynamic = "force-dynamic";

interface RouteContext {
  params: Promise<{ company: string }>;
}

/**
 * Re-derive the editable input layer from a company's stored raw uploads, for
 * scans created before `inputs.json` existed. Returns null when the company has
 * no manifest or is missing any of the three source files.
 */
async function backfillFromUploads(companyKey: string): Promise<ScanInputs | null> {
  const [manifest, laborBuf, hcBuf, autoBuf] = await Promise.all([
    readScanManifest(companyKey),
    readUpload(companyKey, "labor_rate"),
    readUpload(companyKey, "hc"),
    readUpload(companyKey, "automation"),
  ]);
  if (!manifest || !laborBuf || !hcBuf || !autoBuf) return null;

  const laborRows = parseLaborRate(laborBuf);
  const hcRows = parseHeadcount(hcBuf);
  const automation = parseAutomationMd(autoBuf.toString("utf8"));
  return buildScanInputs(laborRows, hcRows, automation, {
    company: manifest.company,
    companyKey: manifest.companyKey,
    sector: manifest.sector,
    region: manifest.region ?? "Unspecified",
  });
}

/**
 * GET /api/scan/:company/inputs — the editable input layer for a company. Falls
 * back to re-parsing the stored uploads (and persisting the rebuild) so scans
 * created before this layer existed stay editable. Returns null when neither an
 * inputs file nor a complete set of uploads is present.
 */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { company } = await params;

    const existing = await readScanInputs(company);
    if (existing) return ok(existing);

    const rebuilt = await backfillFromUploads(company);
    if (!rebuilt) return ok(null);

    await writeScanInputs(company, rebuilt);
    return ok(rebuilt);
  } catch (error) {
    if (error instanceof ScanParseError) return fail(error.message, 400);
    console.error("[GET /api/scan/:company/inputs]", error);
    return fail(errorMessage(error), 500);
  }
}

/**
 * PUT /api/scan/:company/inputs — validate an edited input set, recompute the
 * model, persist both, and return the fresh {@link ScanModel}.
 */
export async function PUT(request: NextRequest, { params }: RouteContext) {
  const { company } = await params;

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Invalid JSON body", 400);
  }

  let inputs: ScanInputs;
  try {
    inputs = parseScanInputs(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return fail(error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
    }
    throw error;
  }

  if (inputs.companyKey !== company) {
    return fail("Company key in body does not match the URL", 400);
  }

  try {
    const model = recomputeFromInputs(inputs, new Date().toISOString());
    await Promise.all([writeScanModel(company, model), writeScanInputs(company, inputs)]);
    return ok(model);
  } catch (error) {
    console.error("[PUT /api/scan/:company/inputs]", error);
    return fail(errorMessage(error), 500);
  }
}

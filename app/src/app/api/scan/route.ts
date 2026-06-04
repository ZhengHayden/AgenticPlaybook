import type { NextRequest } from "next/server";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { parseLaborRate, parseHeadcount, ScanParseError } from "@/lib/scan/parse-xlsx";
import { parseAutomationMd } from "@/lib/scan/parse-automation-md";
import { computeScanModel } from "@/lib/scan/compute-matrix";
import { buildScanInputs } from "@/lib/scan/inputs";
import { getDefaultBenchmark } from "@/lib/benchmark/defaults";
import {
  listManifests,
  readScanModel,
  scanCompanyKey,
  writeScanInputs,
  writeScanModel,
  writeUpload,
} from "@/lib/scan/store";
import type { UploadSlot } from "@/lib/scan/store";
import type { FunctionMeta, LaborRateRow } from "@/lib/scan/types";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — the HC workbook is the largest input (~250 KB today).
const MAX_TEXT = 200; // company/sector free-text cap.

interface FileSpec {
  slot: UploadSlot;
  field: string;
  label: string;
  extensions: string[];
}

const FILE_SPECS: FileSpec[] = [
  { slot: "labor_rate", field: "laborRate", label: "Labor rate", extensions: [".xlsx"] },
  { slot: "hc", field: "headcount", label: "Headcount", extensions: [".xlsx"] },
  { slot: "automation", field: "automation", label: "Automation potential", extensions: [".md", ".markdown", ".txt"] },
];

class ScanRequestError extends Error {}

/** Validate a present File's size and extension against its spec. */
function validateFile(value: File, spec: FileSpec): File {
  if (value.size > MAX_BYTES) {
    throw new ScanRequestError(`'${spec.label}' exceeds the ${MAX_BYTES / (1024 * 1024)} MB limit`);
  }
  const name = value.name.toLowerCase();
  if (!spec.extensions.some((ext) => name.endsWith(ext))) {
    throw new ScanRequestError(`'${spec.label}' must be one of: ${spec.extensions.join(", ")}`);
  }
  return value;
}

/** Pull a required File field from the form, validating presence, size, and extension. */
function requireFile(form: FormData, spec: FileSpec): File {
  const value = form.get(spec.field);
  if (!(value instanceof File) || value.size === 0) {
    throw new ScanRequestError(`Missing '${spec.label}' file`);
  }
  return validateFile(value, spec);
}

/** Pull an optional File field; null when absent, validated when present. */
function optionalFile(form: FormData, spec: FileSpec): File | null {
  const value = form.get(spec.field);
  if (!(value instanceof File) || value.size === 0) return null;
  return validateFile(value, spec);
}

/** Pull a required non-empty text field, trimmed and length-capped. */
function requireText(form: FormData, field: string, label: string): string {
  const value = form.get(field);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new ScanRequestError(`Missing '${label}'`);
  }
  const trimmed = value.trim();
  if (trimmed.length > MAX_TEXT) {
    throw new ScanRequestError(`'${label}' exceeds ${MAX_TEXT} characters`);
  }
  return trimmed;
}

/**
 * POST /api/scan — multipart upload of the three source files plus `company`
 * and `sector` text fields. Parses, computes the Function × BG impact model for
 * that company, persists it under its company key, and returns the {@link ScanModel}.
 */
export async function POST(request: NextRequest) {
  try {
    const form = await request.formData();
    const company = requireText(form, "company", "Company name");
    const sector = requireText(form, "sector", "Industry sector");
    const region = requireText(form, "region", "Region");
    const companyKey = scanCompanyKey(company);

    const [laborSpec, hcSpec, autoSpec] = FILE_SPECS;
    // HC is always a per-company upload; labor & automation fall back to the
    // shipped regional benchmark default when omitted.
    const hcFile = requireFile(form, hcSpec);
    const laborFile = optionalFile(form, laborSpec);
    const autoFile = optionalFile(form, autoSpec);

    const hcBuf = Buffer.from(await hcFile.arrayBuffer());
    const laborBuf = laborFile ? Buffer.from(await laborFile.arrayBuffer()) : null;
    const autoBuf = autoFile ? Buffer.from(await autoFile.arrayBuffer()) : null;

    const fallback = getDefaultBenchmark(region, sector);
    const hcRows = parseHeadcount(hcBuf);
    const laborRows: LaborRateRow[] = laborBuf ? parseLaborRate(laborBuf) : fallback.labor;
    const automation: Record<string, FunctionMeta> = autoBuf
      ? parseAutomationMd(autoBuf.toString("utf8"))
      : fallback.automation;

    const identity = { company, companyKey, sector, region };
    const model = computeScanModel(laborRows, hcRows, automation, new Date().toISOString(), identity);
    const inputs = buildScanInputs(laborRows, hcRows, automation, identity);

    const uploadWrites = [writeUpload(companyKey, hcSpec.slot, hcFile.name, hcBuf)];
    if (laborFile && laborBuf) uploadWrites.push(writeUpload(companyKey, laborSpec.slot, laborFile.name, laborBuf));
    if (autoFile && autoBuf) uploadWrites.push(writeUpload(companyKey, autoSpec.slot, autoFile.name, autoBuf));
    await Promise.all(uploadWrites);
    await Promise.all([writeScanModel(companyKey, model), writeScanInputs(companyKey, inputs)]);

    return ok(model, 201);
  } catch (error) {
    if (error instanceof ScanRequestError || error instanceof ScanParseError) {
      return fail(error.message, 400);
    }
    console.error("[POST /api/scan]", error);
    return fail(errorMessage(error), 500);
  }
}

/**
 * GET /api/scan?company=<key> — that company's computed scan, or null.
 * GET /api/scan                — the index of all scanned companies (manifests).
 */
export async function GET(request: NextRequest) {
  try {
    const company = request.nextUrl.searchParams.get("company");
    if (company) {
      return ok(await readScanModel(company));
    }
    return ok(await listManifests());
  } catch (error) {
    console.error("[GET /api/scan]", error);
    return fail(errorMessage(error), 500);
  }
}

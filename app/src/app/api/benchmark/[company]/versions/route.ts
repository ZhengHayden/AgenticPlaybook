import type { NextRequest } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { ok, fail, errorMessage } from "@/lib/api-response";
import { ScanParseError } from "@/lib/scan/parse-xlsx";
import { getDefaultBenchmark } from "@/lib/benchmark/defaults";
import { buildSnapshotFromUploads } from "@/lib/benchmark/snapshot-from-uploads";
import { parseCreateVersion } from "@/lib/benchmark/schema";
import { listVersions, writeVersion } from "@/lib/benchmark/store";
import type { BenchmarkSnapshot, BenchmarkVersion } from "@/lib/benchmark/types";

export const dynamic = "force-dynamic";

const MAX_BYTES = 20 * 1024 * 1024; // 20 MB — same ceiling as scan uploads.
const MAX_TEXT = 200;
const MAX_NAME = 120;

interface RouteContext {
  params: Promise<{ company: string }>;
}

class BenchmarkRequestError extends Error {}

/** GET /api/benchmark/:company/versions — saved version metadata, newest first. */
export async function GET(_request: NextRequest, { params }: RouteContext) {
  try {
    const { company } = await params;
    return ok(await listVersions(company));
  } catch (error) {
    console.error("[GET /api/benchmark/:company/versions]", error);
    return fail(errorMessage(error), 500);
  }
}

/**
 * POST /api/benchmark/:company/versions — create a company version. Accepts
 * either a JSON body ({ name, region, sector, source, snapshot }) for editor
 * saves, or a multipart form (name, region, sector + optional labor `.xlsx` and
 * automation `.md` files) for uploads. `versionId`/`createdAt`/`companyKey` are
 * always set server-side and never trusted from the client.
 */
export async function POST(request: NextRequest, { params }: RouteContext) {
  const { company } = await params;
  const contentType = request.headers.get("content-type") ?? "";

  try {
    const fields = contentType.includes("multipart/form-data")
      ? await fromMultipart(request)
      : await fromJson(request);

    const version: BenchmarkVersion = {
      versionId: randomUUID(),
      name: fields.name,
      companyKey: company,
      region: fields.region,
      sector: fields.sector,
      createdAt: new Date().toISOString(),
      source: fields.source,
      snapshot: fields.snapshot,
    };
    await writeVersion(company, version);
    return ok(version, 201);
  } catch (error) {
    if (error instanceof BenchmarkRequestError || error instanceof ScanParseError) {
      return fail(error.message, 400);
    }
    if (error instanceof z.ZodError) {
      return fail(error.issues.map((i) => `${i.path.join(".")}: ${i.message}`).join("; "), 400);
    }
    console.error("[POST /api/benchmark/:company/versions]", error);
    return fail(errorMessage(error), 500);
  }
}

interface VersionFields {
  name: string;
  region: string;
  sector: string;
  source: "edited" | "uploaded";
  snapshot: BenchmarkSnapshot;
}

/** Parse and validate a JSON editor-save body. */
async function fromJson(request: NextRequest): Promise<VersionFields> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new BenchmarkRequestError("Invalid JSON body");
  }
  const input = parseCreateVersion(body);
  return { name: input.name, region: input.region, sector: input.sector, source: input.source, snapshot: input.snapshot };
}

/** Parse a multipart upload body, seeding missing halves from the regional default. */
async function fromMultipart(request: NextRequest): Promise<VersionFields> {
  const form = await request.formData();
  const name = requireText(form, "name", "Version name", MAX_NAME);
  const region = requireText(form, "region", "Region", MAX_TEXT);
  const sector = requireText(form, "sector", "Industry sector", MAX_TEXT);

  const laborBuf = await optionalFile(form, "laborRate", "Labor rate", [".xlsx"]);
  const autoBuf = await optionalFile(form, "automation", "Automation potential", [".md", ".markdown", ".txt"]);
  if (!laborBuf && !autoBuf) {
    throw new BenchmarkRequestError("Provide at least one of a labor rate or automation file");
  }

  const fallback = getDefaultBenchmark(region, sector);
  const snapshot = buildSnapshotFromUploads(fallback, laborBuf, autoBuf?.toString("utf8"));
  return { name, region, sector, source: "uploaded", snapshot };
}

/** Pull a required non-empty text field, trimmed and length-capped. */
function requireText(form: FormData, field: string, label: string, max: number): string {
  const value = form.get(field);
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new BenchmarkRequestError(`Missing '${label}'`);
  }
  const trimmed = value.trim();
  if (trimmed.length > max) {
    throw new BenchmarkRequestError(`'${label}' exceeds ${max} characters`);
  }
  return trimmed;
}

/** Pull an optional File field, validating size/extension only when present. */
async function optionalFile(
  form: FormData,
  field: string,
  label: string,
  extensions: string[],
): Promise<Buffer | undefined> {
  const value = form.get(field);
  if (!(value instanceof File) || value.size === 0) return undefined;
  if (value.size > MAX_BYTES) {
    throw new BenchmarkRequestError(`'${label}' exceeds the ${MAX_BYTES / (1024 * 1024)} MB limit`);
  }
  const name = value.name.toLowerCase();
  if (!extensions.some((ext) => name.endsWith(ext))) {
    throw new BenchmarkRequestError(`'${label}' must be one of: ${extensions.join(", ")}`);
  }
  return Buffer.from(await value.arrayBuffer());
}

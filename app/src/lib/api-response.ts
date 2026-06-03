import { NextResponse } from "next/server";

/** Consistent API envelope used by every Route Handler. */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

export function ok<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json({ success: true, data }, { status });
}

export function fail(error: string, status: number): NextResponse<ApiResponse<never>> {
  return NextResponse.json({ success: false, error }, { status });
}

/** Narrow an unknown thrown value to a message for logging/response. */
export function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Unexpected error";
}

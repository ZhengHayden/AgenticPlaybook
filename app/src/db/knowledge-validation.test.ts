import { describe, it, expect } from "vitest";
import { updateUseCaseSchema } from "./knowledge-validation";

const kpiRow = { metric: "Cycle time", baseline: "5 days", target: "1 day", unit: "days", source: "ERP" };

describe("updateUseCaseSchema · kpiMetrics", () => {
  it("accepts a patch with structured KPI metrics", () => {
    const parsed = updateUseCaseSchema.safeParse({ kpiMetrics: [kpiRow] });
    expect(parsed.success).toBe(true);
  });

  it("treats kpiMetrics as optional (back-compat with rows that predate it)", () => {
    const parsed = updateUseCaseSchema.safeParse({ kpis: ["legacy free-text KPI"] });
    expect(parsed.success).toBe(true);
  });

  it("rejects a KPI row missing a required field", () => {
    const { unit: _omitted, ...incomplete } = kpiRow;
    const parsed = updateUseCaseSchema.safeParse({ kpiMetrics: [incomplete] });
    expect(parsed.success).toBe(false);
  });
});

import { describe, it, expect } from "vitest";

describe("test harness", () => {
  it("runs and resolves @ alias env", () => {
    expect(process.env.PLAYBOOK_ARTIFACTS_DIR).toContain("artifacts");
  });
});

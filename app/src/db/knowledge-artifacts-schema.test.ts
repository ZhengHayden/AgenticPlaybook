import { describe, it, expect } from "vitest";

describe("knowledge_artifacts bootstrap", () => {
  it("creates the table on a fresh database", async () => {
    const { db } = await import("./client");
    const rows = db.$client
      .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='knowledge_artifacts'")
      .all();
    expect(rows).toHaveLength(1);
  });
});

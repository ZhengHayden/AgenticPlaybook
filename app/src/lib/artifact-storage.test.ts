import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  writeArtifactFile,
  readArtifactFile,
  deleteArtifactDir,
  sanitizeFileName,
} from "./artifact-storage";

describe("sanitizeFileName", () => {
  it("strips path separators and traversal", () => {
    expect(sanitizeFileName("../../etc/passwd")).toBe("etc_passwd");
    expect(sanitizeFileName("my deck.pdf")).toBe("my deck.pdf");
    expect(sanitizeFileName("")).toBe("file");
  });
});

describe("write/read/delete", () => {
  it("writes bytes under <useCaseId>/<artifactId> and reads them back", async () => {
    const bytes = Buffer.from("hello");
    const rel = await writeArtifactFile("uc-1", "art-1", "doc.txt", bytes);
    expect(rel).toBe("uc-1/art-1/doc.txt");
    const read = await readArtifactFile(rel);
    expect(read.toString()).toBe("hello");
  });

  it("overwrites the previous file on replace (no history kept)", async () => {
    await writeArtifactFile("uc-1", "art-1", "a.txt", Buffer.from("v1"));
    const rel = await writeArtifactFile("uc-1", "art-1", "b.txt", Buffer.from("v2"));
    const dir = `${process.env.PLAYBOOK_ARTIFACTS_DIR}/uc-1/art-1`;
    expect(fs.readdirSync(dir)).toEqual(["b.txt"]); // old file removed
    expect((await readArtifactFile(rel)).toString()).toBe("v2");
  });

  it("deletes an artifact directory", async () => {
    await writeArtifactFile("uc-2", "art-9", "x.txt", Buffer.from("z"));
    await deleteArtifactDir("uc-2", "art-9");
    expect(fs.existsSync(`${process.env.PLAYBOOK_ARTIFACTS_DIR}/uc-2/art-9`)).toBe(false);
  });

  it("rejects reads that escape the artifacts dir", async () => {
    await expect(readArtifactFile("../../etc/passwd")).rejects.toThrow();
  });
});

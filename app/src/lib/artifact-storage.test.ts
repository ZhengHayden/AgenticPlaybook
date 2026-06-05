import { describe, it, expect } from "vitest";
import fs from "node:fs";
import {
  writeArtifactFile,
  readArtifactFile,
  deleteArtifactDir,
  deleteUseCaseArtifactsDir,
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

describe("dot/traversal id rejection (root-wipe guard)", () => {
  it('deleteArtifactDir rejects artifactId ".."', async () => {
    await expect(deleteArtifactDir("x", "..")).rejects.toThrow();
  });

  it('deleteUseCaseArtifactsDir rejects useCaseId "."', async () => {
    await expect(deleteUseCaseArtifactsDir(".")).rejects.toThrow();
  });

  it('deleteUseCaseArtifactsDir rejects useCaseId ".."', async () => {
    await expect(deleteUseCaseArtifactsDir("..")).rejects.toThrow();
  });

  it('writeArtifactFile rejects artifactId ".."', async () => {
    await expect(
      writeArtifactFile("uc", "..", "pwn.txt", Buffer.from("x")),
    ).rejects.toThrow();
  });

  it("deleteUseCaseArtifactsDir succeeds for a normal use-case id and removes only that dir", async () => {
    // Arrange: write a file under uc-safe/art-safe
    await writeArtifactFile("uc-safe", "art-safe", "f.txt", Buffer.from("data"));
    const dirPath = `${process.env.PLAYBOOK_ARTIFACTS_DIR}/uc-safe`;
    expect(fs.existsSync(dirPath)).toBe(true);

    // Act: delete just the use-case dir
    await deleteUseCaseArtifactsDir("uc-safe");

    // Assert: that dir is gone
    expect(fs.existsSync(dirPath)).toBe(false);
    // And the artifacts root itself still exists
    expect(fs.existsSync(process.env.PLAYBOOK_ARTIFACTS_DIR!)).toBe(true);
  });
});

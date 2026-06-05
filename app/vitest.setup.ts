import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Each test file gets isolated SQLite + artifact dirs via env, so the repo and
// storage modules never touch the real data/ directory.
let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "playbook-test-"));
  process.env.PLAYBOOK_DB_PATH = path.join(tmpRoot, "test.db");
  process.env.PLAYBOOK_ARTIFACTS_DIR = path.join(tmpRoot, "artifacts");
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

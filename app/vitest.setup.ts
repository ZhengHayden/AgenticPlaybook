import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach } from "vitest";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";

// Global in-memory localStorage polyfill for jsdom environments where
// --localstorage-file may stub out getItem/setItem as non-functions.
// This allows LocaleProvider (which calls window.localStorage.getItem) to boot
// in any component test without per-file mocks.
if (
  typeof globalThis.window !== "undefined" &&
  typeof (globalThis.window.localStorage?.getItem) !== "function"
) {
  const store = new Map<string, string>();
  const memStorage: Storage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    get length() { return store.size; },
  };
  Object.defineProperty(globalThis.window, "localStorage", {
    value: memStorage,
    writable: true,
    configurable: true,
  });
  (globalThis as unknown as { localStorage: Storage }).localStorage = memStorage;
}

// Each test file gets isolated SQLite + artifact dirs via env, so the repo and
// storage modules never touch the real data/ directory.
let tmpRoot: string;

beforeEach(() => {
  tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), "playbook-test-"));
  process.env.PLAYBOOK_DB_PATH = path.join(tmpRoot, "test.db");
  process.env.PLAYBOOK_ARTIFACTS_DIR = path.join(tmpRoot, "artifacts");
  // Clear the cached db connection so the next db import picks up the new path.
  // This is necessary in the node test environment where globalThis is the real
  // Node global and the connection is cached across tests in the same process.
  const g = globalThis as unknown as { __playbookDb?: unknown };
  delete g.__playbookDb;
});

afterEach(() => {
  fs.rmSync(tmpRoot, { recursive: true, force: true });
});

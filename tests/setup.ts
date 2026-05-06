import { afterEach, beforeEach } from 'vitest';
import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { resetDbForTests } from '../src/lib/db/client';

let tmpFile: string | null = null;

beforeEach(() => {
  // Each test gets a fresh on-disk DB to avoid cross-test interference and to
  // exercise the real migration path (in-memory mode also works but disk is
  // closer to production behavior).
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'lms-test-'));
  tmpFile = path.join(dir, 'lms.db');
  process.env.DATABASE_PATH = tmpFile;
  resetDbForTests();
});

afterEach(() => {
  resetDbForTests();
  if (tmpFile) {
    try {
      fs.rmSync(path.dirname(tmpFile), { recursive: true, force: true });
    } catch {
      /* ignore */
    }
    tmpFile = null;
  }
});

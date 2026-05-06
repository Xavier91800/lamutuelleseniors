import fs from 'node:fs';
import path from 'node:path';
import type { Database } from 'better-sqlite3';
import { logger } from '@/lib/logging/logger';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations');

export function runPendingMigrations(db: Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  if (!fs.existsSync(MIGRATIONS_DIR)) {
    logger.warn({ dir: MIGRATIONS_DIR }, 'migrations_dir_missing');
    return;
  }

  const files = fs
    .readdirSync(MIGRATIONS_DIR)
    .filter((f) => f.endsWith('.sql'))
    .sort();

  const applied = new Set(
    db.prepare('SELECT name FROM _migrations').all().map((row) => (row as { name: string }).name)
  );

  for (const file of files) {
    if (applied.has(file)) continue;

    const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8');
    const txn = db.transaction(() => {
      db.exec(sql);
      db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
    });
    txn();
    logger.info({ migration: file }, 'migration_applied');
  }
}

import path from 'node:path';
import fs from 'node:fs';
import Database, { type Database as DB } from 'better-sqlite3';
import { runPendingMigrations } from './migrations';
import { logger } from '@/lib/logging/logger';

let instance: DB | null = null;

function resolveDbPath(): string {
  const raw = process.env.DATABASE_PATH ?? './.data/lamutuelleseniors.db';
  return path.resolve(raw);
}

export function getDb(): DB {
  if (instance) return instance;

  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');
  db.pragma('busy_timeout = 5000');

  runPendingMigrations(db);

  instance = db;
  logger.info({ dbPath }, 'sqlite_ready');
  return db;
}

/**
 * Test helper: dispose of the cached connection so a fresh one can be opened
 * (e.g. against a different DATABASE_PATH).
 */
export function resetDbForTests(): void {
  if (instance) {
    instance.close();
    instance = null;
  }
}

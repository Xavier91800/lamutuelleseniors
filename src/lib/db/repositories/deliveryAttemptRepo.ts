import type { Database } from 'better-sqlite3';
import { getDb } from '@/lib/db/client';

export type AttemptStatus =
  | 'pending'
  | 'running'
  | 'success'
  | 'retry'
  | 'failed_4xx'
  | 'dead_letter';
export type AttemptMode = 'mock' | 'http';

export interface AttemptInsert {
  lead_id: string;
  attempt_no: number;
  status: AttemptStatus;
  mode: AttemptMode;
  payload_hash: string;
  http_status?: number | null;
  error_message?: string | null;
  next_retry_at?: string | null;
  started_at?: string | null;
  finished_at?: string | null;
}

export interface AttemptRow extends AttemptInsert {
  id: number;
  created_at: string;
}

export function insertAttempt(input: AttemptInsert, db: Database = getDb()): { id: number } {
  const result = db
    .prepare(
      `INSERT INTO delivery_attempts (
        lead_id, attempt_no, status, mode, http_status, error_message,
        payload_hash, started_at, finished_at, next_retry_at
      ) VALUES (
        @lead_id, @attempt_no, @status, @mode, @http_status, @error_message,
        @payload_hash, @started_at, @finished_at, @next_retry_at
      )`
    )
    .run({
      lead_id: input.lead_id,
      attempt_no: input.attempt_no,
      status: input.status,
      mode: input.mode,
      http_status: input.http_status ?? null,
      error_message: input.error_message ?? null,
      payload_hash: input.payload_hash,
      started_at: input.started_at ?? null,
      finished_at: input.finished_at ?? null,
      next_retry_at: input.next_retry_at ?? null,
    });
  return { id: Number(result.lastInsertRowid) };
}

export function updateAttempt(
  id: number,
  patch: Partial<Pick<AttemptInsert, 'status' | 'http_status' | 'error_message' | 'started_at' | 'finished_at' | 'next_retry_at'>>,
  db: Database = getDb()
): void {
  const fields = Object.keys(patch);
  if (fields.length === 0) return;
  const setClause = fields.map((f) => `${f} = @${f}`).join(', ');
  db.prepare(`UPDATE delivery_attempts SET ${setClause} WHERE id = @id`).run({
    id,
    ...patch,
  });
}

export function lastAttemptForLead(
  leadId: string,
  db: Database = getDb()
): AttemptRow | undefined {
  return db
    .prepare(
      `SELECT * FROM delivery_attempts
       WHERE lead_id = ?
       ORDER BY attempt_no DESC
       LIMIT 1`
    )
    .get(leadId) as AttemptRow | undefined;
}

export function claimRetryBatch(limit: number, db: Database = getDb()): AttemptRow[] {
  const rows = db
    .prepare(
      `SELECT * FROM delivery_attempts
       WHERE status = 'retry' AND (next_retry_at IS NULL OR next_retry_at <= datetime('now'))
       ORDER BY next_retry_at ASC
       LIMIT ?`
    )
    .all(limit) as AttemptRow[];

  for (const row of rows) {
    db.prepare(`UPDATE delivery_attempts SET status = 'running', started_at = datetime('now') WHERE id = ?`).run(
      row.id
    );
  }
  return rows;
}

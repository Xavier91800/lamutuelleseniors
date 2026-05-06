import type { Database } from 'better-sqlite3';
import { getDb } from '@/lib/db/client';

export type EventName =
  | 'funnel_started'
  | 'funnel_step_completed'
  | 'funnel_consent_blocked'
  | 'lead_submitted'
  | 'lead_dedup_rejected'
  | 'delivery_succeeded'
  | 'delivery_failed'
  | 'bot_detected'
  | 'cookie_consent';

export interface EventInsert {
  event: EventName;
  lead_id?: string | null;
  step_index?: number | null;
  client_session_id?: string | null;
  metadata?: Record<string, unknown> | null;
}

export function insertEvent(input: EventInsert, db: Database = getDb()): void {
  db.prepare(
    `INSERT INTO events (event, lead_id, step_index, client_session_id, metadata)
     VALUES (?, ?, ?, ?, ?)`
  ).run(
    input.event,
    input.lead_id ?? null,
    input.step_index ?? null,
    input.client_session_id ?? null,
    input.metadata ? JSON.stringify(input.metadata) : null
  );
}

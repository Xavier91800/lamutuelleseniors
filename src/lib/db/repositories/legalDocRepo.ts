import type { Database } from 'better-sqlite3';
import { getDb } from '@/lib/db/client';
import type { LegalDocKind, LegalDocumentRow } from '@/types/consent';

export function getPublished(kind: LegalDocKind, db: Database = getDb()): LegalDocumentRow {
  const row = db
    .prepare(
      `SELECT * FROM legal_documents
       WHERE kind = ? AND status = 'published'
       ORDER BY effective_at DESC
       LIMIT 1`
    )
    .get(kind) as LegalDocumentRow | undefined;

  if (!row) {
    throw new Error(`No published legal_document for kind="${kind}"`);
  }
  return row;
}

export function findByKindAndVersion(
  kind: LegalDocKind,
  version: string,
  db: Database = getDb()
): LegalDocumentRow | undefined {
  return db
    .prepare(`SELECT * FROM legal_documents WHERE kind = ? AND version = ?`)
    .get(kind, version) as LegalDocumentRow | undefined;
}

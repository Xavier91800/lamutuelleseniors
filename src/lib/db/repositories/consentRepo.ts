import type { Database } from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/client';
import type { ConsentRow, LegalDocumentRow } from '@/types/consent';

export interface ConsentInsert {
  lead_id: string;
  data_processing: boolean;
  cgu: LegalDocumentRow;
  pdc: LegalDocumentRow;
  ip_address: string;
  user_agent: string;
}

export function insertConsent(input: ConsentInsert, db: Database = getDb()): { id: string } {
  const id = nanoid(21);
  db.prepare(
    `INSERT INTO consents (
      id, lead_id,
      purpose_data_processing, purpose_courtier_transmission,
      cgu_document_id, pdc_document_id,
      cgu_version, pdc_version,
      cgu_body_hash, pdc_body_hash,
      ip_address, user_agent
    ) VALUES (
      @id, @lead_id,
      @purpose_data_processing, 1,
      @cgu_document_id, @pdc_document_id,
      @cgu_version, @pdc_version,
      @cgu_body_hash, @pdc_body_hash,
      @ip_address, @user_agent
    )`
  ).run({
    id,
    lead_id: input.lead_id,
    purpose_data_processing: input.data_processing ? 1 : 0,
    cgu_document_id: input.cgu.id,
    pdc_document_id: input.pdc.id,
    cgu_version: input.cgu.version,
    pdc_version: input.pdc.version,
    cgu_body_hash: input.cgu.body_hash,
    pdc_body_hash: input.pdc.body_hash,
    ip_address: input.ip_address,
    user_agent: input.user_agent,
  });
  return { id };
}

export function findByLeadId(leadId: string, db: Database = getDb()): ConsentRow | undefined {
  return db.prepare(`SELECT * FROM consents WHERE lead_id = ?`).get(leadId) as
    | ConsentRow
    | undefined;
}

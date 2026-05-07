import { describe, it, expect } from 'vitest';
import { getDb } from '@/lib/db/client';
import { getPublished } from '@/lib/db/repositories/legalDocRepo';
import { insertConsent } from '@/lib/db/repositories/consentRepo';
import { insertLead } from '@/lib/db/repositories/leadRepo';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

function ensureSeed() {
  const db = getDb();
  // After tests/setup.ts each run starts with an empty DB; seed legal docs manually.
  for (const [kind, version, file] of [
    ['cgu', '1.0', 'cgu-v1.md'],
    ['pdc', '1.0', 'pdc-v1.md'],
    ['mentions', '1.0', 'mentions-v1.md'],
  ] as const) {
    const filePath = path.join(process.cwd(), 'src', 'content', 'legal', file);
    const body = fs.readFileSync(filePath, 'utf8');
    const hash = crypto.createHash('sha256').update(body).digest('hex');
    db.prepare(
      `INSERT OR IGNORE INTO legal_documents (kind, version, effective_at, published_at, body_path, body_hash, status)
       VALUES (?, ?, date('now'), date('now'), ?, ?, 'published')`
    ).run(kind, version, `src/content/legal/${file}`, hash);
  }
}

function insertSampleLead(): { id: string } {
  return insertLead({
    nom: 'Dupont',
    prenom: 'Jeanne',
    date_naissance: '1955-03-12',
    code_postal: '75015',
    campaign_id: 'senior',
    age_at_submission: 70,
    ip_address: '127.0.0.1',
    user_agent: 'vitest',
    source_path: '/tunnel',
  });
}

describe('Consent record contract', () => {
  it('persists a consent referencing the currently published CGU/PdC', () => {
    ensureSeed();
    const { id: leadId } = insertSampleLead();

    const cgu = getPublished('cgu');
    const pdc = getPublished('pdc');
    expect(cgu.version).toBe('1.1');
    expect(pdc.version).toBe('1.2');

    insertConsent({
      lead_id: leadId,
      data_processing: true,
      cgu,
      pdc,
      ip_address: '127.0.0.1',
      user_agent: 'vitest',
    });

    const row = getDb()
      .prepare(`SELECT * FROM consents WHERE lead_id = ?`)
      .get(leadId) as Record<string, unknown> | undefined;

    expect(row).toBeDefined();
    expect(row!.cgu_version).toBe('1.1');
    expect(row!.cgu_body_hash).toBe(cgu.body_hash);
    expect(row!.pdc_body_hash).toBe(pdc.body_hash);
    expect(row!.purpose_courtier_transmission).toBe(1);
  });

  it('keeps the consent immutable when a new doc version is published', () => {
    ensureSeed();
    const { id: leadId } = insertSampleLead();
    const cgu = getPublished('cgu');
    const pdc = getPublished('pdc');
    insertConsent({
      lead_id: leadId,
      data_processing: true,
      cgu,
      pdc,
      ip_address: '127.0.0.1',
      user_agent: 'vitest',
    });

    // Publish a fresh CGU v1.2 and retire prior versions
    getDb()
      .prepare(
        `INSERT INTO legal_documents (kind, version, effective_at, published_at, body_path, body_hash, status)
         VALUES ('cgu', '1.2', date('now'), date('now'), 'src/content/legal/cgu-v1_2.md', 'newhash', 'published')`
      )
      .run();
    getDb()
      .prepare(`UPDATE legal_documents SET status='retired' WHERE kind='cgu' AND version != '1.2'`)
      .run();

    const consent = getDb()
      .prepare(`SELECT * FROM consents WHERE lead_id = ?`)
      .get(leadId) as Record<string, unknown>;

    expect(consent.cgu_version).toBe('1.1');
    expect(consent.cgu_body_hash).toBe(cgu.body_hash);
    expect(getPublished('cgu').version).toBe('1.2');
  });

  it('rejects a consent flagged with purpose_courtier_transmission != 1 (DB constraint)', () => {
    ensureSeed();
    const { id: leadId } = insertSampleLead();
    const db = getDb();
    expect(() =>
      db
        .prepare(
          `INSERT INTO consents (id, lead_id, purpose_data_processing, purpose_courtier_transmission,
             cgu_document_id, pdc_document_id, cgu_version, pdc_version, cgu_body_hash, pdc_body_hash, ip_address, user_agent)
             VALUES ('c1', ?, 1, 0, 1, 2, '1.0', '1.0', 'h', 'h', '127.0.0.1', 'vitest')`
        )
        .run(leadId)
    ).toThrow();
  });
});

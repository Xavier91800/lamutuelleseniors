import type { Database } from 'better-sqlite3';
import { findByKindAndVersion, getPublished } from '@/lib/db/repositories/legalDocRepo';
import { insertConsent } from '@/lib/db/repositories/consentRepo';
import { appendConsentAudit } from '@/lib/consent/audit';

export interface ConsentInput {
  lead_id: string;
  data_processing: boolean;
  courtier_transmission: true;
  cgu_version: string;
  pdc_version: string;
  ip_address: string;
  user_agent: string;
}

export class ConsentOutdatedError extends Error {
  constructor(public readonly missing: 'cgu' | 'pdc') {
    super(`Consent references an outdated ${missing} version`);
  }
}

export function recordConsent(input: ConsentInput, db: Database): { id: string } {
  const cgu = findByKindAndVersion('cgu', input.cgu_version, db);
  const pdc = findByKindAndVersion('pdc', input.pdc_version, db);
  const currentCgu = getPublished('cgu', db);
  const currentPdc = getPublished('pdc', db);

  if (!cgu || cgu.status !== 'published' || cgu.id !== currentCgu.id) {
    throw new ConsentOutdatedError('cgu');
  }
  if (!pdc || pdc.status !== 'published' || pdc.id !== currentPdc.id) {
    throw new ConsentOutdatedError('pdc');
  }

  const result = insertConsent(
    {
      lead_id: input.lead_id,
      data_processing: input.data_processing,
      cgu,
      pdc,
      ip_address: input.ip_address,
      user_agent: input.user_agent,
    },
    db
  );

  // Append-only audit trail for RGPD compliance — the SQLite row is the source
  // of truth, this file is an independent durable artefact useful for audits
  // and litigation.
  appendConsentAudit({
    consent_id: result.id,
    lead_id: input.lead_id,
    ip_address: input.ip_address,
    user_agent: input.user_agent,
    cgu_version: cgu.version,
    cgu_body_hash: cgu.body_hash,
    pdc_version: pdc.version,
    pdc_body_hash: pdc.body_hash,
    purpose_data_processing: input.data_processing,
    purpose_courtier_transmission: true,
  });

  return result;
}

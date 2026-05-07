import type { Database } from 'better-sqlite3';
import { getDb } from '@/lib/db/client';
import {
  claimRetryBatch,
  insertAttempt,
  lastAttemptForLead,
  updateAttempt,
} from '@/lib/db/repositories/deliveryAttemptRepo';
import { findById, updateDeliveryStatus } from '@/lib/db/repositories/leadRepo';
import { findByKindAndVersion } from '@/lib/db/repositories/legalDocRepo';
import { insertEvent } from '@/lib/db/repositories/eventRepo';
import { findByLeadId } from '@/lib/db/repositories/consentRepo';
import { getLeadDeliveryClient } from '@/lib/lead-delivery/factory';
import type { LeadDeliveryPayload } from '@/lib/lead-delivery/LeadDeliveryClient';
import { MAX_ATTEMPTS, nextRetryAt } from './backoff';
import { logger } from '@/lib/logging/logger';
import { notifyDeadLetter } from '@/lib/notifications/emailNotifier';
import crypto from 'node:crypto';

export interface RetryCycleSummary {
  examined: number;
  delivered: number;
  still_retry: number;
  permanent_failure: number;
  dead_letter: number;
}

function buildPayload(leadId: string, db: Database): LeadDeliveryPayload | null {
  const lead = findById(leadId, db);
  if (!lead) return null;
  const consent = findByLeadId(leadId, db);
  const cguDoc =
    consent && findByKindAndVersion('cgu', consent.cgu_version, db);
  const pdcDoc =
    consent && findByKindAndVersion('pdc', consent.pdc_version, db);

  return {
    lead_id: lead.id,
    campaign_id: lead.campaign_id,
    submitted_at: lead.submitted_at,
    identity: {
      nom: lead.nom,
      prenom: lead.prenom,
      date_naissance: lead.date_naissance,
      code_postal: lead.code_postal,
      email: lead.email ?? undefined,
      telephone: lead.telephone ?? undefined,
    },
    qualifications: (() => {
      const enfantsDates = lead.enfants_dates_naissance
        ? (JSON.parse(lead.enfants_dates_naissance as unknown as string) as string[])
        : undefined;
      const enfantsRegimes = (lead as unknown as { enfants_regimes?: string | null })
        .enfants_regimes
        ? (JSON.parse(
            (lead as unknown as { enfants_regimes: string }).enfants_regimes
          ) as number[])
        : undefined;
      const conjointRegime = (lead as unknown as { conjoint_regime?: number | null })
        .conjoint_regime;
      const insuredOver = (lead as unknown as { insured_over_one_year?: number | null })
        .insured_over_one_year;
      return {
        regime: lead.regime ?? undefined,
        niveau_garantie: lead.niveau_garantie ?? undefined,
        situation_actuelle: lead.situation_actuelle ?? undefined,
        insured_over_one_year:
          insuredOver === 0 || insuredOver === 1 ? (insuredOver as 0 | 1) : undefined,
        date_effet_souhaitee: lead.date_effet_souhaitee ?? undefined,
        conjoint:
          lead.conjoint_present === 1 && lead.conjoint_date_naissance
            ? {
                date_naissance: lead.conjoint_date_naissance,
                regime: conjointRegime ?? undefined,
              }
            : undefined,
        enfants: enfantsDates
          ? enfantsDates.map((d, i) => ({
              date_naissance: d,
              regime: enfantsRegimes?.[i] ?? undefined,
            }))
          : undefined,
      };
    })(),
    attribution: {
      source_path: lead.source_path,
      utm_source: lead.utm_source ?? undefined,
      utm_medium: lead.utm_medium ?? undefined,
      utm_campaign: lead.utm_campaign ?? undefined,
      utm_term: lead.utm_term ?? undefined,
      utm_content: lead.utm_content ?? undefined,
    },
    consent: {
      granted_at: consent?.granted_at ?? lead.submitted_at,
      cgu_version: cguDoc?.version ?? consent?.cgu_version ?? '1.0',
      pdc_version: pdcDoc?.version ?? consent?.pdc_version ?? '1.0',
      ip_address: consent?.ip_address ?? lead.ip_address,
      user_agent: consent?.user_agent ?? lead.user_agent,
    },
  };
}

export function payloadHash(payload: LeadDeliveryPayload): string {
  return crypto.createHash('sha256').update(JSON.stringify(payload)).digest('hex');
}

/**
 * Run a single attempt — used both for the initial in-flight delivery and from
 * the retry worker. Mutates the DB to reflect the result.
 */
export async function runDelivery(
  leadId: string,
  attemptNo: number,
  db: Database = getDb()
): Promise<'success' | 'retry' | 'failed_4xx'> {
  const payload = buildPayload(leadId, db);
  if (!payload) return 'failed_4xx';

  const client = getLeadDeliveryClient();
  const mode = process.env.LEAD_DELIVERY_MODE === 'http' ? 'http' : 'mock';
  const hash = payloadHash(payload);

  const startedAt = new Date().toISOString();
  const attemptInsertId = insertAttempt(
    {
      lead_id: leadId,
      attempt_no: attemptNo,
      status: 'running',
      mode,
      payload_hash: hash,
      started_at: startedAt,
    },
    db
  ).id;

  let result;
  try {
    result = await client.deliver(payload);
  } catch (err) {
    result = {
      status: 'retry' as const,
      mode,
      reason: err instanceof Error ? err.message : 'unknown_error',
    };
  }

  const finishedAt = new Date().toISOString();

  if (result.status === 'success') {
    updateAttempt(
      attemptInsertId,
      {
        status: 'success',
        finished_at: finishedAt,
        http_status: result.http_status ?? null,
      },
      db
    );
    updateDeliveryStatus(leadId, result.mode === 'mock' ? 'delivered_mock' : 'delivered', db);
    insertEvent({ event: 'delivery_succeeded', lead_id: leadId, metadata: { mode: result.mode } }, db);
    return 'success';
  }

  if (result.status === 'permanent_failure') {
    updateAttempt(
      attemptInsertId,
      {
        status: 'failed_4xx',
        finished_at: finishedAt,
        http_status: result.http_status ?? null,
        error_message: result.reason,
      },
      db
    );
    updateDeliveryStatus(leadId, 'rejected_4xx', db);
    insertEvent({ event: 'delivery_failed', lead_id: leadId, metadata: { mode, reason: result.reason } }, db);
    const lead = findById(leadId, db);
    if (lead) await notifyDeadLetter(lead);
    return 'failed_4xx';
  }

  // status === 'retry'
  const next = nextRetryAt(attemptNo);
  if (!next || attemptNo >= MAX_ATTEMPTS) {
    updateAttempt(
      attemptInsertId,
      {
        status: 'dead_letter',
        finished_at: finishedAt,
        http_status: result.http_status ?? null,
        error_message: result.reason,
      },
      db
    );
    updateDeliveryStatus(leadId, 'dead_letter', db);
    insertEvent({ event: 'delivery_failed', lead_id: leadId, metadata: { mode, dead_letter: true } }, db);
    const lead = findById(leadId, db);
    if (lead) await notifyDeadLetter(lead);
    return 'failed_4xx';
  }

  updateAttempt(
    attemptInsertId,
    {
      status: 'retry',
      finished_at: finishedAt,
      http_status: result.http_status ?? null,
      error_message: result.reason,
      next_retry_at: next.toISOString().replace('T', ' ').slice(0, 19),
    },
    db
  );
  // delivery_status remains 'pending'
  return 'retry';
}

export async function runRetryCycle(limit = 50): Promise<RetryCycleSummary> {
  const db = getDb();
  const claimed = claimRetryBatch(limit, db);
  const summary: RetryCycleSummary = {
    examined: claimed.length,
    delivered: 0,
    still_retry: 0,
    permanent_failure: 0,
    dead_letter: 0,
  };

  for (const attempt of claimed) {
    const last = lastAttemptForLead(attempt.lead_id, db);
    const nextNo = (last?.attempt_no ?? attempt.attempt_no) + 1;
    const outcome = await runDelivery(attempt.lead_id, nextNo, db);
    if (outcome === 'success') summary.delivered += 1;
    else if (outcome === 'retry') summary.still_retry += 1;
    else summary.permanent_failure += 1;
  }

  // Tally dead-lettered separately (delivery_status was set above)
  const dead = db
    .prepare(`SELECT count(*) as n FROM leads WHERE delivery_status = 'dead_letter'`)
    .get() as { n: number };
  summary.dead_letter = dead.n;

  if (summary.examined > 0) {
    logger.info(summary, 'retry_cycle_done');
  }
  return summary;
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getDb } from '@/lib/db/client';
import { leadRequestSchema, type LeadRequest } from '@/lib/validation/leadSchema';
import { computeAge, resolveCampaign } from '@/lib/campaign/resolveCampaign';
import { findRecentDuplicate, findById, insertLead } from '@/lib/db/repositories/leadRepo';
import { recordConsent, ConsentOutdatedError } from '@/lib/consent/recordConsent';
import { insertEvent } from '@/lib/db/repositories/eventRepo';
import { rateLimit } from '@/lib/antibot/rateLimit';
import { isHoneypotTriggered, isTooFast } from '@/lib/antibot/honeypot';
import { runDelivery } from '@/lib/retry/retryWorker';
import { notifyNewLead } from '@/lib/notifications/emailNotifier';
import { logger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

function clientIp(req: Request): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0].trim() ??
    req.headers.get('x-real-ip') ??
    '0.0.0.0'
  );
}

function silentOk() {
  return NextResponse.json({ status: 'ok' });
}

export async function POST(request: Request): Promise<NextResponse> {
  const ip = clientIp(request);
  const ua = request.headers.get('user-agent') ?? 'unknown';

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json({ status: 'invalid', errors: [{ field: '_root', message: 'JSON invalide' }] }, { status: 400 });
  }

  // Honeypot — silent 200, bot doesn't learn anything
  if (typeof raw === 'object' && raw !== null && isHoneypotTriggered(raw as Record<string, unknown>)) {
    insertEvent({ event: 'bot_detected', metadata: { reason: 'honeypot', ip } });
    return silentOk();
  }

  // Validation
  const parsed = leadRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const errors = parsed.error.issues.map((i: z.ZodIssue) => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return NextResponse.json({ status: 'invalid', errors }, { status: 400 });
  }
  const data: LeadRequest = parsed.data;

  // Time-on-form
  if (isTooFast(data.tunnel_started_at_ms)) {
    insertEvent({ event: 'bot_detected', metadata: { reason: 'too_fast', ip } });
    return silentOk();
  }

  // Rate-limit
  const perHour = Number(process.env.RATE_LIMIT_SUBMISSIONS_PER_HOUR ?? '10');
  const rl = rateLimit(ip, { perHour });
  if (!rl.allowed) {
    return NextResponse.json(
      { status: 'rate_limited', retry_after_s: rl.retryAfterSeconds },
      { status: 429 }
    );
  }

  const db = getDb();

  // Dedup
  const dup = findRecentDuplicate(
    {
      nom: data.nom,
      prenom: data.prenom,
      date_naissance: data.date_naissance,
      code_postal: data.code_postal,
    },
    db
  );
  if (dup) {
    insertEvent({ event: 'lead_dedup_rejected', lead_id: dup.id, metadata: { ip } }, db);
    return NextResponse.json({ status: 'duplicate', lead_id: dup.id });
  }

  // Compute campaign
  const age = computeAge(data.date_naissance);
  const campaignId = resolveCampaign({
    age,
    conjoint_present: (data.conjoint_present ?? 0) as 0 | 1,
    enfants_count: data.enfants_dates_naissance?.length ?? 0,
  });

  // Insert lead + consent in a single transaction
  let leadId: string;
  try {
    const txn = db.transaction(() => {
      const inserted = insertLead(
        {
          ...data,
          campaign_id: campaignId,
          age_at_submission: age,
          ip_address: ip,
          user_agent: ua,
          source_path: data.source_path ?? '/tunnel',
        },
        db
      );
      recordConsent(
        {
          lead_id: inserted.id,
          data_processing: data.consent.data_processing,
          courtier_transmission: true,
          cgu_version: data.consent.cgu_version,
          pdc_version: data.consent.pdc_version,
          ip_address: ip,
          user_agent: ua,
        },
        db
      );
      insertEvent(
        { event: 'lead_submitted', lead_id: inserted.id, metadata: { campaign_id: campaignId } },
        db
      );
      return inserted;
    });
    leadId = txn().id;
  } catch (err) {
    if (err instanceof ConsentOutdatedError) {
      return NextResponse.json(
        { status: 'consent_outdated', missing: err.missing },
        { status: 409 }
      );
    }
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'lead_submission_error'
    );
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }

  // Best-effort initial delivery (no transaction)
  let deliveryStatus: 'delivered' | 'delivered_mock' | 'pending' | 'rejected_4xx' = 'pending';
  try {
    const outcome = await runDelivery(leadId, 1, db);
    if (outcome === 'success') {
      deliveryStatus = process.env.LEAD_DELIVERY_MODE === 'http' ? 'delivered' : 'delivered_mock';
    } else if (outcome === 'failed_4xx') {
      deliveryStatus = 'rejected_4xx';
    } else {
      deliveryStatus = 'pending';
    }
  } catch (err) {
    logger.error(
      { lead_id: leadId, err: err instanceof Error ? err.message : String(err) },
      'initial_delivery_error'
    );
    deliveryStatus = 'pending';
  }

  // Best-effort notification
  const lead = findById(leadId, db);
  if (lead) {
    void notifyNewLead(lead);
  }

  return NextResponse.json({
    status: 'ok',
    lead_id: leadId,
    campaign_id: campaignId,
    delivery: deliveryStatus,
  });
}

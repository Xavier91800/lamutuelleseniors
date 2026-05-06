import { describe, it, expect, beforeEach } from 'vitest';
import { POST as postRetry } from '../../app/api/lead/retry/route';
import { POST as postLead } from '../../app/api/lead/route';
import { getDb } from '@/lib/db/client';
import { resetRateLimitForTests } from '@/lib/antibot/rateLimit';
import { setLeadDeliveryClientForTests } from '@/lib/lead-delivery/factory';
import { FakeLeadDeliveryClient } from '../_helpers/FakeLeadDeliveryClient';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

function seedLegalDocs() {
  const db = getDb();
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

const TOKEN = 'unit-test-token-1234';

beforeEach(() => {
  process.env.RETRY_CRON_TOKEN = TOKEN;
  seedLegalDocs();
  resetRateLimitForTests();
});

function retryRequest(token: string | null = TOKEN, body: unknown = {}): Request {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (token) headers['x-cron-token'] = token;
  return new Request('http://localhost:3000/api/lead/retry', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
}

function leadBody(overrides: Record<string, unknown> = {}) {
  return {
    nom: 'Dupont',
    prenom: 'Jeanne',
    date_naissance: '1955-03-12',
    code_postal: '75015',
    consent: {
      data_processing: true,
      courtier_transmission: true,
      cgu_version: '1.1',
      pdc_version: '1.1',
    },
    client_session_id: 'cs_xxxxxxxxxxxx',
    tunnel_started_at_ms: Date.now() - 30_000,
    hp_zip: '',
    ...overrides,
  };
}

describe('POST /api/lead/retry', () => {
  it('T-RETRY-1: 401 without the cron token', async () => {
    const res = await postRetry(retryRequest(null));
    expect(res.status).toBe(401);
  });

  it('T-RETRY-2: only retries rows with status=retry whose next_retry_at is in the past', async () => {
    // First create a lead whose initial delivery comes back retry
    const fake = new FakeLeadDeliveryClient([
      { status: 'retry', mode: 'http', http_status: 503, reason: 'temp' },
    ]);
    setLeadDeliveryClientForTests(fake);

    const submission = await postLead(
      new Request('http://localhost:3000/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.111', 'user-agent': 'vitest' },
        body: JSON.stringify(leadBody({ nom: 'Retryable' })),
      })
    );
    const submissionData = await submission.json();
    expect(submissionData.delivery).toBe('pending');

    // Force next_retry_at into the past so the worker picks it up
    getDb()
      .prepare(`UPDATE delivery_attempts SET next_retry_at = datetime('now', '-1 minute')`)
      .run();

    // Now make next call succeed
    fake.enqueue({ status: 'success', mode: 'http', http_status: 200 });
    const cycle = await postRetry(retryRequest(TOKEN, { limit: 50 }));
    const cycleData = await cycle.json();
    expect(cycle.status).toBe(200);
    expect(cycleData.examined).toBeGreaterThanOrEqual(1);
    expect(cycleData.delivered).toBeGreaterThanOrEqual(1);

    const lead = getDb()
      .prepare(`SELECT * FROM leads WHERE id = ?`)
      .get(submissionData.lead_id) as { delivery_status: string };
    expect(lead.delivery_status).toBe('delivered');
  });

  it('T-RETRY-3: dead-letters after 6 failed attempts', async () => {
    // Submit and then loop 6 retry cycles, each returning retry
    const fake = new FakeLeadDeliveryClient([
      { status: 'retry', mode: 'http', http_status: 503, reason: 't1' },
    ]);
    setLeadDeliveryClientForTests(fake);

    const sub = await postLead(
      new Request('http://localhost:3000/api/lead', {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-forwarded-for': '203.0.113.222', 'user-agent': 'vitest' },
        body: JSON.stringify(leadBody({ nom: 'DeadLetter' })),
      })
    );
    const subData = await sub.json();

    for (let i = 0; i < 6; i++) {
      fake.enqueue({ status: 'retry', mode: 'http', http_status: 503, reason: `t${i + 2}` });
      getDb()
        .prepare(`UPDATE delivery_attempts SET next_retry_at = datetime('now', '-1 minute') WHERE status = 'retry'`)
        .run();
      await postRetry(retryRequest(TOKEN));
    }

    const lead = getDb()
      .prepare(`SELECT delivery_status FROM leads WHERE id = ?`)
      .get(subData.lead_id) as { delivery_status: string };
    expect(lead.delivery_status).toBe('dead_letter');
  });
});

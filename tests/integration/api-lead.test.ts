import { describe, it, expect, beforeEach } from 'vitest';
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

const baseBody = (overrides: Record<string, unknown> = {}) => ({
  nom: 'Dupont',
  prenom: 'Jeanne',
  date_naissance: '1955-03-12',
  code_postal: '75015',
  consent: {
    data_processing: true,
    courtier_transmission: true,
    cgu_version: '1.1',
    pdc_version: '1.2',
  },
  client_session_id: 'cs_xxxxxxxxxxxx',
  tunnel_started_at_ms: Date.now() - 30_000,
  hp_zip: '',
  ...overrides,
});

function postRequest(body: unknown, ip = '203.0.113.10'): Request {
  return new Request('http://localhost:3000/api/lead', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': ip,
      'user-agent': 'vitest',
    },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  seedLegalDocs();
  resetRateLimitForTests();
  setLeadDeliveryClientForTests(new FakeLeadDeliveryClient());
});

describe('POST /api/lead', () => {
  it('T-LEAD-1: happy path 55+ creates a lead with campaign senior', async () => {
    const res = await postLead(postRequest(baseBody()));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.status).toBe('ok');
    expect(data.campaign_id).toBe('senior');
    const db = getDb();
    const row = db.prepare(`SELECT * FROM leads WHERE id = ?`).get(data.lead_id) as
      | Record<string, unknown>
      | undefined;
    expect(row).toBeDefined();
    expect(row!.campaign_id).toBe('senior');
  });

  it('T-LEAD-2: age 42 + conjoint_present=1 routes to under55_family', async () => {
    const body = baseBody({
      date_naissance: '1984-01-01',
      conjoint_present: 1,
      conjoint_date_naissance: '1985-04-12',
      enfants_dates_naissance: [],
    });
    const res = await postLead(postRequest(body, '203.0.113.20'));
    const data = await res.json();
    expect(data.campaign_id).toBe('under55_family');
  });

  it('T-LEAD-3: age 30 alone routes to under55_solo', async () => {
    const body = baseBody({
      date_naissance: '1996-01-01',
      conjoint_present: 0,
      enfants_dates_naissance: [],
    });
    const res = await postLead(postRequest(body, '203.0.113.30'));
    const data = await res.json();
    expect(data.campaign_id).toBe('under55_solo');
  });

  it('T-LEAD-4: TOM postal code 98800 returns 400', async () => {
    const res = await postLead(postRequest(baseBody({ code_postal: '98800' })));
    expect(res.status).toBe(400);
  });

  it('T-LEAD-5: DOM postal code 97400 returns 200', async () => {
    const res = await postLead(postRequest(baseBody({ code_postal: '97400' }), '203.0.113.40'));
    expect(res.status).toBe(200);
  });

  it('T-LEAD-6: courtier consent refused returns 400 and persists nothing', async () => {
    const body = baseBody({
      consent: {
        data_processing: true,
        courtier_transmission: false,
        cgu_version: '1.1',
        pdc_version: '1.2',
      },
    });
    const res = await postLead(postRequest(body, '203.0.113.50'));
    expect(res.status).toBe(400);
    const count = (getDb().prepare(`SELECT count(*) as n FROM leads`).get() as { n: number }).n;
    expect(count).toBe(0);
  });

  it('T-LEAD-7: duplicate within 24h returns 200 with status=duplicate', async () => {
    const ip = '203.0.113.60';
    const first = await postLead(postRequest(baseBody(), ip));
    expect(first.status).toBe(200);
    const second = await postLead(postRequest(baseBody(), ip));
    const data = await second.json();
    expect(data.status).toBe('duplicate');
    const count = (getDb().prepare(`SELECT count(*) as n FROM leads`).get() as { n: number }).n;
    expect(count).toBe(1);
  });

  it('T-LEAD-8: honeypot field filled returns silent 200, no lead created', async () => {
    const res = await postLead(postRequest(baseBody({ hp_zip: 'spam' }), '203.0.113.70'));
    expect(res.status).toBe(200);
    const count = (getDb().prepare(`SELECT count(*) as n FROM leads`).get() as { n: number }).n;
    expect(count).toBe(0);
  });

  it('T-LEAD-9: HTTP 5xx leaves the lead in pending with a retry attempt', async () => {
    const fake = new FakeLeadDeliveryClient([
      { status: 'retry', mode: 'http', http_status: 503, reason: 'Service Unavailable' },
    ]);
    setLeadDeliveryClientForTests(fake);

    const res = await postLead(postRequest(baseBody(), '203.0.113.80'));
    const data = await res.json();
    expect(res.status).toBe(200);
    expect(data.delivery).toBe('pending');
    const lead = getDb().prepare(`SELECT * FROM leads WHERE id = ?`).get(data.lead_id) as
      | { delivery_status: string }
      | undefined;
    expect(lead!.delivery_status).toBe('pending');
    const attempt = getDb()
      .prepare(`SELECT status FROM delivery_attempts WHERE lead_id = ?`)
      .get(data.lead_id) as { status: string };
    expect(attempt.status).toBe('retry');
  });

  it('T-LEAD-10: 11th submission from same IP returns 429', async () => {
    const ip = '203.0.113.90';
    for (let i = 0; i < 10; i++) {
      // Each call needs unique identity to avoid dedup ; only the rate limiter is the gate
      const body = baseBody({
        nom: `Dup${i}`,
      });
      const r = await postLead(postRequest(body, ip));
      expect(r.status).toBe(200);
    }
    const eleventh = await postLead(postRequest(baseBody({ nom: 'Eleventh' }), ip));
    expect(eleventh.status).toBe(429);
  });
});

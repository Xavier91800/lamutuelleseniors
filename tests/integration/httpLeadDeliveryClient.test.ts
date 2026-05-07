import { describe, it, expect, beforeEach } from 'vitest';
import { HttpLeadDeliveryClient } from '@/lib/lead-delivery/HttpLeadDeliveryClient';
import type { LeadDeliveryPayload } from '@/lib/lead-delivery/LeadDeliveryClient';

// ---------- fetch stub ----------

type StubResponse = {
  status: number;
  body?: unknown;
  throws?: Error;
};

type Recorded = {
  url: string;
  method: string;
  headers: Record<string, string>;
  body: unknown;
};

function makeStubFetch(responses: StubResponse[]): {
  fetch: typeof fetch;
  calls: Recorded[];
} {
  const calls: Recorded[] = [];
  let i = 0;
  const fetchImpl = (async (url: string | URL | Request, init?: RequestInit) => {
    const r = responses[i++];
    if (!r) throw new Error(`stub-fetch: no response queued for call ${i}`);
    const u = typeof url === 'string' ? url : url.toString();
    calls.push({
      url: u,
      method: init?.method ?? 'GET',
      headers: (init?.headers as Record<string, string>) ?? {},
      body: init?.body ? JSON.parse(init.body as string) : null,
    });
    if (r.throws) throw r.throws;
    return new Response(JSON.stringify(r.body ?? {}), {
      status: r.status,
      headers: { 'Content-Type': 'application/json' },
    });
  }) as typeof fetch;
  return { fetch: fetchImpl, calls };
}

const FROZEN_NOW = new Date('2026-05-07T10:00:00.000Z');

function buildClient(
  responses: StubResponse[],
  overrides: Partial<{
    routingRules: Partial<Record<'senior' | 'under55_family' | 'under55_solo', string>>;
    snapshotBaseUrl: string;
  }> = {}
) {
  const stub = makeStubFetch(responses);
  const client = new HttpLeadDeliveryClient({
    baseUrl: 'https://leads.vos2vis.net/api',
    apiKey: 'pk_test_key',
    secret: 'sk_test_secret',
    externalSource: 'lamutuelleseniors-tunnel-v1',
    formId: 'lamutuelleseniors-form-mutuelle-v1',
    routingRules: overrides.routingRules ?? {
      senior: 'cm_senior_rule',
      under55_family: 'cm_family_rule',
      under55_solo: 'cm_solo_rule',
    },
    snapshotBaseUrl: overrides.snapshotBaseUrl,
    fetchImpl: stub.fetch,
    now: () => FROZEN_NOW,
  });
  return { client, calls: stub.calls };
}

const tokenOk: StubResponse = {
  status: 200,
  body: {
    success: true,
    data: {
      tokenType: 'Bearer',
      accessToken: 'eyJtest.access.token',
      expiresIn: 3600,
      expiresAt: '2026-05-07T11:00:00.000Z',
    },
  },
};

const samplePayload: LeadDeliveryPayload = {
  lead_id: 'L_test_1',
  campaign_id: 'senior',
  submitted_at: '2026-05-07T10:00:00.000Z',
  identity: {
    nom: 'Dupont',
    prenom: 'Jeanne',
    date_naissance: '1955-03-12',
    code_postal: '75015',
    email: 'jeanne.dupont@example.com',
    telephone: '0612345678',
  },
  qualifications: {
    regime: 1,
  },
  consent: {
    granted_at: '2026-05-07T10:00:00.000Z',
    cgu_version: '1.1',
    pdc_version: '1.2',
    ip_address: '127.0.0.1',
    user_agent: 'vitest',
  },
};

describe('HttpLeadDeliveryClient — happy path', () => {
  it('authenticates, creates lead, returns success with provider_id', async () => {
    const { client, calls } = buildClient([
      tokenOk,
      {
        status: 201,
        body: { success: true, data: { leadId: 'cmoxxxxx0000abc123', status: 'NEW', distributed: false, isDuplicate: false } },
      },
    ]);

    const result = await client.deliver(samplePayload);

    expect(result.status).toBe('success');
    expect(result.mode).toBe('http');
    if (result.status === 'success') {
      expect(result.http_status).toBe(201);
      expect(result.provider_id).toBe('cmoxxxxx0000abc123');
    }

    expect(calls).toHaveLength(2);
    expect(calls[0].url).toBe('https://leads.vos2vis.net/api/partner/auth/token');
    expect(calls[0].body).toEqual({ apiKey: 'pk_test_key', secret: 'sk_test_secret' });

    expect(calls[1].url).toBe('https://leads.vos2vis.net/api/partner/leads');
    expect(calls[1].headers.Authorization).toBe('Bearer eyJtest.access.token');
    const body = calls[1].body as Record<string, unknown>;
    expect(body.productType).toBe('SANTE');
    expect(body.metaRoutingRuleId).toBe('cm_senior_rule');
    expect((body.prospect as Record<string, unknown>).phone).toBe('+33612345678');
    expect((body.prospect as Record<string, unknown>).age).toBe(71); // 1955-03-12 vs 2026-05-07
    expect((body.familyComposition as { members: unknown[] }).members).toEqual([
      { role: 'TITULAIRE', age: 71, regime: 'SECU_GENERAL' },
    ]);
  });

  it('treats a 200 duplicate response as success', async () => {
    const { client } = buildClient([
      tokenOk,
      {
        status: 200,
        body: { success: true, data: { leadId: 'cmo_existing', status: 'NEW', distributed: true, isDuplicate: true } },
      },
    ]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('success');
    if (result.status === 'success') {
      expect(result.http_status).toBe(200);
      expect(result.provider_id).toBe('cmo_existing');
    }
  });
});

describe('HttpLeadDeliveryClient — error handling', () => {
  it('returns permanent_failure when neither email nor phone is provided (no network call)', async () => {
    const { client, calls } = buildClient([]); // no responses queued — proves no fetch
    const result = await client.deliver({
      ...samplePayload,
      identity: {
        nom: samplePayload.identity.nom,
        prenom: samplePayload.identity.prenom,
        date_naissance: samplePayload.identity.date_naissance,
        code_postal: samplePayload.identity.code_postal,
      },
    });
    expect(result.status).toBe('permanent_failure');
    if (result.status === 'permanent_failure') {
      expect(result.reason).toBe('email_or_phone_required');
    }
    expect(calls).toHaveLength(0);
  });

  it('re-authenticates and retries once on 401 INVALID_TOKEN', async () => {
    const { client, calls } = buildClient([
      tokenOk, // first auth
      { status: 401, body: { error: { code: 'INVALID_TOKEN' } } }, // first /partner/leads
      { ...tokenOk, body: { ...(tokenOk.body as object), data: { ...(tokenOk.body as { data: object }).data, accessToken: 'eyJrefreshed.access.token' } } }, // re-auth
      { status: 201, body: { success: true, data: { leadId: 'cm_after_refresh' } } }, // retry succeeds
    ]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('success');
    if (result.status === 'success') expect(result.provider_id).toBe('cm_after_refresh');
    expect(calls).toHaveLength(4);
    expect(calls[2].url).toContain('/partner/auth/token');
    expect(calls[3].headers.Authorization).toBe('Bearer eyJrefreshed.access.token');
  });

  it('classifies 5xx as retry', async () => {
    const { client } = buildClient([tokenOk, { status: 503, body: { error: { code: 'SERVICE_UNAVAILABLE' } } }]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('retry');
    if (result.status === 'retry') expect(result.http_status).toBe(503);
  });

  it('classifies 429 rate limit as retry', async () => {
    const { client } = buildClient([tokenOk, { status: 429, body: { error: { code: 'TOO_MANY_REQUESTS' } } }]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('retry');
  });

  it('classifies 400 VALIDATION_ERROR as permanent_failure', async () => {
    const { client } = buildClient([
      tokenOk,
      {
        status: 400,
        body: { error: { code: 'VALIDATION_ERROR', message: 'Corps invalide.' } },
      },
    ]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('permanent_failure');
    if (result.status === 'permanent_failure') {
      expect(result.http_status).toBe(400);
      expect(result.reason).toBe('VALIDATION_ERROR');
    }
  });

  it('treats a network failure as retry', async () => {
    const { client } = buildClient([tokenOk, { status: 0, throws: new Error('ECONNRESET') }]);
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('retry');
    if (result.status === 'retry') expect(result.reason).toBe('ECONNRESET');
  });
});

describe('HttpLeadDeliveryClient — payload mapping', () => {
  it('routes per campaign: under55_family → its routing rule', async () => {
    const { client, calls } = buildClient([
      tokenOk,
      { status: 201, body: { success: true, data: { leadId: 'cm_x' } } },
    ]);
    await client.deliver({
      ...samplePayload,
      campaign_id: 'under55_family',
      identity: { ...samplePayload.identity, date_naissance: '1985-06-01' },
      qualifications: {
        regime: 2,
        conjoint: { date_naissance: '1987-09-15', regime: 1 },
        enfants: [
          { date_naissance: '2018-01-20', regime: 1 },
          { date_naissance: '2020-04-30', regime: 4 },
        ],
        situation_actuelle: 'aucune_mutuelle',
        date_effet_souhaitee: '2026-09-01',
        niveau_garantie: 'renforce',
      },
    });
    const body = calls[1].body as Record<string, unknown>;
    expect(body.metaRoutingRuleId).toBe('cm_family_rule');

    const members = (body.familyComposition as { members: unknown[] }).members;
    expect(members).toEqual([
      { role: 'TITULAIRE', age: 40, regime: 'TNS' },
      { role: 'CONJOINT', age: 38, regime: 'SECU_GENERAL' },
      { role: 'ENFANT', age: 8, regime: 'SECU_GENERAL' },
      { role: 'ENFANT', age: 6, regime: 'ALSACE_MOSELLE' },
    ]);

    expect(body.mutuelle).toEqual({
      currentlyInsured: false,
      targetSwitchDate: '2026-09-01T00:00:00.000Z',
    });
    expect(body.comment).toContain('renforcée');
  });

  it("omits the mutuelle block when situation is 'mutuelle_actuelle' (no insuredOverOneYear data)", async () => {
    const { client, calls } = buildClient([
      tokenOk,
      { status: 201, body: { success: true, data: { leadId: 'cm_y' } } },
    ]);
    await client.deliver({
      ...samplePayload,
      qualifications: { ...samplePayload.qualifications, situation_actuelle: 'mutuelle_actuelle' },
    });
    const body = calls[1].body as Record<string, unknown>;
    expect(body.mutuelle).toBeUndefined();
  });

  it('omits metaRoutingRuleId when no routing rule is configured for the campaign', async () => {
    const { client, calls } = buildClient(
      [tokenOk, { status: 201, body: { success: true, data: { leadId: 'cm_z' } } }],
      { routingRules: {} }
    );
    await client.deliver(samplePayload);
    const body = calls[1].body as Record<string, unknown>;
    expect(body.metaRoutingRuleId).toBeUndefined();
  });
});

describe('HttpLeadDeliveryClient — consentProof.createdTime normalization', () => {
  it('converts the SQLite "YYYY-MM-DD HH:MM:SS" timestamp to ISO 8601 with Z', async () => {
    const { client, calls } = buildClient([
      tokenOk,
      { status: 201, body: { success: true, data: { leadId: 'cm_iso' } } },
    ]);
    await client.deliver({
      ...samplePayload,
      consent: { ...samplePayload.consent, granted_at: '2026-05-07 08:41:47' },
    });
    const body = calls[1].body as { consentProof: { createdTime: string } };
    expect(body.consentProof.createdTime).toBe('2026-05-07T08:41:47.000Z');
  });

  it('passes a value already in ISO 8601 through unchanged', async () => {
    const { client, calls } = buildClient([
      tokenOk,
      { status: 201, body: { success: true, data: { leadId: 'cm_iso2' } } },
    ]);
    await client.deliver({
      ...samplePayload,
      consent: { ...samplePayload.consent, granted_at: '2026-05-07T10:00:00.000Z' },
    });
    const body = calls[1].body as { consentProof: { createdTime: string } };
    expect(body.consentProof.createdTime).toBe('2026-05-07T10:00:00.000Z');
  });
});

describe('HttpLeadDeliveryClient — token caching', () => {
  it('reuses the cached token across deliveries within its TTL', async () => {
    const { client, calls } = buildClient([
      tokenOk,
      { status: 201, body: { success: true, data: { leadId: 'cm_a' } } },
      { status: 201, body: { success: true, data: { leadId: 'cm_b' } } },
    ]);
    await client.deliver(samplePayload);
    await client.deliver({ ...samplePayload, lead_id: 'L_test_2' });
    expect(calls.filter((c) => c.url.endsWith('/partner/auth/token'))).toHaveLength(1);
    expect(calls.filter((c) => c.url.endsWith('/partner/leads'))).toHaveLength(2);
  });
});

describe('HttpLeadDeliveryClient.fromEnv', () => {
  beforeEach(() => {
    delete process.env.LEAD_DELIVERY_API_BASE_URL;
    delete process.env.LEAD_DELIVERY_API_KEY;
    delete process.env.LEAD_DELIVERY_API_SECRET;
    delete process.env.LEAD_DELIVERY_EXTERNAL_SOURCE;
    delete process.env.LEAD_DELIVERY_FORM_ID;
  });

  it('throws an explicit error when a required env var is missing', () => {
    process.env.LEAD_DELIVERY_API_BASE_URL = 'https://leads.vos2vis.net/api';
    process.env.LEAD_DELIVERY_API_KEY = 'pk_x';
    // missing LEAD_DELIVERY_API_SECRET
    expect(() => HttpLeadDeliveryClient.fromEnv()).toThrow(/LEAD_DELIVERY_API_SECRET/);
  });

  it('builds a client when all required env vars are set', () => {
    process.env.LEAD_DELIVERY_API_BASE_URL = 'https://leads.vos2vis.net/api';
    process.env.LEAD_DELIVERY_API_KEY = 'pk_x';
    process.env.LEAD_DELIVERY_API_SECRET = 'sk_y';
    process.env.LEAD_DELIVERY_EXTERNAL_SOURCE = 'src';
    process.env.LEAD_DELIVERY_FORM_ID = 'form';
    const client = HttpLeadDeliveryClient.fromEnv();
    expect(client).toBeInstanceOf(HttpLeadDeliveryClient);
  });
});

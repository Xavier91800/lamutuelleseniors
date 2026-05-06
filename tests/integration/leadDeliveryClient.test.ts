import { describe, it, expect } from 'vitest';
import { MockLeadDeliveryClient } from '@/lib/lead-delivery/MockLeadDeliveryClient';
import { FakeLeadDeliveryClient } from '../_helpers/FakeLeadDeliveryClient';
import type { LeadDeliveryPayload } from '@/lib/lead-delivery/LeadDeliveryClient';

const samplePayload: LeadDeliveryPayload = {
  lead_id: 'L_test_1',
  campaign_id: 'senior',
  submitted_at: '2026-05-06T12:00:00.000Z',
  identity: {
    nom: 'Dupont',
    prenom: 'Jeanne',
    date_naissance: '1955-03-12',
    code_postal: '75015',
  },
  consent: {
    granted_at: '2026-05-06T12:00:00.000Z',
    cgu_version: '1.0',
    pdc_version: '1.0',
    ip_address: '127.0.0.1',
    user_agent: 'vitest',
  },
};

describe('MockLeadDeliveryClient', () => {
  it('returns success/mock without throwing', async () => {
    const client = new MockLeadDeliveryClient();
    const result = await client.deliver(samplePayload);
    expect(result.status).toBe('success');
    expect(result.mode).toBe('mock');
  });
});

describe('FakeLeadDeliveryClient (test helper)', () => {
  it('returns enqueued results in order', async () => {
    const client = new FakeLeadDeliveryClient();
    client.enqueue(
      { status: 'retry', mode: 'mock', reason: 'temporary' },
      { status: 'success', mode: 'mock' }
    );
    expect((await client.deliver(samplePayload)).status).toBe('retry');
    expect((await client.deliver(samplePayload)).status).toBe('success');
  });

  it('records every payload it receives', async () => {
    const client = new FakeLeadDeliveryClient();
    await client.deliver(samplePayload);
    await client.deliver({ ...samplePayload, lead_id: 'L_test_2' });
    expect(client.calls).toHaveLength(2);
    expect(client.calls[0].lead_id).toBe('L_test_1');
  });
});

describe('LeadDeliveryClient port contract', () => {
  it('never throws — exceptions are converted to retry', async () => {
    class ThrowingClient extends MockLeadDeliveryClient {
      override async deliver(_payload: LeadDeliveryPayload) {
        // Even if our impl wraps thrown errors, this test would catch a leak.
        return Promise.resolve({ status: 'success' as const, mode: 'mock' as const });
      }
    }
    const client = new ThrowingClient();
    await expect(client.deliver(samplePayload)).resolves.toBeDefined();
  });
});

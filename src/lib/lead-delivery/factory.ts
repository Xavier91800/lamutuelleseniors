import type { LeadDeliveryClient } from './LeadDeliveryClient';
import { MockLeadDeliveryClient } from './MockLeadDeliveryClient';
import { HttpLeadDeliveryClient } from './HttpLeadDeliveryClient';

let cached: LeadDeliveryClient | null = null;

export function getLeadDeliveryClient(): LeadDeliveryClient {
  if (cached) return cached;
  const mode = process.env.LEAD_DELIVERY_MODE ?? 'mock';
  if (mode === 'http') {
    cached = new HttpLeadDeliveryClient(
      process.env.LEAD_DELIVERY_URL ?? '',
      process.env.LEAD_DELIVERY_AUTH ?? ''
    );
  } else {
    cached = new MockLeadDeliveryClient();
  }
  return cached;
}

/**
 * Test seam — replace the cached client with a fake/mock during integration tests.
 */
export function setLeadDeliveryClientForTests(client: LeadDeliveryClient): void {
  cached = client;
}

export function resetLeadDeliveryClientForTests(): void {
  cached = null;
}

import type {
  DeliveryResult,
  LeadDeliveryClient,
  LeadDeliveryPayload,
} from '@/lib/lead-delivery/LeadDeliveryClient';

/**
 * Test helper. Returns a queued sequence of DeliveryResult on each call.
 * If the queue is exhausted, falls back to the configured `defaultResult`.
 */
export class FakeLeadDeliveryClient implements LeadDeliveryClient {
  public calls: LeadDeliveryPayload[] = [];

  constructor(
    private queue: DeliveryResult[] = [],
    private defaultResult: DeliveryResult = { status: 'success', mode: 'mock' }
  ) {}

  enqueue(...results: DeliveryResult[]): void {
    this.queue.push(...results);
  }

  async deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult> {
    this.calls.push(payload);
    return this.queue.shift() ?? this.defaultResult;
  }
}

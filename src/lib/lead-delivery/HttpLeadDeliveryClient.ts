import type {
  DeliveryResult,
  LeadDeliveryClient,
  LeadDeliveryPayload,
} from './LeadDeliveryClient';

/**
 * Skeleton — to be completed once the new external lead-buying platform's
 * interface specification is delivered by the metier team. Until then, the
 * factory only instantiates this client when LEAD_DELIVERY_MODE=http and
 * BOTH LEAD_DELIVERY_URL and LEAD_DELIVERY_AUTH are set.
 */
export class HttpLeadDeliveryClient implements LeadDeliveryClient {
  constructor(
    private readonly url: string,
    private readonly auth: string
  ) {
    if (!url || !auth) {
      throw new Error('HttpLeadDeliveryClient not configured — pending external spec');
    }
  }

  async deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult> {
    // TODO: implement once the external spec lands. Until then, prefer mock mode.
    void payload;
    return {
      status: 'retry',
      mode: 'http',
      reason: 'http client not implemented yet — annex spec to contracts/lead-delivery.contract.md',
    };
  }
}

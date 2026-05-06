import type {
  DeliveryResult,
  LeadDeliveryClient,
  LeadDeliveryPayload,
} from './LeadDeliveryClient';
import { logger, redactPii } from '@/lib/logging/logger';

export class MockLeadDeliveryClient implements LeadDeliveryClient {
  async deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult> {
    logger.info(
      {
        event: 'delivery_mock',
        lead_id: payload.lead_id,
        campaign_id: payload.campaign_id,
        email: redactPii(payload.identity.email),
        telephone: redactPii(payload.identity.telephone),
      },
      'mock_delivery'
    );
    return { status: 'success', mode: 'mock' };
  }
}

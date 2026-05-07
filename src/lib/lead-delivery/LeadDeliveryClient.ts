import type { CampaignId } from '@/types/lead';

export interface LeadDeliveryPayload {
  lead_id: string;
  campaign_id: CampaignId;
  submitted_at: string;

  identity: {
    nom: string;
    prenom: string;
    date_naissance: string;
    code_postal: string;
    email?: string;
    telephone?: string;
  };

  qualifications?: {
    regime?: number;
    niveau_garantie?: 'economique' | 'equilibre' | 'renforce' | 'premium';
    situation_actuelle?: 'aucune_mutuelle' | 'mutuelle_actuelle' | 'prefere_ne_pas_dire';
    date_effet_souhaitee?: string;
    conjoint?: { date_naissance: string; regime?: number };
    enfants?: { date_naissance: string; regime?: number }[];
  };

  attribution?: {
    source_path?: string;
    utm_source?: string;
    utm_medium?: string;
    utm_campaign?: string;
    utm_term?: string;
    utm_content?: string;
  };

  consent: {
    granted_at: string;
    cgu_version: string;
    pdc_version: string;
    ip_address: string;
    user_agent: string;
  };
}

export type DeliveryResult =
  | { status: 'success'; mode: 'mock' | 'http'; http_status?: number; provider_id?: string }
  | { status: 'retry'; mode: 'mock' | 'http'; http_status?: number; reason: string }
  | { status: 'permanent_failure'; mode: 'mock' | 'http'; http_status?: number; reason: string };

export interface LeadDeliveryClient {
  /**
   * Tente la livraison du lead. NE JETTE JAMAIS — toute erreur DOIT être
   * convertie en `DeliveryResult`. Le contrat est documenté dans
   * specs/001-lead-funnel-seniors/contracts/lead-delivery.contract.md.
   */
  deliver(payload: LeadDeliveryPayload): Promise<DeliveryResult>;
}

export type CampaignId = 'senior' | 'under55_family' | 'under55_solo';

export type DeliveryStatus =
  | 'pending'
  | 'delivered'
  | 'delivered_mock'
  | 'dead_letter'
  | 'rejected_4xx';

export type NiveauGarantie = 'economique' | 'equilibre' | 'renforce' | 'premium';
export type SituationActuelle = 'aucune_mutuelle' | 'mutuelle_actuelle' | 'prefere_ne_pas_dire';

export interface LeadInput {
  nom: string;
  prenom: string;
  date_naissance: string; // YYYY-MM-DD
  code_postal: string;
  email?: string;
  telephone?: string;

  regime?: number;
  niveau_garantie?: NiveauGarantie;
  situation_actuelle?: SituationActuelle;
  insured_over_one_year?: 0 | 1; // pertinent uniquement si situation_actuelle === 'mutuelle_actuelle'
  date_effet_souhaitee?: string;

  conjoint_present?: 0 | 1;
  conjoint_date_naissance?: string;
  conjoint_regime?: number;
  enfants_dates_naissance?: string[];
  enfants_regimes?: number[]; // parallèle à enfants_dates_naissance

  source_path?: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_term?: string;
  utm_content?: string;
}

export interface LeadRow extends LeadInput {
  id: string;
  nom_normalized: string;
  prenom_normalized: string;
  enfants_count: number;
  campaign_id: CampaignId;
  age_at_submission: number;
  ip_address: string;
  user_agent: string;
  delivery_status: DeliveryStatus;
  submitted_at: string;
  created_at: string;
}

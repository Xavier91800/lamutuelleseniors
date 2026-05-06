export type LegalDocKind = 'cgu' | 'pdc' | 'mentions';

export interface LegalDocumentRow {
  id: number;
  kind: LegalDocKind;
  version: string;
  effective_at: string;
  published_at: string;
  body_path: string;
  body_hash: string;
  status: 'draft' | 'published' | 'retired';
  created_at: string;
}

export interface ConsentInput {
  data_processing: boolean;
  courtier_transmission: true; // literal — refusal short-circuits before reaching this type
  cgu_version: string;
  pdc_version: string;
}

export interface ConsentRow {
  id: string;
  lead_id: string;
  purpose_data_processing: 0 | 1;
  purpose_courtier_transmission: 1;
  cgu_document_id: number;
  pdc_document_id: number;
  cgu_version: string;
  pdc_version: string;
  cgu_body_hash: string;
  pdc_body_hash: string;
  ip_address: string;
  user_agent: string;
  granted_at: string;
}

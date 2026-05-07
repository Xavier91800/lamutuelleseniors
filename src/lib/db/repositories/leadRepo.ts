import type { Database } from 'better-sqlite3';
import { nanoid } from 'nanoid';
import { getDb } from '@/lib/db/client';
import type { CampaignId, DeliveryStatus, LeadInput, LeadRow } from '@/types/lead';

export interface LeadInsert extends LeadInput {
  campaign_id: CampaignId;
  age_at_submission: number;
  ip_address: string;
  user_agent: string;
  source_path: string;
}

const DEDUP_WINDOW_HOURS = 24;

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

export function findRecentDuplicate(
  input: Pick<LeadInsert, 'nom' | 'prenom' | 'date_naissance' | 'code_postal'>,
  db: Database = getDb()
): LeadRow | undefined {
  return db
    .prepare(
      `SELECT * FROM leads
       WHERE nom_normalized = ? AND prenom_normalized = ?
         AND date_naissance = ? AND code_postal = ?
         AND submitted_at >= datetime('now', '-' || ? || ' hours')
       ORDER BY submitted_at DESC
       LIMIT 1`
    )
    .get(
      normalize(input.nom),
      normalize(input.prenom),
      input.date_naissance,
      input.code_postal,
      DEDUP_WINDOW_HOURS
    ) as LeadRow | undefined;
}

export function insertLead(input: LeadInsert, db: Database = getDb()): { id: string } {
  const id = nanoid(21);
  db.prepare(
    `INSERT INTO leads (
      id, nom, nom_normalized, prenom, prenom_normalized,
      date_naissance, code_postal, email, telephone,
      regime, niveau_garantie, situation_actuelle, insured_over_one_year, date_effet_souhaitee,
      conjoint_present, conjoint_date_naissance, conjoint_regime,
      enfants_count, enfants_dates_naissance, enfants_regimes,
      campaign_id, age_at_submission,
      source_path, utm_source, utm_medium, utm_campaign, utm_term, utm_content,
      ip_address, user_agent
    ) VALUES (
      @id, @nom, @nom_normalized, @prenom, @prenom_normalized,
      @date_naissance, @code_postal, @email, @telephone,
      @regime, @niveau_garantie, @situation_actuelle, @insured_over_one_year, @date_effet_souhaitee,
      @conjoint_present, @conjoint_date_naissance, @conjoint_regime,
      @enfants_count, @enfants_dates_naissance, @enfants_regimes,
      @campaign_id, @age_at_submission,
      @source_path, @utm_source, @utm_medium, @utm_campaign, @utm_term, @utm_content,
      @ip_address, @user_agent
    )`
  ).run({
    id,
    nom: input.nom,
    nom_normalized: normalize(input.nom),
    prenom: input.prenom,
    prenom_normalized: normalize(input.prenom),
    date_naissance: input.date_naissance,
    code_postal: input.code_postal,
    email: input.email ?? null,
    telephone: input.telephone ?? null,
    regime: input.regime ?? null,
    niveau_garantie: input.niveau_garantie ?? null,
    situation_actuelle: input.situation_actuelle ?? null,
    insured_over_one_year: input.insured_over_one_year ?? null,
    date_effet_souhaitee: input.date_effet_souhaitee ?? null,
    conjoint_present: input.conjoint_present ?? null,
    conjoint_date_naissance: input.conjoint_date_naissance ?? null,
    conjoint_regime: input.conjoint_regime ?? null,
    enfants_count: input.enfants_dates_naissance?.length ?? 0,
    enfants_dates_naissance: input.enfants_dates_naissance
      ? JSON.stringify(input.enfants_dates_naissance)
      : null,
    enfants_regimes: input.enfants_regimes ? JSON.stringify(input.enfants_regimes) : null,
    campaign_id: input.campaign_id,
    age_at_submission: input.age_at_submission,
    source_path: input.source_path,
    utm_source: input.utm_source ?? null,
    utm_medium: input.utm_medium ?? null,
    utm_campaign: input.utm_campaign ?? null,
    utm_term: input.utm_term ?? null,
    utm_content: input.utm_content ?? null,
    ip_address: input.ip_address,
    user_agent: input.user_agent,
  });

  return { id };
}

export function findById(id: string, db: Database = getDb()): LeadRow | undefined {
  return db.prepare(`SELECT * FROM leads WHERE id = ?`).get(id) as LeadRow | undefined;
}

export function updateDeliveryStatus(
  id: string,
  status: DeliveryStatus,
  db: Database = getDb()
): void {
  db.prepare(`UPDATE leads SET delivery_status = ? WHERE id = ?`).run(status, id);
}

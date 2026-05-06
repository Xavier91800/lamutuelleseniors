import nodemailer from 'nodemailer';
import { logger, redactPii } from '@/lib/logging/logger';
import type { LeadRow } from '@/types/lead';

function shouldNotify(): boolean {
  return process.env.MAIL_NOTIFY === 'true';
}

function getTransport() {
  const user = process.env.GMAIL_USER;
  const pass = process.env.GMAIL_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });
}

export async function notifyNewLead(lead: LeadRow): Promise<void> {
  if (!shouldNotify()) {
    logger.debug({ lead_id: lead.id }, 'mail_notify_disabled');
    return;
  }
  const transport = getTransport();
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM ?? process.env.GMAIL_USER;
  if (!transport || !to || !from) {
    logger.warn({ lead_id: lead.id }, 'mail_config_incomplete');
    return;
  }

  const subject = `[Nouveau lead] ${lead.prenom} ${lead.nom} — ${lead.campaign_id}`;
  const lines = [
    `Nouveau lead capturé.`,
    ``,
    `ID : ${lead.id}`,
    `Campagne : ${lead.campaign_id}`,
    `Nom : ${lead.nom}`,
    `Prénom : ${lead.prenom}`,
    `Date de naissance : ${lead.date_naissance} (âge ${lead.age_at_submission})`,
    `Code postal : ${lead.code_postal}`,
    lead.email ? `Email : ${lead.email}` : null,
    lead.telephone ? `Téléphone : ${lead.telephone}` : null,
    lead.regime ? `Régime : ${lead.regime}` : null,
    lead.niveau_garantie ? `Niveau de garantie : ${lead.niveau_garantie}` : null,
    lead.situation_actuelle ? `Situation : ${lead.situation_actuelle}` : null,
    lead.date_effet_souhaitee ? `Date d'effet souhaitée : ${lead.date_effet_souhaitee}` : null,
    lead.conjoint_present ? `Conjoint : oui` : null,
    lead.enfants_count > 0 ? `Enfants : ${lead.enfants_count}` : null,
    ``,
    `Soumission : ${lead.submitted_at}`,
    `Source : ${lead.source_path}`,
  ].filter(Boolean);

  try {
    await transport.sendMail({
      from,
      to,
      replyTo: lead.email ?? undefined,
      subject,
      text: lines.join('\n'),
    });
    logger.info(
      { lead_id: lead.id, to: redactPii(to) },
      'mail_notify_sent'
    );
  } catch (err) {
    logger.error(
      { lead_id: lead.id, err: err instanceof Error ? err.message : String(err) },
      'mail_notify_error'
    );
  }
}

export async function notifyDeadLetter(lead: LeadRow): Promise<void> {
  if (!shouldNotify()) return;
  const transport = getTransport();
  const to = process.env.MAIL_TO;
  const from = process.env.MAIL_FROM ?? process.env.GMAIL_USER;
  if (!transport || !to || !from) return;
  await transport.sendMail({
    from,
    to,
    subject: `[ALERTE] Lead ${lead.id} non livré après plusieurs tentatives`,
    text: `Le lead ${lead.id} (${lead.prenom} ${lead.nom}, campagne ${lead.campaign_id}) n'a pas pu être livré. Statut actuel : ${lead.delivery_status}.`,
  });
}

import { appendFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { logger } from '@/lib/logging/logger';

/**
 * Audit log JSONL append-only pour les consentements RGPD.
 *
 * Chaque consentement enregistré ajoute une ligne JSON au fichier configuré
 * par `CONSENT_AUDIT_LOG_PATH`. Le défaut place le fichier à côté de la base
 * SQLite (donc dans le volume /data du conteneur, persisté par le PBS).
 *
 * Conformité : article 7 §1 RGPD (preuve de consentement). En cas de litige,
 * ce fichier est la preuve immuable, horodatée et indépendante de la base.
 *
 * Politique d'erreur : best-effort. Si l'écriture échoue (FS plein, permission,
 * etc.), on log l'erreur via pino mais on NE JAMAIS interrompt la soumission
 * du lead — la base SQLite reste la source de vérité primaire.
 */

function getAuditLogPath(): string {
  const explicit = process.env.CONSENT_AUDIT_LOG_PATH;
  if (explicit) return explicit;
  const dbPath = process.env.DATABASE_PATH ?? './.data/lamutuelleseniors.db';
  // Place l'audit log à côté de la DB (extension .log au lieu de .db)
  return dbPath.replace(/\.db$/i, '') + '-consent-audit.log';
}

export interface ConsentAuditEntry {
  consent_id: string;
  lead_id: string;
  ip_address: string;
  user_agent: string;
  cgu_version: string;
  cgu_body_hash: string;
  pdc_version: string;
  pdc_body_hash: string;
  purpose_data_processing: boolean;
  purpose_courtier_transmission: boolean;
}

export function appendConsentAudit(entry: ConsentAuditEntry): void {
  const line =
    JSON.stringify({
      ts: new Date().toISOString(),
      ...entry,
    }) + '\n';

  try {
    const path = getAuditLogPath();
    const dir = dirname(path);
    if (dir && !existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    appendFileSync(path, line, { encoding: 'utf8', mode: 0o640 });
  } catch (err) {
    logger.error(
      {
        event: 'consent_audit_log_write_failed',
        err: err instanceof Error ? err.message : String(err),
      },
      'consent_audit_log_write_failed'
    );
    // On ne propage pas l'erreur — l'audit log est best-effort.
  }
}

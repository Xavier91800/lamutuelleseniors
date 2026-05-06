export const HONEYPOT_FIELD = 'hp_zip';

export function isHoneypotTriggered(body: Record<string, unknown>): boolean {
  const value = body?.[HONEYPOT_FIELD];
  if (value === undefined || value === null) return false;
  return typeof value === 'string' && value.trim().length > 0;
}

export const MIN_TIME_ON_FORM_MS = 4_000;

export function isTooFast(tunnelStartedAtMs: number, now: number = Date.now()): boolean {
  if (!Number.isFinite(tunnelStartedAtMs)) return false;
  return now - tunnelStartedAtMs < MIN_TIME_ON_FORM_MS;
}

import pino from 'pino';

const level = process.env.LOG_LEVEL ?? 'info';

export const logger = pino({
  level,
  base: { app: 'lamutuelleseniors' },
  timestamp: pino.stdTimeFunctions.isoTime,
});

/**
 * Mask a personal-data string keeping only the first few characters.
 * Used in logs to avoid leaking emails, phone numbers, etc.
 */
export function redactPii(value: string | undefined | null, keep = 3): string | undefined {
  if (!value) return undefined;
  if (value.length <= keep) return '***';
  return `${value.slice(0, keep)}***`;
}

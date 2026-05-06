/**
 * Exponential backoff schedule (in seconds) per attempt number.
 * Index 0 unused; attempt 1 → BACKOFF_SECONDS[1], etc.
 */
const BACKOFF_SECONDS = [
  0,
  60,         // 1 → 1 min
  5 * 60,     // 2 → 5 min
  15 * 60,    // 3 → 15 min
  60 * 60,    // 4 → 1 h
  6 * 60 * 60, // 5 → 6 h
  24 * 60 * 60, // 6 → 24 h
];

export const MAX_ATTEMPTS = BACKOFF_SECONDS.length - 1;

const JITTER = 0.1; // ±10%

export function nextRetryAt(attemptNo: number, now: Date = new Date()): Date | null {
  if (attemptNo < 1 || attemptNo > MAX_ATTEMPTS) return null;
  const base = BACKOFF_SECONDS[attemptNo];
  const jitter = base * JITTER * (Math.random() * 2 - 1);
  const delaySeconds = Math.max(1, base + jitter);
  return new Date(now.getTime() + delaySeconds * 1000);
}

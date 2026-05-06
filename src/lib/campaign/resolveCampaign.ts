import type { CampaignId } from '@/types/lead';

export interface ResolveCampaignInput {
  age: number;
  conjoint_present: 0 | 1;
  enfants_count: number;
}

export const SENIOR_AGE_THRESHOLD = 55;

/**
 * Implements FR-028:
 *   age >= 55                              -> 'senior'
 *   age <  55 && (conjoint || enfants > 0) -> 'under55_family'
 *   age <  55 && solo                      -> 'under55_solo'
 */
export function resolveCampaign(input: ResolveCampaignInput): CampaignId {
  if (input.age >= SENIOR_AGE_THRESHOLD) return 'senior';
  if (input.conjoint_present === 1 || input.enfants_count > 0) return 'under55_family';
  return 'under55_solo';
}

export function computeAge(dateNaissanceIso: string, now: Date = new Date()): number {
  const dob = new Date(dateNaissanceIso);
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) {
    age -= 1;
  }
  return age;
}

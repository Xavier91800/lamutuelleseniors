import { getPublished } from '@/lib/db/repositories/legalDocRepo';

export function getCurrentLegalVersions() {
  return {
    cgu: getPublished('cgu'),
    pdc: getPublished('pdc'),
    mentions: getPublished('mentions'),
  };
}

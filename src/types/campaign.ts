import type { CampaignId } from './lead';

export interface CampaignDescriptor {
  id: CampaignId;
  label: string;
  description: string;
}

export const CAMPAIGNS: Record<CampaignId, CampaignDescriptor> = {
  senior: {
    id: 'senior',
    label: 'Senior',
    description: 'Visiteurs de 55 ans et plus.',
  },
  under55_family: {
    id: 'under55_family',
    label: 'Moins de 55 ans avec famille',
    description: 'Visiteurs de moins de 55 ans avec un conjoint et/ou des enfants à couvrir.',
  },
  under55_solo: {
    id: 'under55_solo',
    label: 'Moins de 55 ans, seul(e)',
    description: 'Visiteurs de moins de 55 ans sans composition familiale à couvrir.',
  },
};

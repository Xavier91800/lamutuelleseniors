export type SiteConfig = {
  siteName: string;
  legalEntity: string;
  legalAddress: string;
  email: string;
  dpoName: string;
  dpoEmail: string;
  baseUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  logoPath: string;
};

const fallback = {
  siteName: 'La Mutuelle Seniors',
  legalEntity: '[ENTITE_LEGALE]',
  legalAddress: '[ADRESSE_LEGALE]',
  email: '[EMAIL_CONTACT]',
  dpoName: '[NOM_DPO]',
  dpoEmail: '[EMAIL_DPO]',
  baseUrl: 'https://www.la-mutuelle-seniors.fr',
  colorPrimary: '#1F4FA0',
  colorSecondary: '#F37021',
  logoPath: '/images/logo.png',
} as const;

export const siteConfig: SiteConfig = {
  siteName: process.env.SITE_NAME ?? fallback.siteName,
  legalEntity: process.env.SITE_LEGAL_ENTITY ?? fallback.legalEntity,
  legalAddress: process.env.SITE_LEGAL_ADDRESS ?? fallback.legalAddress,
  email: process.env.SITE_EMAIL ?? fallback.email,
  dpoName: process.env.SITE_DPO_NAME ?? fallback.dpoName,
  dpoEmail: process.env.SITE_DPO_EMAIL ?? fallback.dpoEmail,
  baseUrl: process.env.SITE_BASE_URL ?? fallback.baseUrl,
  colorPrimary: process.env.SITE_COLOR_PRIMARY ?? fallback.colorPrimary,
  colorSecondary: process.env.SITE_COLOR_SECONDARY ?? fallback.colorSecondary,
  logoPath: process.env.SITE_LOGO_PATH ?? fallback.logoPath,
};

export type SiteConfig = {
  siteName: string;
  legalEntity: string;
  legalAddress: string;
  phone: string;
  email: string;
  dpoEmail: string;
  baseUrl: string;
  colorPrimary: string;
  colorSecondary: string;
  logoPath: string;
};

const fallback = {
  siteName: 'La Mutuelle Seniors',
  legalEntity: 'TODO_LEGAL_ENTITY',
  legalAddress: 'TODO_LEGAL_ADDRESS',
  phone: 'TODO_PHONE',
  email: 'TODO_EMAIL',
  dpoEmail: 'TODO_DPO_EMAIL',
  baseUrl: 'https://www.la-mutuelle-seniors.fr',
  colorPrimary: '#1F4FA0',
  colorSecondary: '#FFB400',
  logoPath: '/images/logo-placeholder.svg',
} as const;

export const siteConfig: SiteConfig = {
  siteName: process.env.SITE_NAME ?? fallback.siteName,
  legalEntity: process.env.SITE_LEGAL_ENTITY ?? fallback.legalEntity,
  legalAddress: process.env.SITE_LEGAL_ADDRESS ?? fallback.legalAddress,
  phone: process.env.SITE_PHONE ?? fallback.phone,
  email: process.env.SITE_EMAIL ?? fallback.email,
  dpoEmail: process.env.SITE_DPO_EMAIL ?? fallback.dpoEmail,
  baseUrl: process.env.SITE_BASE_URL ?? fallback.baseUrl,
  colorPrimary: process.env.SITE_COLOR_PRIMARY ?? fallback.colorPrimary,
  colorSecondary: process.env.SITE_COLOR_SECONDARY ?? fallback.colorSecondary,
  logoPath: process.env.SITE_LOGO_PATH ?? fallback.logoPath,
};

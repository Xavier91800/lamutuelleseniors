import type { NextConfig } from 'next';

const plausibleHost = process.env.PLAUSIBLE_HOST ?? 'https://plausible.io';

// Content Security Policy — locks the site to first-party assets and the
// Plausible analytics endpoint. Adjust here when adding new third-party scripts.
const csp = [
  `default-src 'self'`,
  // Next.js inlines small bootstrap scripts in dev; in production we keep
  // 'unsafe-inline' for the framework's own JSON-LD / hydration data and
  // restrict the rest tightly.
  `script-src 'self' 'unsafe-inline' ${plausibleHost}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob:`,
  `font-src 'self' data:`,
  `connect-src 'self' ${plausibleHost}`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
].join('; ');

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'Content-Security-Policy', value: csp },
];

const nextConfig: NextConfig = {
  output: 'standalone',
  poweredByHeader: false,
  reactStrictMode: true,
  compress: true,
  images: {
    remotePatterns: [],
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;

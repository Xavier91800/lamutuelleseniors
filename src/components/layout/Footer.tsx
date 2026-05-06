import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { PRIMARY_LANDINGS } from '@/config/seo';
import { MARKETING } from '@/config/marketing';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{siteConfig.siteName}</h2>
            <p className="mt-3 text-base text-gray-600">
              Service gratuit et sans engagement de mise en relation avec des courtiers
              en assurance partenaires, spécialisés dans la mutuelle santé senior.
            </p>
            <p className="mt-4 text-sm text-gray-500">
              Intermédiaire en assurance immatriculé à l&apos;ORIAS sous le numéro{' '}
              <strong className="text-gray-700">{siteConfig.orias}</strong>.
            </p>
          </div>
          <nav aria-label="Informations légales">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Informations légales
            </h3>
            <ul className="mt-4 space-y-3 text-base">
              <li>
                <Link
                  href="/conditions-generales"
                  className="text-gray-600 hover:text-[var(--color-brand)]"
                >
                  Conditions générales d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-de-confidentialite"
                  className="text-gray-600 hover:text-[var(--color-brand)]"
                >
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-gray-600 hover:text-[var(--color-brand)]"
                >
                  Mentions légales
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Nos guides">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Nos guides
            </h3>
            <ul className="mt-4 space-y-3 text-base">
              {PRIMARY_LANDINGS.slice(0, 5).map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/${p.slug}`}
                    className="text-gray-600 hover:text-[var(--color-brand)]"
                  >
                    {p.h1.split(':')[0].trim()}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Contact
            </h3>
            <p className="mt-4 text-base text-gray-700">{siteConfig.legalEntity}</p>
            <p className="mt-1 text-sm text-gray-600">{siteConfig.legalAddress}</p>
            <p className="mt-3 text-base">
              <a
                href={MARKETING.TEL_HREF}
                className="font-semibold text-[var(--color-brand)] hover:underline"
              >
                {MARKETING.TEL}
              </a>
              <span className="block text-sm text-gray-500">
                {MARKETING.TEL_HORAIRES}
              </span>
            </p>
            <p className="mt-3 text-base">
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-gray-600 hover:text-[var(--color-brand)]"
              >
                {siteConfig.email}
              </a>
            </p>
          </div>
        </div>
        <p className="mt-12 text-center text-xs text-gray-500">
          © {year} {siteConfig.siteName}. Tous droits réservés. ORIAS&nbsp;:{' '}
          {siteConfig.orias}.
        </p>
      </div>
    </footer>
  );
}

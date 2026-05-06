import Link from 'next/link';
import { siteConfig } from '@/config/site';
import { PRIMARY_LANDINGS } from '@/config/seo';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{siteConfig.siteName}</h2>
            <p className="mt-2 text-sm text-gray-600">
              Service gratuit et sans engagement de mise en relation avec des courtiers en assurance partenaires.
            </p>
          </div>
          <nav aria-label="Liens informations légales">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Informations légales
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/conditions-generales" className="text-gray-600 hover:text-[var(--color-brand)]">
                  Conditions générales d&apos;utilisation
                </Link>
              </li>
              <li>
                <Link href="/politique-de-confidentialite" className="text-gray-600 hover:text-[var(--color-brand)]">
                  Politique de confidentialité
                </Link>
              </li>
              <li>
                <Link href="/mentions-legales" className="text-gray-600 hover:text-[var(--color-brand)]">
                  Mentions légales
                </Link>
              </li>
            </ul>
          </nav>
          <nav aria-label="Nos guides">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
              Nos guides
            </h3>
            <ul className="mt-3 space-y-2 text-sm">
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
            <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">Contact</h3>
            <p className="mt-3 text-sm text-gray-600">{siteConfig.legalEntity}</p>
            <p className="text-sm text-gray-600">{siteConfig.email}</p>
          </div>
        </div>
        <p className="mt-10 text-center text-xs text-gray-500">
          © {year} {siteConfig.siteName}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

export function Header() {
  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil">
          <Image
            src={siteConfig.logoPath}
            alt={siteConfig.siteName}
            width={200}
            height={48}
            priority
          />
        </Link>
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-6 text-base font-medium">
            <li>
              <Link href="/mutuelle-senior" className="text-gray-700 hover:text-[var(--color-brand)]">
                Mutuelle senior
              </Link>
            </li>
            <li>
              <Link href="/comparatif-mutuelle-senior" className="text-gray-700 hover:text-[var(--color-brand)]">
                Comparatif
              </Link>
            </li>
            <li>
              <Link
                href="/tunnel"
                className="rounded-lg bg-[var(--color-brand)] px-5 py-3 text-white shadow-sm hover:bg-[var(--color-brand-dark)]"
              >
                Obtenir mon devis
              </Link>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

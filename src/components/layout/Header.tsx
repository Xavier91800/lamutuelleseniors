'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { siteConfig } from '@/config/site';

const GUIDES = [
  {
    href: '/observatoire-mutuelle-senior',
    title: 'Observatoire mutuelle senior',
    description: 'Synthèse des publications publiques sur le marché.',
  },
  {
    href: '/verites-augmentation-mutuelles-senior',
    title: 'Vérités cachées de la flambée des cotisations',
    description: '4 vérités publiques mais peu vulgarisées sur la hausse.',
  },
  {
    href: '/cout-mutuelle-senior',
    title: 'Combien coûte une mutuelle senior ?',
    description: 'Tarifs par âge, hausses 2025, leviers pour économiser.',
  },
  {
    href: '/resilier-mutuelle-senior',
    title: 'Résilier sa mutuelle senior',
    description: 'Guide pratique post-loi du 14 juillet 2019.',
  },
  {
    href: '/lexique-mutuelle',
    title: 'Lexique mutuelle santé',
    description: 'BR, BRSS, OPTAM, 100 % santé… expliqués simplement.',
  },
  {
    href: '/sources',
    title: 'Sources & ressources institutionnelles',
    description: 'DREES, INSEE, CNIL, Ameli, Service-Public…',
  },
];

const MAIN_NAV = [
  { href: '/mutuelle-senior', label: 'Mutuelle senior' },
  { href: '/comparatif-mutuelle-senior', label: 'Comparatif' },
];

export function Header() {
  const [guidesOpen, setGuidesOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const guidesRef = useRef<HTMLLIElement>(null);

  // Close desktop dropdown on outside click
  useEffect(() => {
    if (!guidesOpen) return;
    function handleClick(e: MouseEvent) {
      if (guidesRef.current && !guidesRef.current.contains(e.target as Node)) {
        setGuidesOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [guidesOpen]);

  // Close menus on Escape
  useEffect(() => {
    if (!guidesOpen && !mobileOpen) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setGuidesOpen(false);
        setMobileOpen(false);
      }
    }
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [guidesOpen, mobileOpen]);

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-3" aria-label="Accueil">
          <Image
            src={siteConfig.logoPath}
            alt={siteConfig.siteName}
            width={180}
            height={72}
            priority
            className="h-12 w-auto sm:h-14"
          />
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Navigation principale" className="hidden md:block">
          <ul className="flex items-center gap-6 text-base font-medium">
            {MAIN_NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="text-gray-700 hover:text-[var(--color-brand)]"
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li ref={guidesRef} className="relative">
              <button
                type="button"
                onClick={() => setGuidesOpen((v) => !v)}
                aria-expanded={guidesOpen}
                aria-haspopup="true"
                className="flex items-center gap-1 text-gray-700 hover:text-[var(--color-brand)]"
              >
                Guides
                <svg
                  aria-hidden="true"
                  className={`h-4 w-4 transition-transform ${guidesOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth="2.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {guidesOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-50 mt-3 w-80 origin-top-right rounded-xl border border-gray-200 bg-white py-2 shadow-lg"
                >
                  {GUIDES.map((g) => (
                    <Link
                      key={g.href}
                      href={g.href}
                      role="menuitem"
                      onClick={() => setGuidesOpen(false)}
                      className="block px-4 py-3 hover:bg-gray-50"
                    >
                      <p className="text-base font-semibold text-gray-900">
                        {g.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-600">{g.description}</p>
                    </Link>
                  ))}
                </div>
              )}
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

        {/* Mobile hamburger */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-menu"
          aria-label={mobileOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
          className="inline-flex items-center justify-center rounded-md p-2 text-gray-700 hover:bg-gray-100 md:hidden"
        >
          {mobileOpen ? (
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg
              aria-hidden="true"
              className="h-7 w-7"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile panel */}
      {mobileOpen && (
        <nav
          id="mobile-menu"
          aria-label="Navigation mobile"
          className="border-t border-gray-200 bg-white md:hidden"
        >
          <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <ul className="space-y-2">
              {MAIN_NAV.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-md px-4 py-3 text-base font-semibold text-gray-800 hover:bg-gray-50"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t border-gray-200 pt-4">
              <p className="px-4 text-xs font-semibold uppercase tracking-wide text-gray-500">
                Guides
              </p>
              <ul className="mt-2 space-y-1">
                {GUIDES.map((g) => (
                  <li key={g.href}>
                    <Link
                      href={g.href}
                      onClick={() => setMobileOpen(false)}
                      className="block rounded-md px-4 py-3 hover:bg-gray-50"
                    >
                      <span className="block text-base font-semibold text-gray-900">
                        {g.title}
                      </span>
                      <span className="mt-1 block text-sm text-gray-600">
                        {g.description}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6">
              <Link
                href="/tunnel"
                onClick={() => setMobileOpen(false)}
                className="block w-full rounded-lg bg-[var(--color-brand)] px-5 py-4 text-center text-lg font-bold text-white shadow-sm hover:bg-[var(--color-brand-dark)]"
              >
                Obtenir mon devis →
              </Link>
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

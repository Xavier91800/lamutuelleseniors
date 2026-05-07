import Link from 'next/link';
import { BreadcrumbListJsonLd, FAQPageJsonLd, type FAQItem } from '@/components/seo/JsonLd';
import { PRIMARY_LANDINGS, type PrimaryLanding } from '@/config/seo';

export interface LandingSection {
  h2: string;
  body: React.ReactNode;
}

interface LandingPageProps {
  config: PrimaryLanding;
  sections: LandingSection[];
  faqs?: FAQItem[];
}

export function LandingPage({ config, sections, faqs }: LandingPageProps) {
  const related = PRIMARY_LANDINGS.filter((p) => p.slug !== config.slug).slice(0, 3);

  return (
    <>
      <BreadcrumbListJsonLd
        items={[
          { name: 'Accueil', url: '/' },
          { name: config.h1, url: `/${config.slug}` },
        ]}
      />
      {faqs && faqs.length > 0 && <FAQPageJsonLd faqs={faqs} />}

      {/* Hero */}
      <section className="bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] text-white">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-widest text-white/80">
            <Link href="/" className="hover:underline">
              Accueil
            </Link>{' '}
            / {config.h1.split(':')[0].trim()}
          </p>
          <h1 className="mt-3 text-3xl font-bold sm:text-4xl lg:text-5xl">{config.h1}</h1>
          <p className="mt-6 text-lg text-white/90 sm:text-xl">{config.intro}</p>
          <Link
            href="/tunnel"
            className="mt-8 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-7 py-3 text-base font-semibold text-gray-900 shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Obtenir mon devis gratuit →
          </Link>
        </div>
      </section>

      {/* Sections rédactionnelles */}
      <article className="bg-white py-16">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          {sections.map((s) => (
            <section key={s.h2} className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">{s.h2}</h2>
              <div className="prose prose-lg mt-4 max-w-none text-gray-700">{s.body}</div>
            </section>
          ))}
        </div>
      </article>

      {/* FAQ */}
      {faqs && faqs.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">Questions fréquentes</h2>
            <dl className="mt-8 divide-y divide-gray-200">
              {faqs.map((f) => (
                <div key={f.question} className="py-5">
                  <dt className="text-lg font-semibold text-gray-900">{f.question}</dt>
                  <dd className="mt-2 text-base text-gray-700">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </div>
        </section>
      )}

      {/* Maillage interne */}
      {related.length > 0 && (
        <section className="bg-white py-12">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-xl font-semibold text-gray-900">Pour aller plus loin</h2>
            <ul className="mt-4 grid gap-4 sm:grid-cols-3">
              {related.map((r) => (
                <li key={r.slug} className="rounded-lg border border-gray-200 p-5 hover:border-[var(--color-brand)]">
                  <Link href={`/${r.slug}`} className="font-medium text-[var(--color-brand)] hover:underline">
                    {r.h1.split(':')[0].trim()} →
                  </Link>
                  <p className="mt-2 text-sm text-gray-600">{r.description}</p>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {/* Final CTA */}
      <section className="bg-gradient-to-br from-[var(--color-brand)] to-[var(--color-brand-dark)] py-12 text-white">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">Prêt·e à comparer ?</h2>
          <p className="mt-3 text-base text-white/90">
            Quelques questions suffisent — c’est gratuit et sans engagement.
          </p>
          <Link
            href="/tunnel"
            className="mt-6 inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--color-accent)] px-7 py-3 text-base font-semibold text-gray-900 shadow-lg hover:bg-[var(--color-accent-dark)]"
          >
            Démarrer mon comparatif
          </Link>
        </div>
      </section>
    </>
  );
}

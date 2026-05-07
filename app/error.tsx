'use client';

import Link from 'next/link';
import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error('app_error_boundary', { message: error.message, digest: error.digest });
  }, [error]);

  return (
    <section className="mx-auto max-w-2xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <p className="text-sm font-semibold uppercase tracking-widest text-gray-500">Erreur 500</p>
      <h1 className="mt-3 text-4xl font-bold text-gray-900 sm:text-5xl">
        Une erreur est survenue
      </h1>
      <p className="mt-6 text-lg text-gray-600">
        Un incident technique nous empêche d&apos;afficher cette page. Nos équipes ont été
        informées. Vous pouvez réessayer ou revenir à l&apos;accueil.
      </p>
      {error.digest && (
        <p className="mt-3 text-xs text-gray-400">Référence : {error.digest}</p>
      )}
      <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center sm:gap-4">
        <button
          type="button"
          onClick={reset}
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg bg-[var(--color-brand)] px-6 py-3 text-base font-semibold text-white hover:bg-[var(--color-brand-dark)]"
        >
          Réessayer
        </button>
        <Link
          href="/"
          className="inline-flex min-h-[48px] items-center justify-center rounded-lg border-2 border-[var(--color-brand)] bg-white px-6 py-3 text-base font-semibold text-[var(--color-brand)] hover:bg-blue-50"
        >
          Retour à l&apos;accueil
        </Link>
      </div>
    </section>
  );
}

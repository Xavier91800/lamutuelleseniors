'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

const COOKIE_KEY = 'lms.cookies.consent.v1';

type Decision = 'accept_all' | 'refuse_all' | 'custom';

interface ConsentRecord {
  decision: Decision;
  categories?: { analytics?: boolean; marketing?: boolean };
  ts: string;
  sessionId?: string;
}

function readConsent(): ConsentRecord | null {
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    return raw ? (JSON.parse(raw) as ConsentRecord) : null;
  } catch {
    return null;
  }
}

function persistConsent(record: ConsentRecord) {
  try {
    localStorage.setItem(COOKIE_KEY, JSON.stringify(record));
    window.dispatchEvent(new CustomEvent('lms:consent-changed'));
  } catch {
    /* ignore */
  }
}

async function reportConsent(record: ConsentRecord) {
  try {
    await fetch('/api/consent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        client_session_id: record.sessionId ?? null,
        decision: record.decision,
        categories: record.categories ?? {},
      }),
    });
  } catch {
    /* best-effort */
  }
}

function newSessionId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `cs_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`;
  }
  return `cs_${Math.random().toString(36).slice(2, 12)}`;
}

export function CookieBanner() {
  const [hidden, setHidden] = useState(true);
  const [showCustom, setShowCustom] = useState(false);
  const [analytics, setAnalytics] = useState(false);

  useEffect(() => {
    const existing = readConsent();
    if (!existing) setHidden(false);
  }, []);

  function decide(decision: Decision, custom?: ConsentRecord['categories']) {
    const record: ConsentRecord = {
      decision,
      categories: custom ?? (decision === 'accept_all' ? { analytics: true, marketing: true } : { analytics: false, marketing: false }),
      ts: new Date().toISOString(),
      sessionId: newSessionId(),
    };
    persistConsent(record);
    void reportConsent(record);
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <aside
      role="dialog"
      aria-modal="false"
      aria-labelledby="cookie-banner-title"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-gray-200 bg-white shadow-[0_-6px_24px_rgba(0,0,0,0.08)]"
    >
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
        <div className="text-sm leading-6 text-gray-700">
          <p id="cookie-banner-title" className="font-semibold text-gray-900">
            Vos préférences en matière de cookies
          </p>
          <p className="mt-1">
            Nous utilisons un outil d’analyse d’audience respectueux de votre vie privée pour
            comprendre comment notre site est utilisé. Vous pouvez accepter, refuser, ou
            personnaliser. Voir notre{' '}
            <Link
              href="/politique-de-confidentialite"
              className="font-medium underline hover:text-[var(--color-brand)]"
            >
              Politique de confidentialité
            </Link>
            .
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-3">
          <button
            type="button"
            onClick={() => decide('refuse_all')}
            className="min-h-[44px] rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Refuser
          </button>
          <button
            type="button"
            onClick={() => setShowCustom((s) => !s)}
            className="min-h-[44px] rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            aria-expanded={showCustom}
            aria-controls="cookie-customize"
          >
            Personnaliser
          </button>
          <button
            type="button"
            onClick={() => decide('accept_all')}
            className="min-h-[44px] rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
          >
            Tout accepter
          </button>
        </div>
      </div>

      {showCustom && (
        <div id="cookie-customize" className="border-t border-gray-100 bg-gray-50">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <label className="flex items-center gap-3 text-sm text-gray-800">
              <input
                type="checkbox"
                checked={analytics}
                onChange={(e) => setAnalytics(e.target.checked)}
                className="h-5 w-5"
              />
              <span>
                <strong>Mesure d’audience</strong> — comprendre comment le site est utilisé. Aucun
                cookie tiers, aucune donnée vendue.
              </span>
            </label>
            <button
              type="button"
              onClick={() => decide('custom', { analytics, marketing: false })}
              className="min-h-[44px] rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--color-brand-dark)]"
            >
              Enregistrer mes choix
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}

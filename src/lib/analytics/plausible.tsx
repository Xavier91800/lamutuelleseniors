'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const COOKIE_KEY = 'lms.cookies.consent.v1';

interface ConsentRecord {
  decision: 'accept_all' | 'refuse_all' | 'custom';
  categories?: { analytics?: boolean; marketing?: boolean };
}

function readConsent(): ConsentRecord | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem(COOKIE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as ConsentRecord;
  } catch {
    return null;
  }
}

function isAnalyticsAllowed(c: ConsentRecord | null): boolean {
  if (!c) return false;
  if (c.decision === 'accept_all') return true;
  if (c.decision === 'refuse_all') return false;
  return Boolean(c.categories?.analytics);
}

export function PlausibleScript() {
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    setAllowed(isAnalyticsAllowed(readConsent()));
    function onStorage(e: StorageEvent) {
      if (e.key === COOKIE_KEY) {
        setAllowed(isAnalyticsAllowed(readConsent()));
      }
    }
    window.addEventListener('storage', onStorage);
    function onLocal() {
      setAllowed(isAnalyticsAllowed(readConsent()));
    }
    window.addEventListener('lms:consent-changed', onLocal);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('lms:consent-changed', onLocal);
    };
  }, []);

  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? 'www.la-mutuelle-seniors.fr';
  const host = process.env.NEXT_PUBLIC_PLAUSIBLE_HOST ?? 'https://plausible.io';

  if (!allowed) return null;
  return (
    <Script
      src={`${host}/js/script.js`}
      data-domain={domain}
      strategy="afterInteractive"
      defer
    />
  );
}

/**
 * Track a custom event when analytics consent is granted.
 * No-op otherwise.
 */
export function trackEvent(name: string, props?: Record<string, string | number | boolean>) {
  if (typeof window === 'undefined') return;
  if (!isAnalyticsAllowed(readConsent())) return;
  // @ts-expect-error — plausible is injected by the script tag
  if (typeof window.plausible === 'function') {
    // @ts-expect-error — plausible API runtime-typed
    window.plausible(name, props ? { props } : undefined);
  }
}

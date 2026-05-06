'use client';

import { useEffect, useRef, useState } from 'react';

export interface TunnelDraft {
  values: Record<string, unknown>;
  step: number;
  startedAtMs: number;
  sessionId: string;
}

const STORAGE_KEY = 'lms.tunnel.draft.v1';

function newSessionId(): string {
  // Web Crypto random — no PII
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `cs_${crypto.randomUUID().replace(/-/g, '').slice(0, 18)}`;
  }
  return `cs_${Math.random().toString(36).slice(2, 12)}${Math.random().toString(36).slice(2, 8)}`;
}

export function useTunnelState() {
  const [hydrated, setHydrated] = useState(false);
  const draftRef = useRef<TunnelDraft | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as TunnelDraft;
        if (parsed && parsed.startedAtMs && parsed.sessionId) {
          draftRef.current = parsed;
        }
      }
    } catch {
      /* ignore corrupt */
    }
    if (!draftRef.current) {
      draftRef.current = {
        values: {},
        step: 0,
        startedAtMs: Date.now(),
        sessionId: newSessionId(),
      };
      persist();
    }
    setHydrated(true);
  }, []);

  function persist() {
    try {
      if (draftRef.current) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(draftRef.current));
      }
    } catch {
      /* ignore quota errors */
    }
  }

  function update(patch: Record<string, unknown>) {
    if (!draftRef.current) return;
    draftRef.current.values = { ...draftRef.current.values, ...patch };
    persist();
  }

  function setStep(step: number) {
    if (!draftRef.current) return;
    draftRef.current.step = step;
    persist();
  }

  function clear() {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    draftRef.current = null;
  }

  return {
    hydrated,
    get draft() {
      return draftRef.current;
    },
    update,
    setStep,
    clear,
  };
}

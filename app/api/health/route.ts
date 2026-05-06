import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db/client';

const startedAt = Date.now();

export async function GET(): Promise<NextResponse> {
  try {
    const db = getDb();
    const row = db.prepare(`SELECT count(*) as n FROM _migrations`).get() as { n: number };
    return NextResponse.json({
      status: 'ok',
      version: process.env.GIT_SHA ?? 'dev',
      uptime_s: Math.round((Date.now() - startedAt) / 1000),
      db: 'up',
      migrations_applied: row.n,
    });
  } catch (err) {
    const reason = err instanceof Error ? err.message : 'unknown';
    return NextResponse.json(
      { status: 'degraded', db: 'down', reason },
      { status: 503 }
    );
  }
}

export const dynamic = 'force-dynamic';

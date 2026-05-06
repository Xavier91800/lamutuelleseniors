import { NextResponse } from 'next/server';
import { getPublished } from '@/lib/db/repositories/legalDocRepo';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(): Promise<NextResponse> {
  try {
    const cgu = getPublished('cgu');
    const pdc = getPublished('pdc');
    return NextResponse.json({
      cgu_version: cgu.version,
      cgu_effective_at: cgu.effective_at,
      pdc_version: pdc.version,
      pdc_effective_at: pdc.effective_at,
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'error', reason: err instanceof Error ? err.message : 'unknown' },
      { status: 503 }
    );
  }
}

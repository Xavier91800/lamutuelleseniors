import { NextResponse } from 'next/server';
import { runRetryCycle } from '@/lib/retry/retryWorker';
import { logger } from '@/lib/logging/logger';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  const expected = process.env.RETRY_CRON_TOKEN;
  if (!expected) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }
  const token = request.headers.get('x-cron-token');
  if (token !== expected) {
    return NextResponse.json({ status: 'unauthorized' }, { status: 401 });
  }

  let limit = 50;
  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    if (typeof body.limit === 'number' && body.limit > 0) {
      limit = Math.min(body.limit, 200);
    }
  } catch {
    /* ignore */
  }

  try {
    const summary = await runRetryCycle(limit);
    return NextResponse.json(summary);
  } catch (err) {
    logger.error(
      { err: err instanceof Error ? err.message : String(err) },
      'retry_cycle_error'
    );
    return NextResponse.json({ status: 'error' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { z } from 'zod';
import { insertEvent } from '@/lib/db/repositories/eventRepo';
import { logger } from '@/lib/logging/logger';

const bodySchema = z.object({
  client_session_id: z.string().nullable().optional(),
  decision: z.enum(['accept_all', 'refuse_all', 'custom']),
  categories: z
    .object({
      analytics: z.boolean().optional(),
      marketing: z.boolean().optional(),
    })
    .optional(),
});

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function POST(request: Request): Promise<NextResponse> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'invalid', errors: [{ field: '_root', message: 'JSON invalide' }] },
      { status: 400 }
    );
  }

  const parsed = bodySchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json(
      {
        status: 'invalid',
        errors: parsed.error.issues.map((i) => ({ field: i.path.join('.'), message: i.message })),
      },
      { status: 400 }
    );
  }

  try {
    insertEvent({
      event: 'cookie_consent',
      client_session_id: parsed.data.client_session_id ?? null,
      metadata: {
        decision: parsed.data.decision,
        categories: parsed.data.categories ?? {},
      },
    });
  } catch (err) {
    logger.warn(
      { err: err instanceof Error ? err.message : String(err) },
      'consent_event_persist_failed'
    );
  }

  return NextResponse.json({ status: 'ok' });
}

import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/redis';
import { INTERNAL_SECRET_HEADER, getInternalSecret } from '@/lib/internal-secret';

/**
 * Internal session lookup for Edge middleware (login-loop fix, 2026-10-30).
 *
 * Middleware runs on the Edge Runtime and cannot use mysql2, so it POSTs
 * the sessionId here and this Node-runtime route checks the Sessions table
 * (lib/redis.ts). Middleware skips /api paths, so this route is never
 * intercepted by middleware itself.
 *
 * Safety: callers must send the shared internal secret header
 * (INTERNAL_API_SECRET / SESSION_SECRET env; see lib/internal-secret.ts for
 * the fallback behaviour and its limits). Even with a valid header this
 * route only answers "is this unguessable UUID session alive, and whose is
 * it" — it issues nothing and changes nothing.
 *
 * POST { "sessionId": "..." } -> 200 { "session": UserSession | null }
 */
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  if (req.headers.get(INTERNAL_SECRET_HEADER) !== getInternalSecret()) {
    return NextResponse.json({ session: null }, { status: 401 });
  }

  let sessionId = '';
  try {
    const body: any = await req.json();
    sessionId = typeof body?.sessionId === 'string' ? body.sessionId : '';
  } catch {
    sessionId = '';
  }
  if (!sessionId) {
    return NextResponse.json({ session: null }, { status: 400 });
  }

  // getSession fails closed (null) on any DB problem.
  const session = await getSession(sessionId);
  return NextResponse.json({ session });
}

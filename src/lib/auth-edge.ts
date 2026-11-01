/**
 * Edge-safe auth helpers for middleware.
 *
 * middleware.ts runs on the Edge Runtime where Node.js-only modules
 * (mysql2, next/headers, etc.) are NOT available. Importing '@/lib/auth'
 * pulls those in transitively and breaks `next build` with
 * UnhandledSchemeError for "node:" URIs.
 *
 * This module contains ONLY edge-safe code: pure string parsing and fetch.
 *
 * Session validation (login-loop fix, 2026-10-30): sessions are stored in
 * the database (see lib/redis.ts), but the Edge Runtime cannot use mysql2
 * and its memory is separate from the Node server's, so the old approach —
 * reading the same in-process Map the login route wrote to — could never
 * find a session here. Instead, validateServerSession asks the app's own
 * internal route (app/api/internal/session-check, Node runtime) to look the
 * session up in the DB. Middleware skips /api paths, so that route never
 * loops back into middleware. The call is authenticated with a shared
 * internal secret header (lib/internal-secret.ts) and FAILS CLOSED: any
 * error or timeout is treated as "no session", exactly like the old
 * behaviour when a session was not found.
 */
import { UserSession } from '@/types/auth';
import { INTERNAL_SECRET_HEADER, getInternalSecret } from './internal-secret';

export function parseSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const cookieName = process.env.SESSION_COOKIE_NAME || 'shiva_session_id';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  for (const c of cookies) {
    if (c.startsWith(`${cookieName}=`)) {
      return c.substring(cookieName.length + 1);
    }
  }
  return null;
}

export async function validateServerSession(
  sessionId: string,
  origin?: string
): Promise<UserSession | null> {
  if (!sessionId) return null;

  // Prefer a direct loopback origin when configured (avoids a public
  // hairpin through DNS/CDN when middleware and the app share a host);
  // otherwise use the origin of the request being checked.
  const base = process.env.INTERNAL_APP_ORIGIN || origin;
  if (!base) return null;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(`${base}/api/internal/session-check`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        [INTERNAL_SECRET_HEADER]: getInternalSecret(),
      },
      body: JSON.stringify({ sessionId }),
      cache: 'no-store',
      signal: controller.signal,
    });
    if (!res.ok) return null;
    const data: any = await res.json().catch(() => null);
    return data && data.session ? (data.session as UserSession) : null;
  } catch {
    return null; // fail-closed (network error, timeout, bad JSON)
  } finally {
    clearTimeout(timer);
  }
}

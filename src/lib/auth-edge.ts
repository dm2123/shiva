/**
 * Edge-safe auth helpers for middleware.
 *
 * middleware.ts runs on the Edge Runtime where Node.js-only modules
 * (mysql2, next/headers, etc.) are NOT available. Importing '@/lib/auth'
 * pulls those in transitively and breaks `next build` with
 * UnhandledSchemeError for "node:" URIs.
 *
 * This module contains ONLY edge-safe code: pure string parsing and the
 * in-memory session store (no mysql2, no next/headers, no bcrypt).
 */
import { UserSession } from '@/types/auth';
import { getSession } from './redis';

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

export async function validateServerSession(sessionId: string): Promise<UserSession | null> {
  if (!sessionId) return null;
  return getSession(sessionId);
}

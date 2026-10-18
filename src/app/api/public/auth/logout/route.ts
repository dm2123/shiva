import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/rbac';
import { logoutService } from '@/services/auth.service';
import { serializeExpiredSessionCookie } from '@/lib/auth';

/**
 * POST /api/public/auth/logout
 * Clears the session and redirects to /login.
 * Used by the student dashboard profile menu (plain HTML form POST),
 * so it redirects instead of returning JSON.
 */
export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (session) {
    await logoutService(session.sessionId);
  }

  const response = NextResponse.redirect(new URL('/login', req.url), { status: 303 });
  response.headers.set('Set-Cookie', serializeExpiredSessionCookie());
  return response;
}

// Also support GET for direct navigation safety
export async function GET(req: NextRequest) {
  return POST(req);
}

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

  // Build redirect from the public host, not the internal address.
  // On Render/proxies, req.url may be localhost — prefer forwarded headers.
  const forwardedHost = req.headers.get('x-forwarded-host') || req.headers.get('host');
  const forwardedProto = req.headers.get('x-forwarded-proto') || 'https';
  const loginUrl = forwardedHost
    ? `${forwardedProto}://${forwardedHost}/login`
    : new URL('/login', req.url).toString();

  const response = NextResponse.redirect(loginUrl, { status: 303 });
  response.headers.set('Set-Cookie', serializeExpiredSessionCookie());
  return response;
}

// Also support GET for direct navigation safety
export async function GET(req: NextRequest) {
  return POST(req);
}

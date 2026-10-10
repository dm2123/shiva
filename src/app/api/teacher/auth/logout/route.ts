import { NextRequest, NextResponse } from 'next/server';
import { getSessionFromRequest } from '@/lib/rbac';
import { logoutService } from '@/services/auth.service';
import { createApiResponse } from '@/lib/utils';
import { serializeExpiredSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  const session = await getSessionFromRequest(req);
  if (session) {
    await logoutService(session.sessionId);
  }

  const response = NextResponse.json(createApiResponse({ message: 'Logged out successfully' }), { status: 200 });
  response.headers.set('Set-Cookie', serializeExpiredSessionCookie());
  return response;
}

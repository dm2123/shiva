import { NextRequest, NextResponse } from 'next/server';
import { loginService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { createApiResponse, createApiError } from '@/lib/utils';
import { serializeSessionCookie } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { user, session } = await loginService(body, UserRole.ADMIN);

    const response = NextResponse.json(createApiResponse({ user, session }), { status: 200 });
    response.headers.set('Set-Cookie', serializeSessionCookie(session.sessionId));
    return response;
  } catch (error: any) {
    return NextResponse.json(createApiError('AUTH_FAILED', error.message || 'Login failed.'), { status: 401 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { teacherPasswordLoginService } from '@/services/auth-extended.service';
import { serializeSessionCookie } from '@/lib/auth';

/**
 * POST /api/public/auth/teacher/login/password
 * Teacher login with email + password
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await teacherPasswordLoginService(body, ipAddress, userAgent);

    const response = NextResponse.json(
      { success: true, data: { user: result.user, sessionId: result.session.sessionId } },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', serializeSessionCookie(result.session.sessionId));
    return response;
  } catch (error: any) {
    if (error.code === 'INVALID_CREDENTIALS') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'LOGIN_FAILED', message: 'Login failed. Please try again.' } },
      { status: 500 }
    );
  }
}

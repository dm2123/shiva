import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentOtpLoginService, studentOtpLoginSchema } from '@/services/auth-extended.service';
import { serializeSessionCookie } from '@/lib/auth';

/**
 * POST /api/public/auth/student/login/otp
 * Student login with mobile OTP
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await verifyStudentOtpLoginService(body, ipAddress, userAgent);

    const response = NextResponse.json(
      { success: true, data: { user: result.user, sessionId: result.session.sessionId } },
      { status: 200 }
    );

    response.headers.set('Set-Cookie', serializeSessionCookie(result.session.sessionId));
    return response;
  } catch (error: any) {
    console.error('[Student OTP Login Error]:', error);

    if (error.code === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'Student account not found' } },
        { status: 404 }
      );
    }

    if (error.code === 'ACCOUNT_INACTIVE') {
      return NextResponse.json(
        { success: false, error: { code: 'ACCOUNT_INACTIVE', message: 'Account is not active' } },
        { status: 403 }
      );
    }

    if (error.code === 'INVALID_OTP') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: error.message } },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'LOGIN_FAILED', message: 'Login failed. Please try again.' } },
      { status: 500 }
    );
  }
}

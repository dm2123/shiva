import { NextRequest, NextResponse } from 'next/server';
import { verifyStudentOtpRegistrationService, studentOtpRegisterSchema } from '@/services/auth-extended.service';
import { serializeSessionCookie } from '@/lib/auth';

/**
 * POST /api/public/auth/register
 * Complete student registration with OTP verification
 * Body: { phone, otpSessionId, otpCode, fullName, email?, password, confirmPassword }
 * Returns: { user, sessionId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await verifyStudentOtpRegistrationService(body, ipAddress, userAgent);

    const response = NextResponse.json(
      { success: true, data: { user: result.user, sessionId: result.session.sessionId } },
      { status: 201 }
    );

    // Set secure session cookie
    const cookieHeader = serializeSessionCookie(result.session.sessionId);
    response.headers.set('Set-Cookie', cookieHeader);

    return response;
  } catch (error: any) {
    console.error('[Registration Error]:', error);

    if (error.code === 'DUPLICATE_EMAIL') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_EMAIL', message: 'Email already registered' } },
        { status: 409 }
      );
    }

    if (error.code === 'DUPLICATE_PHONE') {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_PHONE', message: 'Phone already registered' } },
        { status: 409 }
      );
    }

    if (error.code === 'INVALID_OTP') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: error.message } },
        { status: 401 }
      );
    }

    // Validation errors
    if (error instanceof Error && error.message.includes('validation')) {
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: error.message } },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'REGISTRATION_FAILED', message: error.message || 'Registration failed. Please try again.' } },
      { status: 500 }
    );
  }
}

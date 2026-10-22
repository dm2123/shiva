import { NextRequest, NextResponse } from 'next/server';
import { registerStudentService } from '@/services/auth.service';
import { serializeSessionCookie } from '@/lib/auth';

/**
 * POST /api/public/auth/register/email
 * Student registration with email + password (no OTP required)
 * Body: { fullName, email, password, targetExam? }
 * Returns: { user, sessionId }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
    const userAgent = req.headers.get('user-agent') || undefined;

    const result = await registerStudentService(body, ipAddress, userAgent);

    const response = NextResponse.json(
      { success: true, data: { user: result.user } },
      { status: 201 }
    );

    const cookieHeader = serializeSessionCookie(result.session.sessionId);
    response.headers.set('Set-Cookie', cookieHeader);

    return response;
  } catch (error: any) {
    console.error('[Email Registration Error]:', error);

    const msg = error.message || '';
    if (msg.startsWith('DUPLICATE_EMAIL')) {
      return NextResponse.json(
        { success: false, error: { code: 'DUPLICATE_EMAIL', message: 'Is email se account pehle se hai. Login karo.' } },
        { status: 409 }
      );
    }

    // Zod validation errors — return the actual validation message
    if (error.name === 'ZodError' || msg.includes('Invalid email') || msg.includes('Password must') || msg.includes('Full name must')) {
      const zodMsg = error.issues?.[0]?.message || msg;
      return NextResponse.json(
        { success: false, error: { code: 'VALIDATION_ERROR', message: zodMsg } },
        { status: 400 }
      );
    }

    // Server/database errors — don't mask as validation
    return NextResponse.json(
      { success: false, error: { code: 'SERVER_ERROR', message: 'Registration me dikkat hui. Thodi der baad try karo.' } },
      { status: 500 }
    );
  }
}

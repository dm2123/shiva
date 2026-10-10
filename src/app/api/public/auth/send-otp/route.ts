import { NextRequest, NextResponse } from 'next/server';
import { phoneNumberSchema } from '@/services/auth-extended.service';
import { sendStudentOtpService } from '@/services/auth-extended.service';

/**
 * POST /api/public/auth/send-otp
 * Initiates OTP sending for student registration or login
 * Body: { phone: string }
 * Returns: { sessionId: string, message: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { phone } = body;

    if (!phone) {
      return NextResponse.json(
        { success: false, error: { code: 'MISSING_PHONE', message: 'Phone number is required' } },
        { status: 400 }
      );
    }

    // Validate phone format
    try {
      phoneNumberSchema.parse(phone);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PHONE', message: 'Invalid phone number format' } },
        { status: 400 }
      );
    }

    const result = await sendStudentOtpService(phone);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[OTP Send Error]:', error);

    if (error.statusCode === 429) {
      return NextResponse.json(
        { success: false, error: { code: error.code, message: error.message } },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'OTP_SEND_FAILED', message: 'Failed to send OTP. Please try again.' } },
      { status: 500 }
    );
  }
}

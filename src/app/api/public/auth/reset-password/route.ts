import { NextRequest, NextResponse } from 'next/server';
import { resetPasswordService } from '@/services/auth-extended.service';

/**
 * POST /api/public/auth/reset-password
 * Reset password using OTP verification
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await resetPasswordService(body);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Reset Password Error]:', error);

    if (error.code === 'INVALID_OTP') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_OTP', message: error.message } },
        { status: 401 }
      );
    }

    if (error.code === 'USER_NOT_FOUND') {
      return NextResponse.json(
        { success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'RESET_PASSWORD_FAILED', message: 'Password reset failed. Please try again.' } },
      { status: 500 }
    );
  }
}

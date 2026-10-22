import { NextRequest, NextResponse } from 'next/server';
import { forgotPasswordRequestService, resetPasswordService } from '@/services/auth-extended.service';

/**
 * POST /api/public/auth/forgot-password
 * Initiate forgot password flow via email or phone
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const result = await forgotPasswordRequestService(body);
    
    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Forgot Password Error]:', error);
    
    if (error.statusCode === 200) {
      // Generic response to prevent user enumeration
      return NextResponse.json(
        { success: true, data: { message: error.message } },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: error.code || 'FORGOT_PASSWORD_FAILED', message: error.message } },
      { status: error.statusCode || 500 }
    );
  }
}

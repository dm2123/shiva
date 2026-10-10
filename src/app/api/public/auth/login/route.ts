import { NextRequest, NextResponse } from 'next/server';
import { loginService } from '@/services/auth.service';
import { UserRole } from '@/types/auth';
import { createApiResponse, createApiError } from '@/lib/utils';
import { serializeSessionCookie } from '@/lib/auth';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const ipAddress = req.headers.get('x-forwarded-for') || undefined;
    const userAgent = req.headers.get('user-agent') || undefined;

    const { user, session } = await loginService(body, UserRole.STUDENT, ipAddress, userAgent);

    const response = NextResponse.json(createApiResponse({ user, session }), { status: 200 });
    response.headers.set('Set-Cookie', serializeSessionCookie(session.sessionId));
    return response;
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Input validation failed.', details), {
        status: 400,
      });
    }

    if (error.message?.startsWith('INVALID_ROLE_FOR_PORTAL')) {
      return NextResponse.json(
        createApiError('FORBIDDEN_ROLE', 'Account role is not authorized for student portal access.'),
        { status: 403 }
      );
    }

    if (error.message?.startsWith('INVALID_CREDENTIALS')) {
      return NextResponse.json(createApiError('INVALID_CREDENTIALS', 'Invalid email or password.'), {
        status: 401,
      });
    }

    if (error.message?.startsWith('ACCOUNT_SUSPENDED')) {
      return NextResponse.json(
        createApiError('ACCOUNT_SUSPENDED', 'Your account has been suspended. Please contact support.'),
        { status: 403 }
      );
    }

    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'An unexpected error occurred.'), {
      status: 500,
    });
  }
}

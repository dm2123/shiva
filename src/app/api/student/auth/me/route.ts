import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getCurrentUserService } from '@/services/auth.service';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const user = await getCurrentUserService(session);
    return NextResponse.json(createApiResponse({ user, session }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'An unexpected error occurred.'), {
      status: 500,
    });
  }
}

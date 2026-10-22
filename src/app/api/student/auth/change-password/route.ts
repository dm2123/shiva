import { NextRequest, NextResponse } from 'next/server';
import { changePasswordService } from '@/services/auth-extended.service';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

/**
 * POST /api/student/auth/change-password
 * Change password (authenticated student only)
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const result = await changePasswordService(session.userId, body);

    return NextResponse.json(
      { success: true, data: result },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    console.error('[Change Password Error]:', error);

    if (error.code === 'INVALID_PASSWORD') {
      return NextResponse.json(
        { success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } },
        { status: 401 }
      );
    }

    if (error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } },
        { status: error.statusCode || 401 }
      );
    }

    return NextResponse.json(
      { success: false, error: { code: 'CHANGE_PASSWORD_FAILED', message: 'Failed to change password' } },
      { status: 500 }
    );
  }
}

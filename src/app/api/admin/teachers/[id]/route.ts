import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { findUserById, getTeacherProfileByUserId } from '@/lib/db';

/**
 * GET /api/admin/teachers/[id]
 * Get detailed teacher information
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { id } = params;

    const user = await findUserById(id);
    if (!user || user.role !== UserRole.TEACHER) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Teacher not found' } },
        { status: 404 }
      );
    }

    const profile = await getTeacherProfileByUserId(id);

    return NextResponse.json(
      {
        success: true,
        data: {
          id: user.id,
          email: user.email,
          phone: user.phone,
          status: user.status,
          phoneVerified: user.phoneVerified,
          emailVerified: user.emailVerified,
          profile: profile,
          createdAt: user.createdAt,
          lastLoginAt: user.lastLoginAt,
        },
      },
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: error.message } },
        { status: error.statusCode || 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { code: 'FETCH_FAILED', message: 'Failed to fetch teacher details' } },
      { status: 500 }
    );
  }
}

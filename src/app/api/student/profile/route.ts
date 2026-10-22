import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

/**
 * GET /api/student/profile
 *
 * Profile summary for the student app (Profile tab): the student's own
 * account + profile row, plus real activity counts — enrolled courses
 * (StudentEnrollments) and completed test attempts (AssessmentAttempts).
 * This route did not exist before (the app got a 404 HTML page and hid
 * its stats cards); every number here comes from the live tables.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const userId = session.userId;

    const [userRows]: any = await mysqlPool.query(
      `SELECT u.id, u.email, u.role, u.status, u.createdAt,
              sp.name AS name, sp.targetExam AS targetExam,
              sp.avatarUrl AS avatarUrl, sp.phone AS phone
       FROM Users u
       LEFT JOIN StudentProfiles sp ON sp.userId = u.id
       WHERE u.id = ?
       LIMIT 1`,
      [userId]
    );
    const user = userRows?.[0];
    if (!user) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Student not found.'), { status: 404 });
    }

    let enrolledCourses = 0;
    try {
      const [rows]: any = await mysqlPool.query(
        'SELECT COUNT(*) AS n FROM StudentEnrollments WHERE studentId = ?',
        [userId]
      );
      enrolledCourses = Number(rows?.[0]?.n) || 0;
    } catch {
      /* count is best-effort */
    }

    let testsAttempted = 0;
    try {
      const [rows]: any = await mysqlPool.query(
        `SELECT COUNT(*) AS n FROM AssessmentAttempts
         WHERE studentId = ? AND status IN ('COMPLETED', 'EVALUATED')`,
        [userId]
      );
      testsAttempted = Number(rows?.[0]?.n) || 0;
    } catch {
      /* count is best-effort */
    }

    return NextResponse.json(
      createApiResponse({
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        targetExam: user.targetExam || undefined,
        avatarUrl: user.avatarUrl || undefined,
        phone: user.phone || undefined,
        role: user.role,
        memberSince: user.createdAt,
        enrolledCourses,
        testsAttempted,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch profile.'),
      { status: 500 }
    );
  }
}

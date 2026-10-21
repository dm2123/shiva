import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getStudentEnrolledCourses, listPublicCourses } from '@/services/academic.service';
import { createApiResponse, createApiError } from '@/lib/utils';

/**
 * GET /api/student/courses
 *
 * Course CATALOG for the student app (Courses tab): every PUBLISHED
 * course, each annotated with `enrolled` for the current student.
 * Enrolled courses are merged in even if they are no longer published,
 * so a student's own courses never disappear from their list.
 * (Enrolled-only views use /api/student/enrollments instead.)
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const [catalog, enrolledCourses] = await Promise.all([
      listPublicCourses(),
      getStudentEnrolledCourses(session.userId),
    ]);
    const enrolledIds = new Set((enrolledCourses as any[]).map((c) => c.id));
    const byId = new Map<string, any>();
    for (const c of catalog as any[]) {
      byId.set(c.id, { ...c, enrolled: enrolledIds.has(c.id) });
    }
    for (const c of enrolledCourses as any[]) {
      if (!byId.has(c.id)) byId.set(c.id, { ...c, enrolled: true });
    }
    return NextResponse.json(createApiResponse({ courses: [...byId.values()] }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch courses.'), {
      status: 500,
    });
  }
}

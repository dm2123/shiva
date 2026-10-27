import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getTeacherAssignedCourses } from '@/services/academic.service';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    // getTeacherAssignedCourses andar getTeacherAssignmentsDb poochta hai —
    // purane DB par table missing ho to helper [] deta hai (courses khaali
    // dikhte). Auth ke baad ensure, phir service (pages wali hi leg;
    // service me wiring nahi — wo public pages se bhi use hoti hai).
    await ensureTeacherAssignmentSchema();
    const courses = await getTeacherAssignedCourses(session.userId);
    return NextResponse.json(createApiResponse({ courses }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch assigned courses.'), {
      status: 500,
    });
  }
}

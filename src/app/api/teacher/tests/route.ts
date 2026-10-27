import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createTest, listTestByCourse } from '@/services/test.service';
import { verifyTeacherCourseAuthorization } from '@/services/academic.service';
import { getTeacherAssignmentsDb } from '@/lib/db';
import { findCourseByIdDb } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    const courseId = body.courseId;
    if (!courseId) {
      return NextResponse.json({ success: false, error: { message: 'courseId is required' } }, { status: 400 });
    }

    // verifyTeacherCourseAuthorization TeacherCourseAssignments poochta hai
    // (isTeacherAssignedToCourseDb) — purane DB par table missing ho to wo
    // error swallow karke false deta hai, aur asal assigned teacher ko bhi
    // galat 403 milta. Auth ke baad ensure, phir verify (pages wali hi leg).
    await ensureTeacherAssignmentSchema();
    await verifyTeacherCourseAuthorization(session.userId, courseId);

    const test = await createTest({
      title: body.title,
      description: body.description,
      courseId,
      durationMinutes: Number(body.durationMinutes) || 60,
      totalMarks: Number(body.totalMarks) || 100,
      passingMarks: body.passingMarks != null ? Number(body.passingMarks) : undefined,
      status: 'PUBLISHED',
      type: body.type || undefined,
      category: body.category || undefined,
    });

    return NextResponse.json({ success: true, data: { test } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    if (error instanceof Error && error.message.includes('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json({ success: false, error: { message: 'You are not assigned to this course' } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create test' } }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);

    // getTeacherAssignmentsDb TeacherCourseAssignments poochta hai — purane
    // DB par table missing ho to helper [] deta hai (tests list khaali
    // dikhti). Auth ke baad ensure, phir helper (pages wali hi leg).
    await ensureTeacherAssignmentSchema();
    const assignments = await getTeacherAssignmentsDb(session.userId);
    const tests: any[] = [];
    const courseMap = new Map<string, string>();

    for (const a of assignments) {
      const course = await findCourseByIdDb(a.courseId);
      if (course) courseMap.set(course.id, course.title);
      const courseTests = await listTestByCourse(a.courseId);
      tests.push(...courseTests);
    }

    const withMeta = tests.map((t: any) => ({
      ...t,
      courseTitle: courseMap.get(t.courseId) || '—',
    }));

    withMeta.sort((a: any, b: any) => String(b.createdAt).localeCompare(String(a.createdAt) || ''));

    return NextResponse.json({ success: true, data: { tests: withMeta } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: 'Failed to load tests' } }, { status: 500 });
  }
}
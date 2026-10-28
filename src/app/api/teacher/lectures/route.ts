import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createLecture, verifyTeacherCourseAuthorization, getChapterById, getSubjectById } from '@/services/academic.service';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { createApiResponse, createApiError } from '@/lib/utils';
import { z } from 'zod';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    // verifyTeacherCourseAuthorization TeacherCourseAssignments poochta hai
    // (isTeacherAssignedToCourseDb) — purane DB par table missing ho to wo
    // error swallow karke false deta hai, aur asal assigned teacher ko bhi
    // galat 403 milta. Auth ke baad ensure, phir verify (tests/courses wali hi leg).
    await ensureTeacherAssignmentSchema();
    const body = await req.json();

    // Verify object-level authorization for the teacher
    const chapter = await getChapterById(body.chapterId);
    const subject = await getSubjectById(chapter.subjectId);

    await verifyTeacherCourseAuthorization(session.userId, subject.courseId);

    const lecture = await createLecture(body);
    return NextResponse.json(createApiResponse({ lecture }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    if (error.message?.startsWith('NOT_FOUND')) {
      return NextResponse.json(createApiError('NOT_FOUND', error.message), { status: 404 });
    }
    if (error.message?.startsWith('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json(createApiError('FORBIDDEN_OBJECT_ACCESS', 'You are not assigned to manage content for this course.'), {
        status: 403,
      });
    }
    if (error instanceof z.ZodError) {
      const details = error.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      }));
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'Input validation failed.', details), {
        status: 400,
      });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create lecture.'), {
      status: 500,
    });
  }
}

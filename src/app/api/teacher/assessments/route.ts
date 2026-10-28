import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createAssessmentDb, listAssessmentsByCourseDb, findCourseByIdDb } from '@/lib/db';
import { verifyTeacherCourseAuthorization } from '@/services/academic.service';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    // verifyTeacherCourseAuthorization TeacherCourseAssignments poochta hai
    // (isTeacherAssignedToCourseDb) — purane DB par table missing ho to wo
    // error swallow karke false deta hai, aur asal assigned teacher ko bhi
    // galat 403 milta. Auth ke baad ensure, phir verify (tests/courses wali hi leg).
    await ensureTeacherAssignmentSchema();
    const body = await req.json();

    const courseId = body.courseId;
    if (!courseId) throw new Error('VALIDATION_ERROR: courseId is required');

    // Verify object-level authorization for the teacher
    await verifyTeacherCourseAuthorization(session.userId, courseId);

    const assessmentData = {
      id: randomUUID(),
      courseId: body.courseId,
      title: body.title,
      description: body.description,
      type: body.type || 'DPP',
      totalMarks: body.totalMarks || 100,
      passingMarks: body.passingMarks,
      startTime: body.startTime,
      endTime: body.endTime
    };

    const assessment = await createAssessmentDb(assessmentData);
    
    return NextResponse.json({ success: true, data: { assessment } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: 401 });
    if (error.message.includes('NOT_FOUND')) return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
    if (error.message.includes('FORBIDDEN')) return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create assessment' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
     const session = await requireRole(req, UserRole.TEACHER);
     // verifyTeacherCourseAuthorization TeacherCourseAssignments poochta hai
     // (isTeacherAssignedToCourseDb) — purane DB par table missing ho to wo
     // error swallow karke false deta hai, aur asal assigned teacher ko bhi
     // galat 403 milta. Auth ke baad ensure, phir verify (tests/courses wali hi leg).
     await ensureTeacherAssignmentSchema();
     const url = new URL(req.url);
     const courseId = url.searchParams.get('courseId');

     if (!courseId) {
       return NextResponse.json({ success: false, error: { message: 'courseId query parameter is required' } }, { status: 400 });
     }

     await verifyTeacherCourseAuthorization(session.userId, courseId);

     const assessments = await listAssessmentsByCourseDb(courseId);

     return NextResponse.json({ success: true, data: { assessments } });
  } catch (error: any) {
     return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

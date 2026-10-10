import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createSubject, verifyTeacherCourseAuthorization, listSubjectsByCourse } from '@/services/academic.service';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    // Verify object-level authorization
    await verifyTeacherCourseAuthorization(session.userId, body.courseId);

    const subject = await createSubject(body);
    return NextResponse.json({ success: true, data: { subject } }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create subject' } }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json({ success: false, error: { message: 'courseId query parameter is required' } }, { status: 400 });
    }

    // Verify object-level authorization
    await verifyTeacherCourseAuthorization(session.userId, courseId);

    const subjects = await listSubjectsByCourse(courseId);
    return NextResponse.json({ success: true, data: { subjects } }, { status: 200 });
  } catch (error: any) {
    if (error.message.includes('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 500 });
  }
}

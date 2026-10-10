import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createChapter, verifyTeacherCourseAuthorization, listChaptersBySubject, getSubjectById } from '@/services/academic.service';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    // Must map subject to course to check authorization
    const subject = await getSubjectById(body.subjectId);
    await verifyTeacherCourseAuthorization(session.userId, subject.courseId);

    const chapter = await createChapter(body);
    return NextResponse.json({ success: true, data: { chapter } }, { status: 201 });
  } catch (error: any) {
    if (error.message.includes('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create chapter' } }, { status: 400 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const url = new URL(req.url);
    const subjectId = url.searchParams.get('subjectId');

    if (!subjectId) {
      return NextResponse.json({ success: false, error: { message: 'subjectId query parameter is required' } }, { status: 400 });
    }

    const subject = await getSubjectById(subjectId);
    await verifyTeacherCourseAuthorization(session.userId, subject.courseId);

    const chapters = await listChaptersBySubject(subjectId);
    return NextResponse.json({ success: true, data: { chapters } }, { status: 200 });
  } catch (error: any) {
    if (error.message.includes('FORBIDDEN_OBJECT_ACCESS')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 500 });
  }
}

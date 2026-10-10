import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { findLectureByIdDb, isStudentEnrolledInCourseDb, findChapterByIdDb } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest, { params }: { params: { lectureId: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const lecture = await findLectureByIdDb(params.lectureId);
    if (!lecture) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Lecture not found'), { status: 404 });
    }

    const chapter = await findChapterByIdDb(lecture.chapterId);
    if (!chapter) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Chapter not found'), { status: 404 });
    }

    const subject = await (import('@/lib/db')).then(db => db.findSubjectByIdDb(chapter.subjectId));
    if (!subject) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Subject not found'), { status: 404 });
    }
    
    const isEnrolled = await isStudentEnrolledInCourseDb(session.userId, subject.courseId);
    if (!isEnrolled && !lecture.isPreviewable) {
      return NextResponse.json(createApiError('FORBIDDEN_OBJECT_ACCESS', 'You are not authorized to view this lecture.'), { status: 403 });
    }

    return NextResponse.json(createApiResponse({ lecture }), { status: 200 });
  } catch (error: any) {
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', 'Failed to fetch lecture.'), { status: 500 });
  }
}

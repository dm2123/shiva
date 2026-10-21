import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import {
  findCourseByIdDb, findCourseBySlugDb, listSubjectsByCourseDb,
  listChaptersBySubjectDb, listLecturesByChapterDb, getLectureProgressDb,
  isStudentEnrolledInCourseDb,
} from '@/lib/db';
import { ensureAptitudePetLectures } from '@/lib/ensure-aptitude-content';
import { createApiResponse, createApiError } from '@/lib/utils';

/**
 * GET /api/student/learn/lecture?courseId=<id|slug>
 *
 * Flat lecture list for a course (the mobile app's LearnScreen).
 * Mirrors the single-lecture route's access rule: enrolled students
 * get every lecture; everyone else only gets previewable ones.
 * Order follows Subjects → Chapters → Lectures sortOrder, exactly
 * like the website learn page.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const courseIdParam = req.nextUrl.searchParams.get('courseId');
    if (!courseIdParam) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'courseId is required'), { status: 400 });
    }

    const course =
      (await findCourseByIdDb(courseIdParam)) ||
      (await findCourseBySlugDb(courseIdParam));
    if (!course) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Course not found'), { status: 404 });
    }

    // Self-heal seeded content (idempotent, never throws).
    await ensureAptitudePetLectures();

    const enrolled = await isStudentEnrolledInCourseDb(session.userId, course.id);

    const subjects: any[] = (await listSubjectsByCourseDb(course.id)) || [];
    const lectures: any[] = [];
    for (const subject of subjects) {
      const chapters: any[] = (await listChaptersBySubjectDb(subject.id)) || [];
      for (const chapter of chapters) {
        const chapterLectures: any[] = (await listLecturesByChapterDb(chapter.id)) || [];
        for (const l of chapterLectures) {
          if (!enrolled && !l.isPreviewable) continue;
          const progress: any = await getLectureProgressDb(session.userId, l.id);
          lectures.push({
            id: l.id,
            title: l.title,
            description: l.description || null,
            videoUrl: l.videoUrl || null,
            durationSeconds: l.durationSeconds || 0,
            isPreviewable: !!l.isPreviewable,
            isCompleted: !!progress?.isCompleted,
            subject: subject.name,
            chapter: chapter.title,
            sortOrder: l.sortOrder || 0,
          });
        }
      }
    }

    return NextResponse.json(createApiResponse({ lectures }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch lectures.'),
      { status: 500 }
    );
  }
}

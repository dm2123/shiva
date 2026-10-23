import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { findCourseByIdDb, findCourseBySlugDb, isStudentEnrolledInCourseDb, getLectureProgressDb } from '@/lib/db';
import { getCourseSyllabusTree } from '@/services/academic.service';
import { hasCourseInfoColumns } from '@/lib/ensure-course-schema';
import { ensureMojibakeRepair, sanitizeTextDeep } from '@/lib/fix-mojibake';
import { createApiResponse, createApiError } from '@/lib/utils';

function formatDuration(totalSeconds: number): string | undefined {
  const s = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  if (s <= 0) return undefined;
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} min`;
  const h = Math.floor(m / 60);
  const rem = m % 60;
  return rem === 0 ? `${h}h` : `${h}h ${rem}m`;
}

/**
 * GET /api/student/courses/:id (id ya slug)
 *
 * Course detail with the full syllabus tree reshaped for the mobile
 * app: `curriculum` is a flat list of chapter sections, each with its
 * lectures as lessons. The website does not use this route — it reads
 * the same Subjects/Chapters/Lectures tables in server components.
 */
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const course =
      (await findCourseByIdDb(params.id)) ||
      (await findCourseBySlugDb(params.id));
    if (!course) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Course not found'), { status: 404 });
    }

    // Course info columns (§21: language/validity/targetAudience) purane DB par
    // self-heal ho jayein taaki tree spread me woh fields bhi aayein.
    await hasCourseInfoColumns();

    const tree: any = await getCourseSyllabusTree(course.id);
    await ensureMojibakeRepair();
    sanitizeTextDeep(tree);
    const enrolled = await isStudentEnrolledInCourseDb(session.userId, course.id);

    const curriculum: any[] = [];
    const subjects: any[] = [];
    let totalLectures = 0;
    let completedLectures = 0;
    for (const subject of tree.subjects || []) {
      let subjectLectures = 0;
      let subjectCompleted = 0;
      let subjectChapters = 0;
      for (const chapter of subject.chapters || []) {
        const lessons: any[] = [];
        let chapterCompleted = 0;
        for (const l of chapter.lectures || []) {
          totalLectures += 1;
          subjectLectures += 1;
          const progress: any = await getLectureProgressDb(session.userId, l.id).catch(() => null);
          const isCompleted = !!progress?.isCompleted;
          if (isCompleted) {
            chapterCompleted += 1;
            subjectCompleted += 1;
            completedLectures += 1;
          }
          lessons.push({
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl || null,
            durationSeconds: l.durationSeconds || 0,
            duration: formatDuration(l.durationSeconds),
            isFree: !!l.isPreviewable,
            isCompleted,
          });
        }
        if (lessons.length > 0) subjectChapters += 1;
        curriculum.push({
          id: chapter.id,
          title: chapter.title,
          subject: subject.name,
          subjectId: subject.id,
          lectureCount: lessons.length,
          completedCount: chapterCompleted,
          progressPct: lessons.length > 0 ? Math.round((chapterCompleted / lessons.length) * 100) : 0,
          lessons,
        });
      }
      subjects.push({
        id: subject.id,
        name: subject.name,
        chapterCount: subjectChapters,
        lectureCount: subjectLectures,
        completedCount: subjectCompleted,
        progressPct: subjectLectures > 0 ? Math.round((subjectCompleted / subjectLectures) * 100) : 0,
      });
    }

    return NextResponse.json(
      createApiResponse({
        course: { ...tree, enrolled, totalLectures, completedLectures, subjects, curriculum },
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
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch course.'),
      { status: 500 }
    );
  }
}

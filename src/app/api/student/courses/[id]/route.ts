import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { findCourseByIdDb, findCourseBySlugDb, isStudentEnrolledInCourseDb } from '@/lib/db';
import { getCourseSyllabusTree } from '@/services/academic.service';
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

    const tree: any = await getCourseSyllabusTree(course.id);
    const enrolled = await isStudentEnrolledInCourseDb(session.userId, course.id);

    const curriculum: any[] = [];
    let totalLectures = 0;
    for (const subject of tree.subjects || []) {
      for (const chapter of subject.chapters || []) {
        const lessons = (chapter.lectures || []).map((l: any) => {
          totalLectures += 1;
          return {
            id: l.id,
            title: l.title,
            videoUrl: l.videoUrl || null,
            durationSeconds: l.durationSeconds || 0,
            duration: formatDuration(l.durationSeconds),
            isFree: !!l.isPreviewable,
          };
        });
        curriculum.push({
          id: chapter.id,
          title: chapter.title,
          subject: subject.name,
          lessons,
        });
      }
    }

    return NextResponse.json(
      createApiResponse({
        course: { ...tree, enrolled, totalLectures, curriculum },
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

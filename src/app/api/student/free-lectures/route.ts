import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { listPublicCourses, getCourseSyllabusTree } from '@/services/academic.service';
import { sanitizeTextDeep } from '@/lib/fix-mojibake';
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
 * GET /api/student/free-lectures
 *
 * Library ke "Free Lectures" tab ke liye: saare PUBLISHED free courses
 * (price = 0) ke lectures ki flat list. Free course ka har lecture free
 * mana jata hai; paid courses ke sirf previewable (isFree) lectures
 * shamil hote hain taaki Library sach me "free" hi dikhaye.
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const courses: any[] = (await listPublicCourses()) as any[];
    const freeCourses = courses.filter((c) => Number(c?.price ?? 0) <= 0);
    const paidCourses = courses.filter((c) => Number(c?.price ?? 0) > 0);

    const lectures: any[] = [];

    const collect = async (course: any, onlyPreviewable: boolean) => {
      try {
        const tree: any = await getCourseSyllabusTree(course.id);
        for (const subject of tree.subjects || []) {
          for (const chapter of subject.chapters || []) {
            for (const l of chapter.lectures || []) {
              const isFree = !!l.isPreviewable;
              if (onlyPreviewable && !isFree) continue;
              lectures.push({
                id: l.id,
                title: l.title,
                courseId: course.id,
                courseTitle: course.title,
                subject: subject.name,
                chapter: chapter.title,
                duration: formatDuration(l.durationSeconds),
                durationSeconds: l.durationSeconds || 0,
                isFree: true,
              });
            }
          }
        }
      } catch {
        // Ek course ka tree fail ho to baaki lectures rukne nahi chahiye.
      }
    };

    // Free courses pehle (poora curriculum), phir paid ke preview lectures.
    for (const c of freeCourses.slice(0, 6)) await collect(c, false);
    for (const c of paidCourses.slice(0, 6)) await collect(c, true);

    sanitizeTextDeep(lectures);
    return NextResponse.json(
      createApiResponse({ lectures, total: lectures.length }),
      { status: 200 },
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch free lectures.'),
      { status: 500 },
    );
  }
}

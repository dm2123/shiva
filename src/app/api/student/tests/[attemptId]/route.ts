import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import {
  findTestByIdDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb,
} from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

function parseOptions(raw: any): any[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.options)) return parsed.options;
  return [];
}

function optionText(o: any): string {
  if (o == null) return '';
  if (typeof o === 'string') return o;
  return String(o.text ?? o.label ?? o.title ?? '');
}

/**
 * GET /api/student/tests/:id
 *
 * Test detail for the student app (TestAttempt screen). The app passes
 * a TEST id here (the sibling [attemptId] segment name is historical —
 * the website creates attempts server-side; the app works test-first).
 * Questions come from the test's course (subjects -> chapters ->
 * questions), the exact chain the submit route scores against.
 * Correct answers are NEVER included in this response.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    void session;

    const test: any = await findTestByIdDb(params.attemptId);
    if (!test || test.status !== 'PUBLISHED') {
      return NextResponse.json(createApiError('NOT_FOUND', 'Test not found'), { status: 404 });
    }

    const subjects: any[] = await listSubjectsByCourseDb(test.courseId);
    const questions: any[] = (
      await Promise.all(
        subjects.map(async (subject: any) => {
          const chapters: any[] = await listChaptersBySubjectDb(subject.id);
          return (
            await Promise.all(chapters.map((chapter: any) => listQuestionsByChapterDb(chapter.id)))
          ).flat();
        })
      )
    ).flat();

    const shapedQuestions = questions.map((q: any) => ({
      id: q.id,
      text: q.title,
      options: parseOptions(q.options).map(optionText),
      marks: q.marks != null ? Number(q.marks) : undefined,
      type: q.type,
    }));

    return NextResponse.json(
      createApiResponse({
        id: test.id,
        title: test.title,
        description: test.description || undefined,
        courseId: test.courseId,
        durationMinutes: test.durationMinutes ?? 60,
        totalMarks: test.totalMarks != null ? Number(test.totalMarks) : undefined,
        passingMarks: test.passingMarks != null ? Number(test.passingMarks) : undefined,
        totalQuestions: shapedQuestions.length,
        questions: shapedQuestions,
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
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch test.'),
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool, listTestsDb } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

/**
 * GET /api/student/tests
 *
 * Test catalog for the student app (Tests tab): every PUBLISHED test
 * with its question count (questions hang off the chapters of the
 * test's course — the same chain the submit route scores against),
 * plus this student's attempt state (attempted / best score).
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const allTests: any[] = await listTestsDb();
    const tests = allTests.filter((t) => t.status === 'PUBLISHED');

    // Question count per course (Questions -> Chapters -> Subjects -> Courses)
    const countByCourse = new Map<string, number>();
    try {
      const [rows]: any = await mysqlPool.query(
        `SELECT s.courseId AS courseId, COUNT(q.id) AS n
         FROM Questions q
         JOIN Chapters ch ON q.chapterId = ch.id
         JOIN Subjects s ON ch.subjectId = s.id
         GROUP BY s.courseId`
      );
      for (const r of rows || []) countByCourse.set(r.courseId, Number(r.n) || 0);
    } catch {
      /* counts are best-effort — list still works without them */
    }

    // This student's attempts per test
    const attemptByTest = new Map<string, { count: number; done: number; best: number | null }>();
    try {
      const [rows]: any = await mysqlPool.query(
        `SELECT assessmentId,
                COUNT(*) AS cnt,
                SUM(CASE WHEN status IN ('EVALUATED','COMPLETED') THEN 1 ELSE 0 END) AS done,
                MAX(CASE WHEN status IN ('EVALUATED','COMPLETED') THEN score END) AS best
         FROM AssessmentAttempts
         WHERE studentId = ?
         GROUP BY assessmentId`,
        [session.userId]
      );
      for (const r of rows || []) {
        attemptByTest.set(r.assessmentId, {
          count: Number(r.cnt) || 0,
          done: Number(r.done) || 0,
          best: r.best == null ? null : Number(r.best),
        });
      }
    } catch {
      /* attempt state is best-effort */
    }

    const shaped = tests.map((t) => {
      const totalQuestions = countByCourse.get(t.courseId) ?? 0;
      const att = attemptByTest.get(t.id);
      const attempted = !!att && att.done > 0;
      return {
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        courseId: t.courseId,
        durationMinutes: t.durationMinutes ?? 60,
        duration: t.durationMinutes ?? 60,
        totalMarks: t.totalMarks != null ? Number(t.totalMarks) : undefined,
        marks: t.totalMarks != null ? Number(t.totalMarks) : undefined,
        passingMarks: t.passingMarks != null ? Number(t.passingMarks) : undefined,
        totalQuestions,
        questions: totalQuestions,
        attempted,
        attemptCount: att?.count ?? 0,
        ...(attempted && att?.best != null ? { score: att.best } : {}),
      };
    });

    return NextResponse.json(createApiResponse({ tests: shaped }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch tests.'),
      { status: 500 }
    );
  }
}

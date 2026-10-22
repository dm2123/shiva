import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { hasAttemptTimeColumn } from '@/lib/ensure-attempt-schema';
import { createApiResponse, createApiError } from '@/lib/utils';

/**
 * GET /api/student/tests/attempts
 *
 * Attempt history for the student app: this student's finished
 * (EVALUATED / COMPLETED) attempts, newest first, with the test title,
 * real score and per-test best score. Tapping one opens the analysis
 * via GET /api/student/tests/:attemptId/attempt.
 * Only real rows are returned — an empty list is an honest empty state.
 */
export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const withTime = await hasAttemptTimeColumn();
    const [rows]: any = await mysqlPool.query(
      `SELECT a.id AS attemptId, a.assessmentId AS testId, a.score AS score,
              a.status AS status, a.startedAt AS startedAt, a.completedAt AS completedAt,
              ${withTime ? 'a.timeTakenSec AS timeTakenSec,' : ''}
              t.title AS testTitle, t.totalMarks AS totalMarks
         FROM AssessmentAttempts a
         LEFT JOIN Tests t ON t.id = a.assessmentId
        WHERE a.studentId = ? AND a.status IN ('EVALUATED','COMPLETED')
        ORDER BY a.completedAt DESC, a.createdAt DESC
        LIMIT 100`,
      [session.userId]
    );

    const list: any[] = rows || [];

    // Best score per test — computed from the same real rows.
    const bestByTest = new Map<string, number>();
    for (const r of list) {
      const s = Number(r.score) || 0;
      const prev = bestByTest.get(r.testId);
      if (prev == null || s > prev) bestByTest.set(r.testId, s);
    }

    const attempts = list.map((r) => ({
      attemptId: r.attemptId,
      testId: r.testId,
      testTitle: r.testTitle || 'Test',
      score: r.score == null ? null : Number(r.score),
      totalMarks: r.totalMarks == null ? null : Number(r.totalMarks),
      bestScore: bestByTest.get(r.testId) ?? null,
      status: r.status,
      startedAt: r.startedAt ?? null,
      completedAt: r.completedAt ?? null,
      // Present only when the column exists and a real value was stored.
      ...(r.timeTakenSec != null ? { timeTakenSec: Number(r.timeTakenSec) } : {}),
    }));

    return NextResponse.json(createApiResponse({ attempts }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch attempt history.'),
      { status: 500 }
    );
  }
}

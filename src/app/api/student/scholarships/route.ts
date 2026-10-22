import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureScholarshipTestColumns } from '@/lib/ensure-scholarship-schema';

/**
 * GET /api/student/scholarships
 *
 * Scholarship tests for the student app: published Tests flagged
 * isScholarship = 1, with their course title and this catalog's attempt
 * counts (best-effort). The scholarship columns live in
 * schema_updates.sql, which production never received — the schema
 * helper adds them on first use, and if they still cannot be created
 * the route returns an honest empty list instead of a 500 (the old
 * route queried t.startTime / t.isScholarshipTest / attempts.testId,
 * none of which exist in the real schema).
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const cols = await ensureScholarshipTestColumns();
    if (!cols.has('isScholarship')) {
      return NextResponse.json(createApiResponse({ scholarships: [] }), { status: 200 });
    }

    const extra = [
      cols.has('scholarshipReward') ? 't.scholarshipReward AS scholarshipReward' : 'NULL AS scholarshipReward',
      cols.has('scholarshipEndDate') ? 't.scholarshipEndDate AS scholarshipEndDate' : 'NULL AS scholarshipEndDate',
      cols.has('maxParticipants') ? 't.maxParticipants AS maxParticipants' : 'NULL AS maxParticipants',
      cols.has('participantsCount') ? 't.participantsCount AS participantsCount' : 'NULL AS participantsCount',
    ].join(',\n              ');

    const [rows]: any = await mysqlPool.query(
      `SELECT t.id, t.title, t.description, t.courseId, t.durationMinutes,
              t.totalMarks, t.status, t.createdAt,
              c.title AS courseTitle,
              ${extra}
       FROM Tests t
       LEFT JOIN Courses c ON t.courseId = c.id
       WHERE t.isScholarship = 1 AND t.status = 'PUBLISHED'
       ORDER BY t.createdAt DESC`
    );

    const tests: any[] = rows || [];

    // Attempt counts per test (AssessmentAttempts hangs off assessmentId;
    // scholarship tests are Tests rows attempted through the same flow).
    // Best-effort only — the list must work even if this fails.
    const attempts = new Map<string, { totalAttempts: number; highScore: number | null }>();
    if (tests.length) {
      try {
        const [arows]: any = await mysqlPool.query(
          `SELECT assessmentId,
                  COUNT(*) AS totalAttempts,
                  MAX(CASE WHEN status IN ('COMPLETED','EVALUATED') THEN score END) AS highScore
           FROM AssessmentAttempts
           GROUP BY assessmentId`
        );
        for (const r of arows || []) {
          attempts.set(r.assessmentId, {
            totalAttempts: Number(r.totalAttempts) || 0,
            highScore: r.highScore == null ? null : Number(r.highScore),
          });
        }
      } catch {
        /* counts are decorative */
      }
    }

    const scholarships = tests.map((t) => {
      const att = attempts.get(t.id);
      return {
        id: t.id,
        title: t.title,
        description: t.description || undefined,
        courseId: t.courseId,
        courseTitle: t.courseTitle || undefined,
        durationMinutes: t.durationMinutes ?? 60,
        totalMarks: t.totalMarks != null ? Number(t.totalMarks) : undefined,
        scholarshipReward: t.scholarshipReward != null ? Number(t.scholarshipReward) : undefined,
        scholarshipEndDate: t.scholarshipEndDate || undefined,
        maxParticipants: t.maxParticipants != null ? Number(t.maxParticipants) : undefined,
        participantsCount: t.participantsCount != null ? Number(t.participantsCount) : 0,
        totalAttempts: att?.totalAttempts ?? 0,
        highScore: att?.highScore ?? null,
        createdAt: t.createdAt,
      };
    });

    return NextResponse.json(createApiResponse({ scholarships }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), {
        status: error.statusCode,
      });
    }
    return NextResponse.json(
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch scholarships.'),
      { status: 500 }
    );
  }
}

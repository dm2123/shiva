import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import {
  mysqlPool, findAssessmentAttemptDb, findTestByIdDb, listSubjectsByCourseDb,
  listChaptersBySubjectDb, listQuestionsByChapterDb,
} from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

function normalizeOptions(raw: any): any[] {
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

// Same identity rule the submit route scores with: object options are
// identified by their `id`, plain-string options by their own text.
function optionIdOf(o: any): string | null {
  if (o == null) return null;
  if (typeof o === 'object') return o.id != null ? String(o.id) : null;
  return String(o);
}

function resolveIndex(options: any[], wantedId: any): number | null {
  if (wantedId == null || wantedId === '') return null;
  const target = String(wantedId);
  for (let i = 0; i < options.length; i++) {
    if (optionIdOf(options[i]) === target) return i;
  }
  return null;
}

function toMillis(v: any): number | null {
  if (v == null) return null;
  const t = v instanceof Date ? v.getTime() : new Date(String(v).replace(' ', 'T')).getTime();
  return Number.isFinite(t) ? t : null;
}

/**
 * GET /api/student/tests/:attemptId/attempt
 *
 * Full analysis of ONE finished attempt, for the app analysis screen:
 * score, accuracy, real time taken, topic-wise strength (only where
 * questions carry real subject/chapter data) and a per-question review
 * (your answer vs the correct answer + explanation).
 *
 * Answers are only ever exposed here — after the attempt is EVALUATED /
 * COMPLETED and belongs to the requesting student. The pre-submit
 * detail route never includes them.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const attempt: any = await findAssessmentAttemptDb(params.attemptId);
    if (!attempt) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Attempt not found'), { status: 404 });
    }
    if (attempt.studentId !== session.userId) {
      return NextResponse.json(
        createApiError('FORBIDDEN_OBJECT_ACCESS', 'You do not own this attempt'),
        { status: 403 }
      );
    }
    if (attempt.status !== 'EVALUATED' && attempt.status !== 'COMPLETED') {
      // Never leak correct answers for an attempt that is still open.
      return NextResponse.json(
        createApiError('BAD_REQUEST', 'Ye attempt abhi submit nahi hua hai.'),
        { status: 400 }
      );
    }

    const test: any = await findTestByIdDb(attempt.assessmentId);
    if (!test) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Test not found'), { status: 404 });
    }

    // Question tree of the test's course — the exact chain the submit
    // route scores against — with real subject/chapter names attached.
    const subjects: any[] = await listSubjectsByCourseDb(test.courseId);
    const meta = new Map<string, { q: any; subject: string | null; chapter: string | null }>();
    const order: string[] = [];
    for (const subject of subjects) {
      const chapters: any[] = await listChaptersBySubjectDb(subject.id);
      for (const chapter of chapters) {
        const qs: any[] = await listQuestionsByChapterDb(chapter.id);
        for (const q of qs) {
          if (!meta.has(q.id)) {
            meta.set(q.id, {
              q,
              subject: subject?.name || subject?.title || null,
              chapter: chapter?.title || chapter?.name || null,
            });
            order.push(q.id);
          }
        }
      }
    }

    const [respRows]: any = await mysqlPool.query(
      'SELECT * FROM AssessmentResponses WHERE attemptId = ?',
      [attempt.id]
    );
    const responseByQ = new Map<string, any>((respRows || []).map((r: any) => [r.questionId, r]));

    let correct = 0;
    let attemptedCount = 0;
    let maxScore = 0;
    const topicMap = new Map<string, { name: string; total: number; attempted: number; correct: number }>();

    const review = order.map((qid) => {
      const { q, subject, chapter } = meta.get(qid)!;
      const resp = responseByQ.get(qid);
      const optionsRaw = normalizeOptions(q.options);
      const options = optionsRaw.map(optionText);
      const marks = Number(q.marks || 0);
      maxScore += marks;

      const skipped = !resp || (resp.selectedOptionId == null && !resp.answerText);
      const isCorrect = !!resp && !!resp.isCorrect;
      if (!skipped) attemptedCount += 1;
      if (isCorrect) correct += 1;

      const topicName = subject || chapter;
      if (topicName) {
        const t = topicMap.get(topicName) || { name: topicName, total: 0, attempted: 0, correct: 0 };
        t.total += 1;
        if (!skipped) t.attempted += 1;
        if (isCorrect) t.correct += 1;
        topicMap.set(topicName, t);
      }

      return {
        questionId: qid,
        text: q.title,
        type: q.type,
        options,
        selectedIndex: optionsRaw.length ? resolveIndex(optionsRaw, resp?.selectedOptionId) : null,
        correctIndex: optionsRaw.length ? resolveIndex(optionsRaw, q.correctAnswer) : null,
        ...(optionsRaw.length === 0
          ? {
              yourAnswerText: resp?.answerText ?? null,
              correctAnswerText: q.correctAnswer != null ? String(q.correctAnswer) : null,
            }
          : {}),
        isCorrect,
        skipped,
        marks,
        marksObtained: resp ? Number(resp.marksObtained || 0) : 0,
        explanation: q.explanation || undefined,
        subject: subject || undefined,
        chapter: chapter || undefined,
      };
    });

    const totalQuestions = review.length;
    const wrong = Math.max(0, attemptedCount - correct);
    const skippedCount = Math.max(0, totalQuestions - attemptedCount);
    const accuracy =
      attemptedCount > 0 ? Math.round((correct / attemptedCount) * 1000) / 10 : null;

    // Real time taken: prefer the app-measured seconds; website attempts
    // fall back to startedAt -> completedAt. App-flow attempt rows are
    // created at submit time, so a near-zero derived diff is an artifact
    // — anything under 30s derived is treated as unknown, never faked.
    let totalTimeSec: number | null = null;
    if (attempt.timeTakenSec != null && Number(attempt.timeTakenSec) > 0) {
      totalTimeSec = Number(attempt.timeTakenSec);
    } else {
      const start = toMillis(attempt.startedAt);
      const end = toMillis(attempt.completedAt);
      if (start != null && end != null) {
        const diff = Math.round((end - start) / 1000);
        if (diff >= 30) totalTimeSec = diff;
      }
    }

    // Topic section only exists when questions carry real names.
    const topics = Array.from(topicMap.values()).map((t) => ({
      ...t,
      accuracy: t.attempted > 0 ? Math.round((t.correct / t.attempted) * 1000) / 10 : null,
    }));

    return NextResponse.json(
      createApiResponse({
        attemptId: attempt.id,
        testId: test.id,
        testTitle: test.title,
        status: attempt.status,
        startedAt: attempt.startedAt ?? null,
        completedAt: attempt.completedAt ?? null,
        summary: {
          score: attempt.score == null ? null : Number(attempt.score),
          maxScore,
          totalQuestions,
          attempted: attemptedCount,
          correct,
          wrong,
          skipped: skippedCount,
          accuracy,
          totalTimeSec,
          timePerQuestionSec:
            totalTimeSec != null && attemptedCount > 0
              ? Math.round(totalTimeSec / attemptedCount)
              : null,
          passed:
            test.passingMarks != null && attempt.score != null
              ? Number(attempt.score) >= Number(test.passingMarks)
              : undefined,
        },
        ...(topics.length > 0 ? { topics } : {}),
        review,
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
      createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to load attempt analysis.'),
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import {
  mysqlPool, findAssessmentAttemptDb, findTestByIdDb, listSubjectsByCourseDb,
  listChaptersBySubjectDb, listQuestionsByChapterDb, createAssessmentAttemptDb,
} from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

function normalizeOptions(raw: any): { id: string; text: string }[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.options)) return parsed.options;
  return [];
}

export async function POST(
  req: NextRequest,
  { params }: { params: { attemptId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json().catch(() => ({}));
    let attempt: any = await findAssessmentAttemptDb(params.attemptId);
    let test: any = null;
    // Mobile app flow: the URL param is a TEST id and the body is
    // { answers: [{ questionId, selected: <option index> }] }.
    let appAnswers: { questionId: string; selected?: number | null }[] | null = null;

    if (attempt) {
      if (attempt.studentId !== session.userId) {
        return NextResponse.json(createApiError('FORBIDDEN_OBJECT_ACCESS', 'You do not own this attempt'), { status: 403 });
      }
      if (attempt.status !== 'STARTED') {
        return NextResponse.json(createApiError('BAD_REQUEST', 'This attempt has already been submitted'), { status: 400 });
      }
      test = await findTestByIdDb(attempt.assessmentId);
      if (!test) {
        return NextResponse.json(createApiError('NOT_FOUND', 'Test not found'), { status: 404 });
      }
    } else {
      test = await findTestByIdDb(params.attemptId);
      if (!test) {
        return NextResponse.json(createApiError('NOT_FOUND', 'Attempt not found'), { status: 404 });
      }
      if (Array.isArray(body?.answers)) appAnswers = body.answers;
      // Reuse an already-open attempt for this student+test when one
      // exists (e.g. a retried submit after a lost response).
      const [openRows]: any = await mysqlPool.query(
        `SELECT * FROM AssessmentAttempts WHERE assessmentId = ? AND studentId = ? AND status = 'STARTED' ORDER BY createdAt DESC LIMIT 1`,
        [test.id, session.userId]
      );
      attempt =
        openRows?.[0] ||
        (await createAssessmentAttemptDb({
          id: randomUUID(),
          assessmentId: test.id,
          studentId: session.userId,
          score: 0,
          status: 'STARTED',
          startedAt: new Date().toISOString(),
        }));
    }

    const responses: { questionId: string; selectedOptionId?: string; answerText?: string }[] =
      Array.isArray(body?.responses) ? body.responses : [];

    const subjects = await listSubjectsByCourseDb(test.courseId);
    const questions = (
      await Promise.all(
        subjects.map(async (subject: any) => {
          const chapters = await listChaptersBySubjectDb(subject.id);
          return (await Promise.all(chapters.map((chapter: any) => listQuestionsByChapterDb(chapter.id)))).flat();
        })
      )
    ).flat();

    // Build the submission map: website sends `responses` with option
    // ids; the app sends `answers` with option INDEXES — resolve those
    // against each question's option list (same order the detail route
    // served them in).
    const submitted = new Map<string, any>(responses.map((r) => [r.questionId, r]));
    if (appAnswers) {
      const questionById = new Map((questions as any[]).map((q) => [q.id, q]));
      for (const a of appAnswers) {
        if (a == null || a.selected == null) continue;
        const q = questionById.get(a.questionId);
        if (!q) continue;
        const opt = normalizeOptions(q.options)[a.selected];
        if (opt == null) continue;
        const selectedOptionId = typeof opt === 'object' ? (opt.id ?? null) : String(opt);
        if (selectedOptionId) submitted.set(a.questionId, { questionId: a.questionId, selectedOptionId });
      }
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    let score = 0;
    let correctCount = 0;
    let answeredCount = 0;

    for (const question of questions as any[]) {
      const submission = submitted.get(question.id);
      const options = normalizeOptions(question.options);
      const selectedOptionId = submission?.selectedOptionId || null;
      const isCorrect =
        question.type === 'MCQ' || question.type === 'MULTIPLE_CORRECT'
          ? !!selectedOptionId && selectedOptionId === question.correctAnswer
          : !!submission?.answerText && submission.answerText.trim() === String(question.correctAnswer || '').trim();

      let marksObtained = 0;
      if (!selectedOptionId && !submission?.answerText) {
        marksObtained = 0;
      } else {
        answeredCount += 1;
        if (isCorrect) {
          marksObtained = Number(question.marks || 0);
          correctCount += 1;
        } else if (Number(question.negativeMarks || 0) > 0) {
          marksObtained = -Number(question.negativeMarks);
        }
      }
      score += marksObtained;

      await mysqlPool.query(
        `INSERT INTO AssessmentResponses (id, attemptId, questionId, selectedOptionId, answerText, isCorrect, marksObtained, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          attempt.id,
          question.id,
          selectedOptionId,
          submission?.answerText || null,
          isCorrect,
          marksObtained,
          now,
          now,
        ]
      );
    }

    const maxScore = questions.reduce((s: number, q: any) => s + Number(q.marks || 0), 0);
    await mysqlPool.query(
      `UPDATE AssessmentAttempts SET score = ?, status = 'EVALUATED', completedAt = ? WHERE id = ?`,
      [Math.max(0, score), now, attempt.id]
    );

    return NextResponse.json(
      createApiResponse({
        score: Math.max(0, score),
        maxScore,
        correctCount,
        answeredCount,
        totalQuestions: questions.length,
        passed: test.passingMarks != null ? Math.max(0, score) >= Number(test.passingMarks) : undefined,
        // Mobile app aliases (SubmitResult shape)
        total: questions.length,
        correct: correctCount,
        wrong: Math.max(0, answeredCount - correctCount),
        attempted: answeredCount,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', 'Failed to submit attempt'), { status: 500 });
  }
}
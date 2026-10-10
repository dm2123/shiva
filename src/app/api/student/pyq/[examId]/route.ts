import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const { examId } = params;

    const [exams]: any = await mysqlPool.query(
      'SELECT pe.* FROM PyqExams pe WHERE pe.id = ?',
      [examId]
    );

    if (!exams || exams.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'PYQ exam not found'), { status: 404 });
    }

    const [questions]: any = await mysqlPool.query(
      'SELECT id, questionText, questionType, options, marks, topic, difficulty FROM PyqQuestions WHERE examId = ? ORDER BY questionNumber ASC',
      [examId]
    );

    const [attempts]: any = await mysqlPool.query(
      'SELECT id, score, completed, completedAt FROM PyqAttempts WHERE examId = ? AND studentId = ? ORDER BY completedAt DESC',
      [examId, session.userId]
    );

    return NextResponse.json(
      createApiResponse({
        exam: exams[0],
        questions: questions || [],
        previousAttempts: attempts || [],
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch PYQ exam'), { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: { examId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const { examId } = params;
    const body = await req.json();

    const { answers } = body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'answers array is required'), { status: 400 });
    }

    const [exams]: any = await mysqlPool.query('SELECT * FROM PyqExams WHERE id = ?', [examId]);
    if (!exams || exams.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'PYQ exam not found'), { status: 404 });
    }

    const [questions]: any = await mysqlPool.query(
      'SELECT * FROM PyqQuestions WHERE examId = ?',
      [examId]
    );

    const answerMap = new Map(answers.map((a: any) => [a.questionId, a]));

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const attemptId = randomUUID();
    let score = 0;
    let correctCount = 0;
    let answeredCount = 0;

    await mysqlPool.query(
      'INSERT INTO PyqAttempts (id, examId, studentId, score, answers, startedAt, completedAt) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [attemptId, examId, session.userId, 0, JSON.stringify(answers), now, now]
    );

    for (const question of questions) {
      const submission = answerMap.get(question.id);
      const selectedOptionId = submission?.selectedOptionId || null;
      const answerText = submission?.answerText || null;

      const isCorrect =
        question.questionType === 'NUMERIC'
          ? !!answerText && String(answerText).trim() === String(question.correctAnswer || '').trim()
          : !!selectedOptionId && selectedOptionId === question.correctAnswer;

      let marksObtained = 0;
      if (selectedOptionId || answerText) {
        answeredCount += 1;
        if (isCorrect) {
          marksObtained = Number(question.marks || 0);
          correctCount += 1;
        }
      }
      score += marksObtained;
    }

    const maxScore = questions.reduce((s: number, q: any) => s + Number(q.marks || 0), 0);
    await mysqlPool.query('UPDATE PyqAttempts SET score = ? WHERE id = ?', [Math.max(0, score), attemptId]);

    return NextResponse.json(
      createApiResponse({
        attemptId,
        score: Math.max(0, score),
        maxScore,
        correctCount,
        answeredCount,
        totalQuestions: questions.length,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to submit PYQ attempt'), { status: 500 });
  }
}

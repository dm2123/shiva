import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT ds.id, ds.courseId, ds.title, ds.createdAt,
              c.title AS courseTitle,
              (SELECT COUNT(*) FROM DppQuestions dq WHERE dq.dppSetId = ds.id) AS questionCount,
              (SELECT COUNT(*) FROM DppAttempts da WHERE da.dppSetId = ds.id AND da.studentId = ?) AS attemptsTaken
       FROM DppSets ds
       JOIN Courses c ON ds.courseId = c.id
       JOIN StudentEnrollments e ON e.courseId = ds.courseId AND e.studentId = ? AND e.status = 'ACTIVE'
       ORDER BY ds.createdAt DESC`,
      [session.userId, session.userId]
    );

    return NextResponse.json(createApiResponse({ dppSets: rows || [] }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch DPP sets'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    const { courseId, title, questions } = body;

    if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'courseId, title, and questions[] are required'), { status: 400 });
    }

    const dppSetId = randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      'INSERT INTO DppSets (id, courseId, title, createdAt) VALUES (?, ?, ?, ?)',
      [dppSetId, courseId, title, now]
    );

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await mysqlPool.query(
        `INSERT INTO DppQuestions (id, dppSetId, questionText, questionType, options, correctAnswer, explanation, marks, sortOrder)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          dppSetId,
          q.questionText,
          q.questionType || 'MCQ',
          q.options ? JSON.stringify(q.options) : null,
          q.correctAnswer || null,
          q.explanation || null,
          q.marks || 4,
          i + 1,
        ]
      );
    }

    return NextResponse.json(createApiResponse({ dppSetId, title, questionCount: questions.length }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create DPP set'), { status: 500 });
  }
}

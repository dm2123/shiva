import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const examName = url.searchParams.get('examName');
    const year = url.searchParams.get('year');
    const subject = url.searchParams.get('subject');

    let query = `SELECT pe.id, pe.examName, pe.year, pe.subject, pe.shift, pe.totalQuestions, pe.totalMarks, pe.durationMinutes, pe.pdfUrl
                 FROM PyqExams pe
                 WHERE 1=1`;
    const params: any[] = [];

    if (examName) {
      query += ' AND pe.examName = ?';
      params.push(examName);
    }
    if (year) {
      query += ' AND pe.year = ?';
      params.push(Number(year));
    }
    if (subject) {
      query += ' AND pe.subject = ?';
      params.push(subject);
    }

    query += ' ORDER BY pe.year DESC, pe.createdAt DESC';

    const [rows]: any = await mysqlPool.query(query, params);

    return NextResponse.json(createApiResponse({ pyqExams: rows || [] }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch PYQ exams'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    const { courseId, title, examName, year, subject, timeLimitMinutes, questions } = body;

    if (!courseId || !title || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'courseId, title, and questions[] are required'), { status: 400 });
    }

    const examId = randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      `INSERT INTO PyqExams (id, examName, year, subject, totalQuestions, totalMarks, durationMinutes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        examId,
        title,
        year || null,
        subject || null,
        questions.length,
        questions.reduce((s: number, q: any) => s + Number(q.marks || 4), 0),
        timeLimitMinutes || questions.length * 1.5,
        now,
      ]
    );

    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      await mysqlPool.query(
        `INSERT INTO PyqQuestions (id, examId, questionNumber, questionText, questionType, options, correctAnswer, solution, marks)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          randomUUID(),
          examId,
          i + 1,
          q.questionText,
          q.questionType || 'MCQ',
          q.options ? JSON.stringify(q.options) : null,
          q.correctAnswer || null,
          q.explanation || null,
          q.marks || 4,
        ]
      );
    }

    return NextResponse.json(createApiResponse({ examId, title, questionCount: questions.length }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create PYQ exam'), { status: 500 });
  }
}

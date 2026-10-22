import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const courseId = url.searchParams.get('courseId');

    let query: string;
    let params: any[];

    if (courseId) {
      query = `
        SELECT s.name AS subject,
               COUNT(DISTINCT a.id) AS testsTaken,
               COALESCE(AVG(a.score), 0) AS avgScore,
               COALESCE(MAX(a.score), 0) AS highestScore
        FROM Subjects s
        JOIN Chapters ch ON s.id = ch.subjectId
        LEFT JOIN AssessmentAttempts a ON a.studentId = ?
        WHERE s.courseId = ?
        GROUP BY s.id, s.name
        ORDER BY avgScore ASC
      `;
      params = [session.userId, courseId];
    } else {
      query = `
        SELECT s.name AS subject, c.title AS course,
               COUNT(DISTINCT a.id) AS testsTaken,
               COALESCE(AVG(a.score), 0) AS avgScore,
               COALESCE(MAX(a.score), 0) AS highestScore
        FROM Subjects s
        JOIN Courses c ON s.courseId = c.id
        JOIN StudentEnrollments e ON c.id = e.courseId AND e.studentId = ?
        JOIN Chapters ch ON s.id = ch.subjectId
        LEFT JOIN AssessmentAttempts a ON a.studentId = ?
        GROUP BY s.id, s.name, c.title
        ORDER BY avgScore ASC
      `;
      params = [session.userId, session.userId];
    }

    const [rows]: any = await mysqlPool.query(query, params);

    return NextResponse.json({ success: true, data: { subjects: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

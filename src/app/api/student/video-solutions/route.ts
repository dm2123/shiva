import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Video solutions for a question
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('questionId');

    if (!questionId) {
      const [solutions]: any = await mysqlPool.query(
        `SELECT vs.*, q.questionText, s.name AS subjectName
         FROM VideoSolutions vs
         JOIN Questions q ON vs.questionId = q.id
         LEFT JOIN Subjects s ON q.subjectId = s.id
         WHERE vs.status = 'ACTIVE'
         ORDER BY vs.viewCount DESC LIMIT 20`
      );
      return NextResponse.json({ success: true, data: solutions });
    }

    const [solutions]: any = await mysqlPool.query(
      `SELECT vs.*, q.questionText, q.options, q.correctAnswer, s.name AS subjectName,
        (SELECT COUNT(*) FROM VideoSolutionViews WHERE solutionId = vs.id AND userId = ?) AS userViewed
       FROM VideoSolutions vs
       JOIN Questions q ON vs.questionId = q.id
       LEFT JOIN Subjects s ON q.subjectId = s.id
       WHERE vs.questionId = ? AND vs.status = 'ACTIVE'`,
      [session.userId, questionId]
    );

    // Track view
    if (solutions.length > 0) {
      const { randomUUID } = await import('crypto');
      await mysqlPool.query(
        `INSERT INTO VideoSolutionViews (id, userId, solutionId) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE viewedAt = NOW()`,
        [randomUUID(), session.userId, solutions[0].id]
      );
      await mysqlPool.query('UPDATE VideoSolutions SET viewCount = viewCount + 1 WHERE id = ?', [solutions[0].id]);
    }

    return NextResponse.json({ success: true, data: solutions });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [tests]: any = await mysqlPool.query(
      `SELECT t.*, c.title AS courseTitle
       FROM Tests t
       LEFT JOIN Courses c ON t.courseId = c.id
       WHERE t.id = ? AND t.isScholarshipTest = 1`,
      [params.id]
    );

    if (tests.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Scholarship test not found' } }, { status: 404 });
    }

    const test = tests[0];

    // Check if already attempted
    const [attempts]: any = await mysqlPool.query(
      'SELECT id, score, completedAt FROM AssessmentAttempts WHERE testId = ? AND studentId = ?',
      [params.id, session.userId]
    );

    // Get questions
    const [questions]: any = await mysqlPool.query(
      'SELECT id, questionText, options, marks FROM Questions WHERE testId = ? ORDER BY id',
      [params.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        test,
        questions: attempts.length > 0 ? [] : questions, // Hide questions if already attempted
        attempts
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

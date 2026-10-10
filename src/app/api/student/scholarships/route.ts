import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT t.*, c.title AS courseTitle,
              (SELECT COUNT(*) FROM AssessmentAttempts WHERE testId = t.id) AS totalAttempts,
              (SELECT MAX(score) FROM AssessmentAttempts WHERE testId = t.id) AS highScore
       FROM Tests t
       LEFT JOIN Courses c ON t.courseId = c.id
       WHERE t.isScholarshipTest = 1
       ORDER BY t.startTime DESC`
    );

    return NextResponse.json({ success: true, data: { scholarships: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

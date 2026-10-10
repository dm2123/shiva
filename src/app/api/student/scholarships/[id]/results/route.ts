import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [attempts]: any = await mysqlPool.query(
      `SELECT a.*, t.title AS testTitle, t.scholarshipPercentage
       FROM AssessmentAttempts a
       JOIN Tests t ON a.testId = t.id
       WHERE a.testId = ? AND a.studentId = ?
       ORDER BY a.completedAt DESC`,
      [params.id, session.userId]
    );

    if (attempts.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'No attempt found' } }, { status: 404 });
    }

    const attempt = attempts[0];

    // Get leaderboard for this test
    const [leaderboard]: any = await mysqlPool.query(
      `SELECT a.studentId, sp.name, a.score, a.percentage,
              ROW_NUMBER() OVER (ORDER BY a.score DESC) AS userRank
       FROM AssessmentAttempts a
       JOIN StudentProfiles sp ON a.studentId = sp.userId
       WHERE a.testId = ?
       ORDER BY a.score DESC
       LIMIT 20`,
      [params.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        attempt,
        leaderboard
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    // Total courses enrolled
    const [courses]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS count FROM StudentEnrollments WHERE studentId = ?',
      [session.userId]
    );

    // Test stats
    const [testStats]: any = await mysqlPool.query(
      `SELECT 
        COUNT(*) AS totalTests,
        COALESCE(AVG(score), 0) AS avgScore,
        COALESCE(MAX(score), 0) AS highestScore,
        COALESCE(MIN(score), 0) AS lowestScore
       FROM AssessmentAttempts WHERE studentId = ?`,
      [session.userId]
    );

    // XP and streak
    const [xp]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS totalXP FROM StudentXP WHERE studentId = ?',
      [session.userId]
    );

    const [streak]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS totalDays FROM DailyStreaks WHERE studentId = ?',
      [session.userId]
    );

    // Doubts
    const [doubts]: any = await mysqlPool.query(
      `SELECT 
        COUNT(*) AS total,
        SUM(CASE WHEN status = 'RESOLVED' THEN 1 ELSE 0 END) AS resolved
       FROM Doubts WHERE studentId = ?`,
      [session.userId]
    );

    // Rank
    const [rank]: any = await mysqlPool.query(
      `SELECT COUNT(*) + 1 AS userRank FROM (
        SELECT studentId, SUM(totalXP) AS tp FROM LeaderboardCache GROUP BY studentId HAVING tp > (
          SELECT COALESCE(SUM(points), 0) FROM StudentXP WHERE studentId = ?
        )
      ) ranks`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        coursesEnrolled: courses[0]?.count || 0,
        totalTests: testStats[0]?.totalTests || 0,
        avgScore: Math.round(testStats[0]?.avgScore || 0),
        highestScore: testStats[0]?.highestScore || 0,
        lowestScore: testStats[0]?.lowestScore || 0,
        totalXP: xp[0]?.totalXP || 0,
        totalStreak: streak[0]?.totalDays || 0,
        doubtsAsked: doubts[0]?.total || 0,
        doubtsResolved: doubts[0]?.resolved || 0,
        leaderboardRank: rank[0]?.userRank || '-'
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

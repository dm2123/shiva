import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureAnalyticsSchema } from '@/lib/ensure-analytics-schema';
import { ensureGamificationSchema } from '@/lib/ensure-gamification-schema';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureAnalyticsSchema();
    await ensureGamificationSchema();

    // Score trends over last 10 tests
    const [trends]: any = await mysqlPool.query(
      `SELECT a.score, a.completedAt, ass.title
       FROM AssessmentAttempts a
       JOIN Assessments ass ON a.assessmentId = ass.id
       WHERE a.studentId = ?
       ORDER BY a.completedAt DESC
       LIMIT 10`,
      [session.userId]
    );

    // XP earned per day (last 30 days)
    const [xpTrends]: any = await mysqlPool.query(
      `SELECT DATE(createdAt) AS date, SUM(points) AS xp
       FROM StudentXP
       WHERE studentId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(createdAt)
       ORDER BY date ASC`,
      [session.userId]
    );

    // Activity heatmap (last 30 days)
    const [activity]: any = await mysqlPool.query(
      `SELECT DATE(createdAt) AS date, COUNT(*) AS activities
       FROM StudentXP
       WHERE studentId = ? AND createdAt >= DATE_SUB(NOW(), INTERVAL 30 DAY)
       GROUP BY DATE(createdAt)
       ORDER BY date ASC`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        scoreTrends: trends.reverse(),
        xpTrends,
        activity
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

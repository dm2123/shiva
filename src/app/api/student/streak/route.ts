import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureGamificationSchema } from '@/lib/ensure-gamification-schema';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureGamificationSchema();

    // Get last 365 days of streaks (current-streak loop runs 365 days;
    // fetching only 30 silently capped every long streak at 30)
    const [streaks]: any = await mysqlPool.query(
      `SELECT * FROM DailyStreaks
       WHERE studentId = ? AND streakDate >= DATE_SUB(CURDATE(), INTERVAL 365 DAY)
       ORDER BY streakDate DESC`,
      [session.userId]
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const found = streaks.find((s: any) => {
        const d = new Date(s.streakDate).toISOString().split('T')[0];
        return d === dateStr;
      });
      if (found) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Get total login days
    const [totalDays]: any = await mysqlPool.query(
      'SELECT COUNT(*) AS days FROM DailyStreaks WHERE studentId = ?',
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        totalDays: totalDays[0]?.days || 0,
        streaks
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

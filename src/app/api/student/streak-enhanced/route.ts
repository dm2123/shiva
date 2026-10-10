import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Get streak rewards and user progress
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);

    const [rewards]: any = await mysqlPool.query(
      'SELECT * FROM StreakRewards ORDER BY streakDays ASC'
    );

    const [streak]: any = await mysqlPool.query(
      'SELECT * FROM DailyStreaks WHERE userId = ? ORDER BY date DESC LIMIT 30',
      [session.userId]
    );

    const [userXP]: any = await mysqlPool.query(
      'SELECT * FROM StudentXP WHERE userId = ?', [session.userId]
    );

    // Calculate current streak
    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCheckin = streak.some((s: any) => {
        const sDate = new Date(s.date).toISOString().split('T')[0];
        return sDate === dateStr && (s.loginMinutes > 0 || s.testsAttempted > 0 || s.lecturesAttended > 0);
      });
      if (hasCheckin) {
        currentStreak++;
      } else if (i > 0) {
        break;
      }
    }

    // Get achieved rewards
    const [achievedRewards]: any = await mysqlPool.query(
      `SELECT * FROM StudentXP WHERE userId = ? AND source = 'STREAK'`,
      [session.userId]
    );

    // Calendar data (last 30 days)
    const calendarData = streak.map((s: any) => ({
      date: s.date,
      active: s.loginMinutes > 0 || s.testsAttempted > 0 || s.lecturesAttended > 0,
      loginMinutes: s.loginMinutes,
      testsAttempted: s.testsAttempted,
      lecturesAttended: s.lecturesAttended,
    }));

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        longestStreak: userXP[0]?.longestStreak || currentStreak,
        totalXP: userXP[0]?.totalXP || 0,
        rewards,
        achievedRewards: achievedRewards.map((r: any) => r.sourceId),
        calendar: calendarData,
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Check in for today
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const today = new Date().toISOString().split('T')[0];

    // Upsert daily streak
    await mysqlPool.query(
      `INSERT INTO DailyStreaks (userId, date, loginMinutes, testsAttempted, lecturesAttended)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE
         loginMinutes = GREATEST(loginMinutes, VALUES(loginMinutes)),
         testsAttempted = GREATEST(testsAttempted, VALUES(testsAttempted)),
         lecturesAttended = GREATEST(lecturesAttended, VALUES(lecturesAttended))`,
      [session.userId, today, body.loginMinutes || 0, body.testsAttempted || 0, body.lecturesAttended || 0]
    );

    // Recalculate streak
    const [streak]: any = await mysqlPool.query(
      'SELECT * FROM DailyStreaks WHERE userId = ? ORDER BY date DESC LIMIT 365',
      [session.userId]
    );
    let currentStreak = 0;
    const now = new Date();
    for (let i = 0; i < 365; i++) {
      const checkDate = new Date(now);
      checkDate.setDate(checkDate.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0];
      const hasCheckin = streak.some((s: any) => {
        const sDate = new Date(s.date).toISOString().split('T')[0];
        return sDate === dateStr && (s.loginMinutes > 0 || s.testsAttempted > 0 || s.lecturesAttended > 0);
      });
      if (hasCheckin) currentStreak++;
      else if (i > 0) break;
    }

    // Check for streak rewards
    const [rewards]: any = await mysqlPool.query(
      'SELECT * FROM StreakRewards WHERE streakDays = ?', [currentStreak]
    );

    // Award XP for streak
    if (rewards.length > 0) {
      for (const reward of rewards) {
        if (reward.rewardType === 'XP') {
          const { randomUUID } = await import('crypto');
          await mysqlPool.query(
            `INSERT INTO StudentXP (id, userId, amount, source, sourceId, description)
             VALUES (?, ?, ?, 'STREAK', ?, ?)
             ON DUPLICATE KEY UPDATE amount = VALUES(amount)`,
            [randomUUID(), session.userId, reward.rewardValue, reward.id, reward.rewardName]
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        currentStreak,
        rewardsEarned: rewards.map((r: any) => r.rewardName),
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

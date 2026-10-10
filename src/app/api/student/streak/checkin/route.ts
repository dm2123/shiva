import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const today = new Date().toISOString().split('T')[0];

    // Check if already checked in today
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM DailyStreaks WHERE studentId = ? AND streakDate = ?',
      [session.userId, today]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: { alreadyCheckedIn: true } });
    }

    // Create today's streak entry
    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO DailyStreaks (id, studentId, streakDate, loginMinutes) VALUES (?, ?, ?, 1)',
      [id, session.userId, today]
    );

    // Award daily login XP
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 2, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Daily login check-in']
    );

    // Calculate streak bonus
    const [prevStreak]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS streak FROM (
        SELECT streakDate FROM DailyStreaks
        WHERE studentId = ? AND streakDate < ?
        ORDER BY streakDate DESC LIMIT 30
      ) sub WHERE streakDate >= DATE_SUB(?, INTERVAL DAYOFWEEK(?) DAY)`,
      [session.userId, today, today, today]
    );

    const streakDays = (prevStreak[0]?.streak || 0) + 1;
    const bonus = Math.min(streakDays, 7); // Max 7 bonus XP

    if (bonus > 1) {
      await mysqlPool.query(
        'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, ?, ?, ?)',
        [uuid(), session.userId, bonus, 'STREAK', `Day ${streakDays} streak bonus`]
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        checkedIn: true,
        streakDays,
        bonusXP: bonus
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

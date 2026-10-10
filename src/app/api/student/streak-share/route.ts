import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Share streak
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { platform, streakDays, message } = body;

    const shareMessages: Record<string, string> = {
      TWITTER: `🔥 I'm on a ${streakDays}-day study streak on THE SHIVA! Consistency is key to success! #StudyStreak #THE_SHIVA`,
      FACEBOOK: `🔥 ${streakDays}-day study streak on THE SHIVA! Keep pushing, keep growing! 💪`,
      WHATSAPP: `🔥 ${streakDays}-day study streak on THE SHIVA! Join me and let's crack it together! 💪`,
      INSTAGRAM: `🔥 ${streakDays} days strong! #StudyStreak #THE_SHIVA #Consistency`,
    };

    const id = randomUUID();
    const shareUrl = `https://the-shiva.com/streak/${session.userId}`;
    await mysqlPool.query(
      `INSERT INTO StreakShares (id, userId, platform, streakDays, message, shareUrl) VALUES (?, ?, ?, ?, ?, ?)`,
      [id, session.userId, platform, streakDays, message || shareMessages[platform] || '', shareUrl]
    );

    return NextResponse.json({ success: true, data: { shareUrl, message: shareMessages[platform] } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get share history
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const [shares]: any = await mysqlPool.query(
      'SELECT * FROM StreakShares WHERE userId = ? ORDER BY createdAt DESC LIMIT 10',
      [session.userId]
    );
    return NextResponse.json({ success: true, data: shares });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

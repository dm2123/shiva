import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureGamificationSchema } from '@/lib/ensure-gamification-schema';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureGamificationSchema();
    const body = await req.json();
    const { points, source, description, courseId } = body;

    // Positive integers only: the old `!points` check let negative
    // points through, silently shrinking total XP and the
    // LeaderboardCache total on the upsert below.
    if (!Number.isInteger(points) || points <= 0 || !source) {
      return NextResponse.json({ success: false, error: { message: 'points must be a positive integer and source required' } }, { status: 400 });
    }

    const validSources = ['TEST', 'LECTURE', 'DPP', 'STREAK', 'REFERRAL', 'DAILY_LOGIN', 'SCHOLARSHIP'];
    if (!validSources.includes(source)) {
      return NextResponse.json({ success: false, error: { message: 'Invalid source' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, ?, ?, ?)',
      [id, session.userId, points, source, description || null]
    );

    // Update leaderboard cache if courseId provided
    if (courseId) {
      await mysqlPool.query(
        `INSERT INTO LeaderboardCache (id, courseId, studentId, totalXP, updatedAt)
         VALUES (?, ?, ?, ?, NOW())
         ON DUPLICATE KEY UPDATE totalXP = totalXP + ?, updatedAt = NOW()`,
        [uuid(), courseId, session.userId, points, points]
      );
    }

    return NextResponse.json({ success: true, data: { id, points, source } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

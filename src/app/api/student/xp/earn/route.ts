import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { points, source, description, courseId } = body;

    if (!points || !source) {
      return NextResponse.json({ success: false, error: { message: 'points and source required' } }, { status: 400 });
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

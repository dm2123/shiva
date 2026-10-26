import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureGamificationSchema } from '@/lib/ensure-gamification-schema';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureGamificationSchema();

    const [totalXP]: any = await mysqlPool.query(
      'SELECT COALESCE(SUM(points), 0) AS total FROM StudentXP WHERE studentId = ?',
      [session.userId]
    );

    const [history]: any = await mysqlPool.query(
      'SELECT * FROM StudentXP WHERE studentId = ? ORDER BY createdAt DESC LIMIT 50',
      [session.userId]
    );

    const [bySource]: any = await mysqlPool.query(
      'SELECT source, SUM(points) AS total FROM StudentXP WHERE studentId = ? GROUP BY source',
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        totalXP: totalXP[0]?.total || 0,
        history: history,
        bySource: bySource
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

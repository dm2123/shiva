import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [leaderboard]: any = await mysqlPool.query(
      `SELECT r.referrerId AS studentId, sp.name,
              COUNT(*) AS totalReferrals,
              SUM(r.rewardAmount) AS totalEarned
       FROM Referrals r
       JOIN StudentProfiles sp ON r.referrerId = sp.userId
       GROUP BY r.referrerId, sp.name
       ORDER BY totalReferrals DESC
       LIMIT 20`
    );

    return NextResponse.json({ success: true, data: { leaderboard } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

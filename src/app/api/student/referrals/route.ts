import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    // Get user's referral code
    const [user]: any = await mysqlPool.query(
      'SELECT referralCode FROM Users WHERE id = ?',
      [session.userId]
    );

    // Get referral stats
    const [referrals]: any = await mysqlPool.query(
      `SELECT r.*, sp.name AS referredName
       FROM Referrals r
       LEFT JOIN StudentProfiles sp ON r.referredUserId = sp.userId
       WHERE r.referrerUserId = ?
       ORDER BY r.createdAt DESC`,
      [session.userId]
    );

    const totalEarned = referrals.reduce((sum: number, r: any) => sum + (r.rewardAmount || 0), 0);

    return NextResponse.json({
      success: true,
      data: {
        referralCode: user[0]?.referralCode,
        referrals,
        totalReferrals: referrals.length,
        totalEarned
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

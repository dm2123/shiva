import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT s.*, sp.name AS planName, sp.price, sp.durationDays, sp.features
       FROM Subscriptions s
       JOIN SubscriptionPlans sp ON s.planId = sp.id
       WHERE s.studentId = ?
       ORDER BY s.createdAt DESC
       LIMIT 1`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: {
        subscription: rows[0] || null
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

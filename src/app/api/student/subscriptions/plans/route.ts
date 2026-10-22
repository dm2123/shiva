import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM SubscriptionPlans WHERE isActive = 1 ORDER BY price ASC'
    );

    return NextResponse.json({ success: true, data: { plans: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

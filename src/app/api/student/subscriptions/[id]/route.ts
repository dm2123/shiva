import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { status } = body;

    if (status !== 'CANCELLED') {
      return NextResponse.json({ success: false, error: { message: 'Invalid status' } }, { status: 400 });
    }

    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM Subscriptions WHERE id = ? AND studentId = ? AND status = ?',
      [params.id, session.userId, 'ACTIVE']
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Subscription not found' } }, { status: 404 });
    }

    await mysqlPool.query(
      'UPDATE Subscriptions SET status = ?, endDate = NOW() WHERE id = ?',
      ['CANCELLED', params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

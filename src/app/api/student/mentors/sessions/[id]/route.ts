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
      'SELECT id FROM MentorshipSessions WHERE id = ? AND studentId = ? AND status = ?',
      [params.id, session.userId, 'PENDING']
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Session not found or cannot cancel' } }, { status: 404 });
    }

    await mysqlPool.query(
      'UPDATE MentorshipSessions SET status = ? WHERE id = ?',
      ['CANCELLED', params.id]
    );

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

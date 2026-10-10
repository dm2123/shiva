import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const { action, content } = body;

    if (action === 'assign') {
      await mysqlPool.query(
        'UPDATE Doubts SET assignedTo = ?, assignedAt = NOW(), status = ? WHERE id = ? AND (assignedTo IS NULL OR status = ?)',
        [session.userId, 'IN_PROGRESS', params.id, 'OPEN']
      );
      return NextResponse.json({ success: true });
    }

    if (action === 'resolve') {
      if (!content?.trim()) {
        return NextResponse.json({ success: false, error: { message: 'Resolution message required' } }, { status: 400 });
      }

      // Add resolution message
      const msgId = uuid();
      await mysqlPool.query(
        'INSERT INTO DoubtMessages (id, doubtId, senderId, senderRole, content) VALUES (?, ?, ?, ?, ?)',
        [msgId, params.id, session.userId, 'TEACHER', content.trim()]
      );

      // Mark resolved
      await mysqlPool.query(
        'UPDATE Doubts SET status = ?, resolvedAt = NOW() WHERE id = ?',
        ['RESOLVED', params.id]
      );

      return NextResponse.json({ success: true });
    }

    if (action === 'reply') {
      if (!content?.trim()) {
        return NextResponse.json({ success: false, error: { message: 'Reply content required' } }, { status: 400 });
      }

      const msgId = uuid();
      await mysqlPool.query(
        'INSERT INTO DoubtMessages (id, doubtId, senderId, senderRole, content) VALUES (?, ?, ?, ?, ?)',
        [msgId, params.id, session.userId, 'TEACHER', content.trim()]
      );

      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: { message: 'Invalid action' } }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

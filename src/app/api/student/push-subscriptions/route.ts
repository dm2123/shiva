import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { endpoint, p256dh, auth: authKey } = body;
    if (!endpoint || !p256dh || !authKey) {
      return NextResponse.json({ error: 'Missing subscription data' }, { status: 400 });
    }
    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO PushSubscriptions (id, userId, endpoint, p256dh, authKey) VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE p256dh = VALUES(p256dh), authKey = VALUES(authKey), updatedAt = NOW()`,
      [id, session.userId, endpoint, p256dh, authKey]
    );
    return NextResponse.json({ success: true, message: 'Subscribed to push notifications' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint');
    if (endpoint) {
      await mysqlPool.query('DELETE FROM PushSubscriptions WHERE userId = ? AND endpoint = ?', [session.userId, endpoint]);
    } else {
      await mysqlPool.query('DELETE FROM PushSubscriptions WHERE userId = ?', [session.userId]);
    }
    return NextResponse.json({ success: true, message: 'Unsubscribed' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - Get notification preferences
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM NotificationPreferences WHERE userId = ?', [session.userId]
    );
    if (rows.length === 0) {
      const id = randomUUID();
      await mysqlPool.query(
        'INSERT INTO NotificationPreferences (id, userId) VALUES (?, ?)', [id, session.userId]
      );
      const [newRows]: any = await mysqlPool.query('SELECT * FROM NotificationPreferences WHERE id = ?', [id]);
      return NextResponse.json({ success: true, data: newRows[0] });
    }
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update notification preferences
export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const fields = ['liveClassAlerts','testAlerts','assignmentAlerts','doubtAlerts','announcementAlerts',
      'streakReminders','weeklyReport','emailNotifications','smsNotifications','pushEnabled',
      'quietHoursStart','quietHoursEnd'];
    const updates: string[] = [];
    const values: any[] = [];
    for (const f of fields) {
      if (body[f] !== undefined) {
        updates.push(`${f} = ?`);
        values.push(body[f]);
      }
    }
    if (updates.length === 0) return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    values.push(session.userId);
    await mysqlPool.query(`UPDATE NotificationPreferences SET ${updates.join(', ')} WHERE userId = ?`, values);
    const [rows]: any = await mysqlPool.query('SELECT * FROM NotificationPreferences WHERE userId = ?', [session.userId]);
    return NextResponse.json({ success: true, data: rows[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

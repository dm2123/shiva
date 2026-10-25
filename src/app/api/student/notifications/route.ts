import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureNotificationsSchema } from '@/lib/ensure-notifications-schema';

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.STUDENT);
    await ensureNotificationsSchema();
    const [rows]: any = await mysqlPool.query(
      `SELECT id, title, message, type, isRead, createdAt
       FROM Notifications
       WHERE userId = ?
       ORDER BY createdAt DESC
       LIMIT 50`,
      [user.userId]
    );

    return NextResponse.json({ success: true, data: { notifications: rows } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: 'Failed to load notifications' } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.STUDENT);
    const { ids } = await req.json();
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'A list of notification ids is required' } }, { status: 400 });
    }

    const placeholders = ids.map(() => '?').join(', ');
    await ensureNotificationsSchema();
    await mysqlPool.query(
      `UPDATE Notifications SET isRead = TRUE
       WHERE userId = ? AND id IN (${placeholders})`,
      [user.userId, ...ids]
    );

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: 'Failed to update notifications' } }, { status: 500 });
  }
}
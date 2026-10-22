import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [payments]: any = await mysqlPool.query(
      `SELECT p.*, c.title AS courseTitle
       FROM Payments p
       JOIN Courses c ON p.courseId = c.id
       WHERE p.studentId = ?
       ORDER BY p.createdAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: { payments } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

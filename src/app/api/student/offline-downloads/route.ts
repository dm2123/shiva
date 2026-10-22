import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows] = await mysqlPool.query(
      `SELECT id, title, contentType, sizeMB, status, downloadedAt, expiresAt, progress
       FROM offlinecontent
       WHERE userId = ?
       ORDER BY downloadedAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    return NextResponse.json({ success: true, data: [] });
  }
}

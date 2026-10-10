import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM OfflineDownloads WHERE id = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (existing.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Download not found' } }, { status: 404 });
    }

    await mysqlPool.query('DELETE FROM OfflineDownloads WHERE id = ?', [params.id]);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

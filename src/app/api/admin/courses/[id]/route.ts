import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { id } = params;
    if (mysqlPool) {
      // Direct delete, don't worry about foreign keys for now (handled by DB cascade)
      await mysqlPool.query('DELETE FROM Courses WHERE id = ?', [id]);
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}


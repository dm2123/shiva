import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    // Check center exists
    const [centers]: any = await mysqlPool.query(
      'SELECT id FROM OfflineCenters WHERE id = ? AND isActive = 1',
      [params.id]
    );

    if (centers.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Center not found' } }, { status: 404 });
    }

    // Check if already enrolled
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM CenterEnrollments WHERE centerId = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already enrolled' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO CenterEnrollments (id, centerId, studentId, status) VALUES (?, ?, ?, ?)',
      [id, params.id, session.userId, 'PENDING']
    );

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

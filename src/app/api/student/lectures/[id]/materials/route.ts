import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM LectureMaterials WHERE lectureId = ? ORDER BY createdAt DESC',
      [params.id]
    );
    return NextResponse.json({ success: true, data: { materials: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

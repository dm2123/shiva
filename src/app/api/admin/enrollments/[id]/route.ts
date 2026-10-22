import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { id } = params;
    const body = await req.json();

    const allowed: any = {};
    if (body.batchId !== undefined) allowed.batchId = body.batchId || null;
    if (body.status !== undefined) allowed.status = body.status;

    if (Object.keys(allowed).length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Nothing to update' } }, { status: 400 });
    }

    const fields = Object.keys(allowed).map(k => `${k} = ?`).join(', ');
    const values = [...Object.values(allowed), id];
    const [result]: any = await mysqlPool.query(`UPDATE StudentEnrollments SET ${fields} WHERE id = ?`, values);

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: { message: 'Enrollment not found' } }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message || 'Update failed' } }, { status: 400 });
  }
}
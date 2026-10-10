import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { class: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT DISTINCT subject FROM NCERTSolutions WHERE classLevel = ? ORDER BY subject ASC',
      [params.class]
    );

    return NextResponse.json({
      success: true,
      data: { subjects: rows.map((r: any) => r.subject) }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

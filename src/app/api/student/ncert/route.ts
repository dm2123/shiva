import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT DISTINCT classLevel FROM NCERTSolutions ORDER BY classLevel ASC'
    );

    return NextResponse.json({
      success: true,
      data: { classes: rows.map((r: any) => r.classLevel) }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

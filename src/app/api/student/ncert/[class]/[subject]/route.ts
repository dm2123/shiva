import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { class: string; subject: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM NCERTSolutions WHERE classLevel = ? AND subject = ? ORDER BY chapterNumber ASC',
      [params.class, params.subject]
    );

    return NextResponse.json({
      success: true,
      data: { chapters: rows }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

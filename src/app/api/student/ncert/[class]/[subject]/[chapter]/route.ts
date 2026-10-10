import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { class: string; subject: string; chapter: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM NCERTSolutions WHERE classLevel = ? AND subject = ? AND chapterNumber = ?',
      [params.class, params.subject, params.chapter]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Chapter not found' } }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: { chapter: rows[0] }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

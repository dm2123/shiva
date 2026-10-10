import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    // Get current handRaises
    const [rows]: any = await mysqlPool.query(
      'SELECT handRaises FROM LiveClasses WHERE id = ?',
      [params.id]
    );

    if (rows.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Live class not found' } }, { status: 404 });
    }

    let handRaises: string[] = [];
    try {
      handRaises = JSON.parse(rows[0].handRaises || '[]');
    } catch {
      handRaises = [];
    }

    // Toggle hand raise
    const idx = handRaises.indexOf(session.userId);
    if (idx >= 0) {
      handRaises.splice(idx, 1); // Lower hand
    } else {
      handRaises.push(session.userId); // Raise hand
    }

    await mysqlPool.query(
      'UPDATE LiveClasses SET handRaises = ? WHERE id = ?',
      [JSON.stringify(handRaises), params.id]
    );

    return NextResponse.json({
      success: true,
      data: { handRaised: idx < 0, handRaises }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

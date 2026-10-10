import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT ms.*, sp.name AS mentorName
       FROM MentorshipSessions ms
       LEFT JOIN StudentProfiles sp ON ms.mentorId = sp.userId
       WHERE ms.studentId = ?
       ORDER BY ms.scheduledAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: { sessions: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

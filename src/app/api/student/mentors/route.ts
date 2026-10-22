import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT tp.userId, sp.name, sp.email, tp.specialization, tp.experience, tp.bio,
              (SELECT COUNT(*) FROM Mentorships WHERE mentorId = tp.userId AND status = 'ACTIVE') AS activeStudents,
              (SELECT COUNT(*) FROM MentorshipSessions WHERE mentorId = tp.userId) AS totalSessions
       FROM TeacherProfiles tp
       JOIN StudentProfiles sp ON tp.userId = sp.userId
       WHERE tp.status = 'active'
       ORDER BY totalSessions DESC`
    );

    return NextResponse.json({ success: true, data: { mentors: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

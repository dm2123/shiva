import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Teacher availability for booking
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const teacherId = searchParams.get('teacherId');

    let where = 'WHERE ta.isActive = 1';
    const params: any[] = [];
    if (teacherId) { where += ' AND ta.teacherId = ?'; params.push(teacherId); }

    const [slots]: any = await mysqlPool.query(
      `SELECT ta.*, tp.name AS teacherName, tp.qualification
       FROM TeacherAvailability ta
       LEFT JOIN TeacherProfiles tp ON ta.teacherId = tp.userId
       ${where}
       ORDER BY ta.dayOfWeek, ta.startTime`,
      params
    );

    return NextResponse.json({ success: true, data: slots });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

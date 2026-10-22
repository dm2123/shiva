import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.PARENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT psl.studentId, sp.name, sp.email, pp.studentClass,
              (SELECT COUNT(*) FROM Enrollments WHERE studentId = psl.studentId) AS enrolledCourses
       FROM ParentStudentLinks psl
       LEFT JOIN StudentProfiles sp ON psl.studentId = sp.userId
       LEFT JOIN ParentProfiles pp ON pp.userId = session.userId
       WHERE psl.parentId = ?`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: { children: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureStudentSearchSchema } from '@/lib/ensure-student-search-schema';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';

// GET - Admin search students
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.ADMIN);
    await ensureStudentSearchSchema();
    await ensureStudentProfileSchema();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (q) {
      where += ' AND (ssi.name LIKE ? OR ssi.email LIKE ? OR ssi.phone LIKE ? OR ssi.targetExam LIKE ?)';
      params.push(`%${q}%`, `%${q}%`, `%${q}%`, `%${q}%`);
    }

    const [countResult]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM StudentSearchIndex ssi ${where}`, params
    );

    const [students]: any = await mysqlPool.query(
      `SELECT ssi.*, sp.phone, sp.targetExam, sp.currentClass
       FROM StudentSearchIndex ssi
       LEFT JOIN StudentProfiles sp ON ssi.userId = sp.userId
       ${where}
       ORDER BY ssi.lastActiveAt DESC, ssi.totalXP DESC
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    const [stats]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS totalStudents,
        SUM(CASE WHEN enrollmentStatus = 'ACTIVE' THEN 1 ELSE 0 END) AS activeStudents,
        ROUND(AVG(avgTestScore), 1) AS avgScore,
        ROUND(AVG(totalXP), 0) AS avgXP
       FROM StudentSearchIndex`
    );

    return NextResponse.json({
      success: true,
      data: {
        students,
        stats: stats[0],
        pagination: { page, limit, total: countResult[0]?.total || 0, totalPages: Math.ceil((countResult[0]?.total || 0) / limit) }
      }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

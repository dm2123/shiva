import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') || '').trim();

    let query = `
      SELECT u.id as userId, u.email, u.status, u.createdAt,
             sp.id as profileId, sp.name, sp.phone, sp.targetExam,
             (SELECT COUNT(*) FROM StudentEnrollments se WHERE se.studentId = u.id) as enrollmentCount
      FROM StudentProfiles sp
      JOIN Users u ON u.id = sp.userId
    `;
    const params: any[] = [];

    if (q) {
      query += ` WHERE sp.name LIKE ? OR sp.phone LIKE ? OR u.email LIKE ?`;
      const like = `%${q}%`;
      params.push(like, like, like);
    }

    query += ` ORDER BY u.createdAt DESC LIMIT 100`;

    const [rows]: any = await mysqlPool.query(query, params);
    return NextResponse.json({ success: true, data: { students: rows } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Error fetching students' }, { status: 500 });
  }
}
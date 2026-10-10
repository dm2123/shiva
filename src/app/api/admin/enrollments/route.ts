import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createApiResponse } from '@/lib/utils';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    if (mysqlPool) {
      const [rows] = await mysqlPool.query(`
        SELECT e.id, e.studentId, e.courseId, e.batchId, e.status, e.enrolledAt,
               s.name as studentName, c.title as courseTitle, b.name as batchName
        FROM StudentEnrollments e
        LEFT JOIN StudentProfiles s ON e.studentId = s.userId
        LEFT JOIN Courses c ON e.courseId = c.id
        LEFT JOIN Batches b ON e.batchId = b.id
        ORDER BY e.enrolledAt DESC
      `);
      return NextResponse.json(createApiResponse({ enrollments: rows }));
    }
    return NextResponse.json(createApiResponse({ enrollments: [] }));
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
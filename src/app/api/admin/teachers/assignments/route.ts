import { NextRequest, NextResponse } from 'next/server';
import { assignTeacherToCourse } from '@/services/academic.service';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const [rows]: any = await mysqlPool.query(`
      SELECT tca.id, tca.teacherId, tca.courseId, tca.assignedAt,
             tp.name as teacherName, c.title as courseTitle
      FROM TeacherCourseAssignments tca
      LEFT JOIN TeacherProfiles tp ON tca.teacherId = tp.userId
      LEFT JOIN Courses c ON tca.courseId = c.id
      ORDER BY tca.assignedAt DESC
    `);
    return NextResponse.json({ success: true, data: { assignments: rows } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

/**
 * POST /api/admin/teachers/assignments
 * Admin assigns a teacher to a course
 * Body: { teacherId, courseId }
 */
export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    
    if (!body.teacherId || !body.courseId) {
      return NextResponse.json(
        { success: false, error: { message: 'teacherId and courseId are required' } },
        { status: 400 }
      );
    }

    const result = await assignTeacherToCourse(body.teacherId, body.courseId);

    return NextResponse.json(
      { success: true, data: { assignment: result } },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message.includes('DUPLICATE_ASSIGNMENT')) {
      return NextResponse.json(
        { success: false, error: { message: error.message } },
        { status: 409 }
      );
    }
    if (error.name === 'AuthError') {
      return NextResponse.json(
        { success: false, error: { message: 'Unauthorized' } },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { success: false, error: { message: error.message || 'Failed to assign teacher to course' } },
      { status: 500 }
    );
  }
}

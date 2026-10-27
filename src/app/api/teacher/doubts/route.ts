import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';
import { ensureDoubtsSchema } from '@/lib/ensure-doubts-schema';
import { ensureStudentProfileSchema } from '@/lib/ensure-student-profile-schema';

async function getTeacherCourseIds(teacherId: string): Promise<string[]> {
  const [rows]: any = await mysqlPool.query(
    'SELECT courseId FROM TeacherCourseAssignments WHERE teacherId = ?',
    [teacherId]
  );
  return rows.map((r: any) => r.courseId);
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.TEACHER);
    // TCA missing ho to getTeacherCourseIds 1146 par 500 deta — khaali inbox hi sahi jawab hai.
    await ensureTeacherAssignmentSchema();
    // Doubts missing ho to neeche wali query 1146 par 500 deti — khaali inbox hi sahi jawab hai.
    await ensureDoubtsSchema();
    // StudentProfiles missing ho to neeche wala LEFT JOIN bhi 1146 deta (MySQL me
    // LEFT JOIN wali missing table bhi error hai) — studentName ke liye ye leg zaroori hai.
    await ensureStudentProfileSchema();
    const courseIds = await getTeacherCourseIds(user.userId);

    if (courseIds.length === 0) {
      return NextResponse.json({ success: true, data: { doubts: [] } }, { status: 200 });
    }

    const placeholders = courseIds.map(() => '?').join(', ');
    const [rows]: any = await mysqlPool.query(
      `SELECT d.id, d.chapterId, d.title, d.description, d.status, d.createdAt,
              sp.name as studentName
       FROM Doubts d
       LEFT JOIN StudentProfiles sp ON d.studentId = sp.userId
       WHERE d.courseId IN (${placeholders})
       ORDER BY d.createdAt DESC`,
      courseIds
    );

    return NextResponse.json({ success: true, data: { doubts: rows } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: 'Failed to load doubts' } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.TEACHER);
    await ensureTeacherAssignmentSchema();
    // Doubts missing ho to neeche wala UPDATE 1146 par 500 deta.
    await ensureDoubtsSchema();
    // PATCH khud StudentProfiles ko nahi chhoota — yahan ensure ki zaroorat nahi.
    const { id, response } = await req.json();

    if (!id || !response) {
      return NextResponse.json({ success: false, error: { message: 'Doubt id and response text are required' } }, { status: 400 });
    }

    const courseIds = await getTeacherCourseIds(user.userId);
    if (courseIds.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'You are not assigned to any course' } }, { status: 403 });
    }

    const placeholders = courseIds.map(() => '?').join(', ');
    const [result]: any = await mysqlPool.query(
      `UPDATE Doubts
       SET status = 'RESOLVED', teacherResponse = ?, updatedAt = NOW()
       WHERE id = ? AND courseId IN (${placeholders})`,
      [response, id, ...courseIds]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ success: false, error: { message: 'Doubt not found or not in your course' } }, { status: 404 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to resolve doubt' } }, { status: 500 });
  }
}
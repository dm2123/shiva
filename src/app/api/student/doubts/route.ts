import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

async function isEnrolled(studentId: string, courseId: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    'SELECT 1 FROM StudentEnrollments WHERE studentId = ? AND courseId = ? AND status = "ACTIVE" LIMIT 1',
    [studentId, courseId]
  );
  return rows.length > 0;
}

async function getCourseTeacherId(courseId: string): Promise<string | null> {
  const [rows]: any = await mysqlPool.query(
    'SELECT teacherId FROM TeacherCourseAssignments WHERE courseId = ? LIMIT 1',
    [courseId]
  );
  return rows.length > 0 ? rows[0].teacherId : null;
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.STUDENT);
    const [rows]: any = await mysqlPool.query(
      `SELECT d.id, d.courseId, d.chapterId, d.title, d.description, d.status, d.teacherResponse, d.createdAt, d.updatedAt,
              c.title AS courseTitle,
              tp.name AS teacherName
       FROM Doubts d
       LEFT JOIN Courses c ON d.courseId = c.id
       LEFT JOIN TeacherProfiles tp ON d.teacherId = tp.userId
       WHERE d.studentId = ?
       ORDER BY d.updatedAt DESC, d.createdAt DESC`,
      [user.userId]
    );

    return NextResponse.json({ success: true, data: { doubts: rows }, count: rows.length }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: 'Failed to load your doubts' } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, UserRole.STUDENT);

    let body: any;
    const contentType = req.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const fd = await req.formData();
      body = Object.fromEntries(fd.entries());
    }

    const { courseId, title, description, chapterId } = body || {};
    if (!courseId || !title || !description) {
      return NextResponse.json(
        { success: false, error: { message: 'Course, title and description are required' } },
        { status: 400 }
      );
    }

    if (!(await isEnrolled(user.userId, courseId))) {
      return NextResponse.json({ success: false, error: { message: 'You are not enrolled in this course' } }, { status: 403 });
    }

    const id = crypto.randomUUID();
    const titleStr = String(title).trim();
    const descriptionStr = String(description).trim();
    if (!titleStr || !descriptionStr) {
      return NextResponse.json({ success: false, error: { message: 'Title and description cannot be empty' } }, { status: 400 });
    }

    const teacherId = await getCourseTeacherId(courseId);

    await mysqlPool.query(
      `INSERT INTO Doubts (id, studentId, courseId, chapterId, title, description, status, teacherId)
       VALUES (?, ?, ?, ?, ?, ?, 'OPEN', ?)`,
      [id, user.userId, courseId, chapterId || null, titleStr, descriptionStr, teacherId]
    );

    if (teacherId) {
      await mysqlPool.query(
        `INSERT INTO Notifications (id, userId, type, title, message)
         VALUES (?, ?, 'WARNING', 'New Doubt Raised', ?)`,
        [crypto.randomUUID(), teacherId, `${titleStr} — view it in your doubt inbox.`]
      );
    }

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to raise doubt' } }, { status: 500 });
  }
}
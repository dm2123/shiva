import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const [rows]: any = await mysqlPool.query(`
      SELECT e.id, e.courseId, e.batchId, e.status, e.enrolledAt,
             c.title as courseTitle, c.slug as courseSlug, c.price
      FROM StudentEnrollments e
      JOIN Courses c ON e.courseId = c.id
      WHERE e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY e.enrolledAt DESC
    `, [session.userId]);
    return NextResponse.json(createApiResponse({ enrollments: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', 'Failed to load enrollments'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const contentType = req.headers.get('content-type') || '';
    let courseId: string | null = null;
    let batchId: string | null = null;
    if (contentType.includes('application/json')) {
      const body = await req.json();
      courseId = body.courseId;
      batchId = body.batchId || null;
    } else {
      const fd = await req.formData();
      courseId = fd.get('courseId') as string | null;
      batchId = (fd.get('batchId') as string | null) || null;
    }

    if (!courseId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'courseId is required'), { status: 400 });
    }

    const [courseRows]: any = await mysqlPool.query('SELECT * FROM Courses WHERE id = ?', [courseId]);
    const course = courseRows[0];
    if (!course) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Course not found'), { status: 404 });
    }
    if (course.status !== 'PUBLISHED') {
      return NextResponse.json(createApiError('BAD_REQUEST', 'This course is not open for enrollment'), { status: 400 });
    }

    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM StudentEnrollments WHERE studentId = ? AND courseId = ?',
      [session.userId, courseId]
    );
    if (existing.length > 0) {
      return NextResponse.json(createApiError('DUPLICATE', 'You are already enrolled in this course'), { status: 409 });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const enrollmentId = randomUUID();

    if (Number(course.price) > 0) {
      // Paid course - require payment first
      return NextResponse.json(
        createApiError('PAYMENT_REQUIRED', 'This is a paid course. Please complete payment to enroll.'),
        { status: 402 }
      );
    }

    await mysqlPool.query(
      `INSERT INTO StudentEnrollments (id, studentId, courseId, batchId, status, enrolledAt) VALUES (?, ?, ?, ?, 'ACTIVE', ?)`,
      [enrollmentId, session.userId, courseId, batchId, now]
    );

    return NextResponse.json(createApiResponse({ enrollment: { id: enrollmentId, courseId, batchId } }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to enroll'), { status: 500 });
  }
}
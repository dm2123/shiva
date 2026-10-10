import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT cc.*
       FROM CrashCourses cc
       WHERE cc.status IN ('ONGOING', 'UPCOMING')
       ORDER BY cc.startDate ASC`
    );

    return NextResponse.json(createApiResponse({ courses: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch crash courses'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const { courseId, title, durationDays, startDate, endDate } = body;

    if (!title || !durationDays || !startDate || !endDate) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'title, durationDays, startDate, and endDate are required'), { status: 400 });
    }

    const [profileRows]: any = await mysqlPool.query(
      `SELECT id FROM TeacherProfiles WHERE userId = ?`,
      [session.userId]
    );
    if (profileRows.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Teacher profile not found'), { status: 404 });
    }

    const id = `cc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO CrashCourses (id, courseId, title, durationDays, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, 'UPCOMING')`,
      [id, courseId || null, title, durationDays, startDate, endDate]
    );

    return NextResponse.json(createApiResponse({ id, status: 'UPCOMING' }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create crash course'), { status: 500 });
  }
}

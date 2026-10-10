import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.PARENT);

    const [children]: any = await mysqlPool.query(
      `SELECT studentId FROM ParentStudentLinks WHERE parentId = ?`,
      [session.userId]
    );
    const childIds = children.map((c: any) => c.studentId);

    if (childIds.length === 0) {
      return NextResponse.json(createApiResponse({ alerts: [] }), { status: 200 });
    }

    const placeholders = childIds.map(() => '?').join(',');
    const [rows]: any = await mysqlPool.query(
      `SELECT pa.*, sp.name as studentName
       FROM ParentAlerts pa
       LEFT JOIN StudentProfiles sp ON sp.userId = pa.studentId
       WHERE pa.studentId IN (${placeholders})
       ORDER BY pa.createdAt DESC`,
      childIds
    );

    return NextResponse.json(createApiResponse({ alerts: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch alerts'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const adminSession = await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const { studentId, alertType, message } = body;

    if (!studentId || !alertType || !message) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'studentId, alertType, and message are required'), { status: 400 });
    }

    const [studentRows]: any = await mysqlPool.query(
      `SELECT userId FROM StudentProfiles WHERE userId = ?`,
      [studentId]
    );
    if (studentRows.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Student not found'), { status: 404 });
    }

    const [parentLinks]: any = await mysqlPool.query(
      `SELECT parentId FROM ParentStudentLinks WHERE studentId = ?`,
      [studentId]
    );
    const parentId = parentLinks[0]?.parentId || adminSession.userId;

    const id = `pa-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO ParentAlerts (id, parentId, studentId, alertType, channel, message, status) VALUES (?, ?, ?, ?, 'PUSH', ?, 'SENT')`,
      [id, parentId, studentId, alertType, message]
    );

    return NextResponse.json(createApiResponse({ id }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to send alert'), { status: 500 });
  }
}

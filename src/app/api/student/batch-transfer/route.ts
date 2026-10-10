import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      `SELECT bt.*, b1.name as fromBatchName, b2.name as toBatchName, c.title as courseTitle
       FROM BatchTransfers bt
       LEFT JOIN Batches b1 ON b1.id = bt.fromBatchId
       LEFT JOIN Batches b2 ON b2.id = bt.toBatchId
       LEFT JOIN Courses c ON c.id = b1.courseId
       WHERE bt.studentId = ?
       ORDER BY bt.requestedAt DESC`,
      [session.userId]
    );

    return NextResponse.json(createApiResponse({ transfers: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch transfers'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { fromBatchId, toBatchId, reason } = body;

    if (!fromBatchId || !toBatchId || !reason) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'fromBatchId, toBatchId, and reason are required'), { status: 400 });
    }

    const [existing]: any = await mysqlPool.query(
      `SELECT id FROM BatchTransfers WHERE studentId = ? AND status IN ('PENDING', 'APPROVED') LIMIT 1`,
      [session.userId]
    );
    if (existing.length > 0) {
      return NextResponse.json(createApiError('CONFLICT', 'You already have a pending transfer request'), { status: 409 });
    }

    const [courseRows]: any = await mysqlPool.query(
      `SELECT courseId FROM Batches WHERE id = ?`,
      [fromBatchId]
    );
    if (courseRows.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Source batch not found'), { status: 404 });
    }

    const id = `bt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO BatchTransfers (id, studentId, fromBatchId, toBatchId, reason, status) VALUES (?, ?, ?, ?, ?, 'PENDING')`,
      [id, session.userId, fromBatchId, toBatchId, reason]
    );

    return NextResponse.json(createApiResponse({ id, status: 'PENDING' }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create transfer request'), { status: 500 });
  }
}

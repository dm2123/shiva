import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const lectureId = url.searchParams.get('lectureId');

    if (!lectureId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'lectureId query parameter is required'), { status: 400 });
    }

    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM VideoProgress WHERE studentId = ? AND lectureId = ?',
      [session.userId, lectureId]
    );

    const progress = rows[0] || null;

    return NextResponse.json(createApiResponse({ progress }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch progress'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();

    const { lectureId, positionSeconds, playbackSpeed } = body;

    if (!lectureId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'lectureId is required'), { status: 400 });
    }

    if (positionSeconds === undefined || positionSeconds === null) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'positionSeconds is required'), { status: 400 });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      `INSERT INTO VideoProgress (id, studentId, lectureId, positionSeconds, durationSeconds, playbackSpeed, lastWatchedAt)
       VALUES (?, ?, ?, ?, 0, ?, ?)
       ON DUPLICATE KEY UPDATE positionSeconds = ?, playbackSpeed = ?, lastWatchedAt = ?`,
      [
        `vp-${session.userId}-${lectureId}`,
        session.userId,
        lectureId,
        Math.floor(positionSeconds),
        playbackSpeed || 1,
        now,
        Math.floor(positionSeconds),
        playbackSpeed || 1,
        now,
      ]
    );

    return NextResponse.json(createApiResponse({ saved: true, positionSeconds, playbackSpeed: playbackSpeed || 1 }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to save progress'), { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { createApiResponse } from '@/lib/utils';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    if (mysqlPool) {
      const [rows] = await mysqlPool.query('SELECT * FROM LiveClasses ORDER BY startTime ASC');
      return NextResponse.json(createApiResponse({ classes: rows }));
    }
    return NextResponse.json(createApiResponse({ classes: [] }));
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    if (!body?.title || !body?.courseId || !body?.startTime || !body?.endTime) {
      return NextResponse.json(createApiResponse({ success: false, error: 'title, courseId, startTime and endTime are required' }), { status: 400 });
    }
    if (new Date(body.endTime) <= new Date(body.startTime)) {
      return NextResponse.json(createApiResponse({ success: false, error: 'endTime must be after startTime' }), { status: 400 });
    }
    const { randomUUID } = await import('crypto');
    const id = randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    await mysqlPool.query(
      `INSERT INTO LiveClasses (id, title, description, courseId, subjectId, chapterId, batchId, teacherId, startTime, endTime, status, meetingUrl, recordingUrl, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'SCHEDULED', ?, ?, ?, ?)`,
      [
        id,
        body.title,
        body.description || null,
        body.courseId,
        body.subjectId || null,
        body.chapterId || null,
        body.batchId || null,
        body.teacherId || null,
        body.startTime,
        body.endTime,
        body.meetingUrl || null,
        body.recordingUrl || null,
        now,
        now,
      ]
    );
    const [rows]: any = await mysqlPool.query('SELECT * FROM LiveClasses WHERE id = ?', [id]);
    return NextResponse.json(createApiResponse({ liveClass: rows[0] }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

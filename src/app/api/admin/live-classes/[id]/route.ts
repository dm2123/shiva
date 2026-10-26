import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';
import { createApiResponse } from '@/lib/utils';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await ensureLiveClassSchema();
    const body = await req.json();

    const [existing]: any = await mysqlPool.query('SELECT * FROM LiveClasses WHERE id = ?', [params.id]);
    if (!existing[0]) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Live class not found' }), { status: 404 });
    }

    const updates: any = { ...existing[0] };
    if (body.status !== undefined) updates.status = body.status;
    if (body.title !== undefined) updates.title = body.title;
    if (body.meetingUrl !== undefined) updates.meetingUrl = body.meetingUrl || null;
    if (body.recordingUrl !== undefined) updates.recordingUrl = body.recordingUrl || null;
    if (body.startTime !== undefined) updates.startTime = body.startTime;
    if (body.endTime !== undefined) updates.endTime = body.endTime;

    if (body.status === 'ENDED') {
      updates.actualEndedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }
    if (body.status === 'LIVE' && !updates.actualStartedAt) {
      updates.actualStartedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
    }

    const fields = Object.keys(updates)
      .filter((k) => k !== 'id')
      .map((k) => `${k} = ?`).join(', ');
    const values = [...Object.keys(updates).filter((k) => k !== 'id').map((k) => updates[k]), params.id];
    await mysqlPool.query(`UPDATE LiveClasses SET ${fields} WHERE id = ?`, values);

    const [rows]: any = await mysqlPool.query('SELECT * FROM LiveClasses WHERE id = ?', [params.id]);
    return NextResponse.json(createApiResponse({ liveClass: rows[0] }));
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await ensureLiveClassSchema();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const [result]: any = await mysqlPool.query(
      `UPDATE LiveClasses SET status = 'CANCELLED', actualEndedAt = ? WHERE id = ? AND status NOT IN ('ENDED', 'CANCELLED')`,
      [now, params.id]
    );
    if (result.affectedRows === 0) {
      return NextResponse.json(createApiResponse({ success: false, error: 'Live class not found or cannot be cancelled' }), { status: 400 });
    }
    return NextResponse.json(createApiResponse({ success: true }));
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);

    const [messages]: any = await mysqlPool.query(
      `SELECT dm.*, 
              CASE 
                WHEN dm.senderRole = 'STUDENT' THEN sp.name
                WHEN dm.senderRole = 'TEACHER' THEN tp.name
                ELSE 'Admin'
              END AS senderName
       FROM DoubtMessages dm
       LEFT JOIN StudentProfiles sp ON dm.senderId = sp.userId AND dm.senderRole = 'STUDENT'
       LEFT JOIN TeacherProfiles tp ON dm.senderId = tp.userId AND dm.senderRole = 'TEACHER'
       WHERE dm.doubtId = ?
       ORDER BY dm.createdAt ASC`,
      [params.id]
    );

    return NextResponse.json({ success: true, data: { messages } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Content required' } }, { status: 400 });
    }

    // Verify doubt exists and student owns it
    const [doubts]: any = await mysqlPool.query(
      'SELECT id, status FROM Doubts WHERE id = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (doubts.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Doubt not found' } }, { status: 404 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO DoubtMessages (id, doubtId, senderId, senderRole, content) VALUES (?, ?, ?, ?, ?)',
      [id, params.id, session.userId, 'STUDENT', content.trim()]
    );

    // Reopen if resolved
    if (doubts[0].status === 'RESOLVED') {
      await mysqlPool.query(
        'UPDATE Doubts SET status = ? WHERE id = ?',
        ['REOPENED', params.id]
      );
    }

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

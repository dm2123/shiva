import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Start exam session
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { testId, mode } = body;

    // Check for existing active session
    const [existing]: any = await mysqlPool.query(
      `SELECT * FROM ExamSessions WHERE userId = ? AND testId = ? AND status = 'IN_PROGRESS'`,
      [session.userId, testId]
    );
    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: existing[0], message: 'Resuming existing session' });
    }

    const id = randomUUID();
    const [test]: any = await mysqlPool.query('SELECT duration FROM Tests WHERE id = ?', [testId]);
    const durationMinutes = test[0]?.duration || 60;
    const endsAt = new Date(Date.now() + durationMinutes * 60000).toISOString();

    await mysqlPool.query(
      `INSERT INTO ExamSessions (id, userId, testId, mode, endsAt) VALUES (?, ?, ?, ?, ?)`,
      [id, session.userId, testId, mode || 'TIMED', endsAt]
    );

    const [newSession]: any = await mysqlPool.query('SELECT * FROM ExamSessions WHERE id = ?', [id]);
    return NextResponse.json({ success: true, data: newSession[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT - Update exam session (tab switch, fullscreen exit, submit)
export async function PUT(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { sessionId, action } = body;

    if (action === 'tab_switch') {
      await mysqlPool.query(
        'UPDATE ExamSessions SET tabSwitchCount = tabSwitchCount + 1 WHERE id = ? AND userId = ?',
        [sessionId, session.userId]
      );
    } else if (action === 'fullscreen_exit') {
      await mysqlPool.query(
        'UPDATE ExamSessions SET fullscreenExits = fullscreenExits + 1 WHERE id = ? AND userId = ?',
        [sessionId, session.userId]
      );
    } else if (action === 'submit') {
      await mysqlPool.query(
        `UPDATE ExamSessions SET status = 'SUBMITTED', submittedAt = NOW(),
         totalTimeSeconds = TIMESTAMPDIFF(SECOND, startedAt, NOW()) WHERE id = ? AND userId = ?`,
        [sessionId, session.userId]
      );
    }

    const [updated]: any = await mysqlPool.query('SELECT * FROM ExamSessions WHERE id = ?', [sessionId]);
    return NextResponse.json({ success: true, data: updated[0] });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get exam session status
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (sessionId) {
      const [rows]: any = await mysqlPool.query(
        'SELECT * FROM ExamSessions WHERE id = ? AND userId = ?', [sessionId, session.userId]
      );
      return NextResponse.json({ success: true, data: rows[0] || null });
    }

    const [sessions]: any = await mysqlPool.query(
      `SELECT es.*, t.title AS testTitle FROM ExamSessions es
       LEFT JOIN Tests t ON es.testId = t.id
       WHERE es.userId = ? ORDER BY es.startedAt DESC LIMIT 10`,
      [session.userId]
    );
    return NextResponse.json({ success: true, data: sessions });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Get teacher schedule
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const { searchParams } = new URL(request.url);
    const weekStart = searchParams.get('weekStart');

    const [schedules]: any = await mysqlPool.query(
      `SELECT ts.*, c.title AS courseTitle, s.name AS subjectName
       FROM TeacherSchedule ts
       LEFT JOIN Courses c ON ts.courseId = c.id
       LEFT JOIN Subjects s ON ts.subjectId = s.id
       WHERE ts.teacherId = ?
       ORDER BY ts.dayOfWeek, ts.startTime`,
      [session.userId]
    );

    const [upcomingClasses]: any = await mysqlPool.query(
      `SELECT lc.*, c.title AS courseTitle
       FROM LiveClasses lc
       LEFT JOIN Courses c ON lc.courseId = c.id
       WHERE lc.teacherId = ? AND lc.status IN ('SCHEDULED', 'LIVE')
       ORDER BY lc.scheduledStartAt ASC LIMIT 5`,
      [session.userId]
    );

    const [todayClasses]: any = await mysqlPool.query(
      `SELECT ts.*, c.title AS courseTitle
       FROM TeacherSchedule ts
       LEFT JOIN Courses c ON ts.courseId = c.id
       WHERE ts.teacherId = ? AND ts.dayOfWeek = DAYOFWEEK(CURDATE()) - 1 AND ts.status = 'ACTIVE'
       ORDER BY ts.startTime`,
      [session.userId]
    );

    return NextResponse.json({
      success: true,
      data: { schedules, upcomingClasses, todayClasses }
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create schedule entry
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const body = await request.json();
    const { randomUUID } = await import('crypto');
    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO TeacherSchedule (id, teacherId, courseId, batchId, subjectId, dayOfWeek, startTime, endTime, room, type, title)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, body.courseId || null, body.batchId || null, body.subjectId || null,
       body.dayOfWeek, body.startTime, body.endTime, body.room || null, body.type || 'LECTURE', body.title || null]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

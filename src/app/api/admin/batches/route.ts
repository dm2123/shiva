import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { ensureBatchScheduleSchema } from '@/lib/ensure-batch-schedule-schema';
import { ensureTeacherAssignmentSchema } from '@/lib/ensure-teacher-assignment-schema';

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    // Batches purane DB par missing ho to INSERT 1146 par 500 deta — pehle self-heal.
    // TeacherCourseAssignments ka apna ensure hai (neeche) — wahi is insert ko bachata hai.
    await ensureBatchScheduleSchema();
    await ensureTeacherAssignmentSchema();
    const body = await req.json();
    const { courseId, teacherId, name, startDate, endDate, status } = body;

    if (!courseId || !name) {
      return NextResponse.json({ success: false, error: { message: 'courseId and name are required' } }, { status: 400 });
    }

    const id = randomUUID();
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

    await mysqlPool.query(
      'INSERT INTO Batches (id, courseId, teacherId, name, startDate, endDate, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [id, courseId, teacherId || null, name, startDate || null, endDate || null, status || 'UPCOMING']
    );

    if (teacherId && courseId) {
      await mysqlPool.query(
        'INSERT INTO TeacherCourseAssignments (id, teacherId, courseId, assignedAt) VALUES (?, ?, ?, ?)',
        [randomUUID(), teacherId, courseId, now]
      );
    }

    return NextResponse.json({ success: true, data: { batch: { id, name } } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    console.error('Batch Create Error:', error);
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create batch' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    // Batches purane DB par missing ho to SELECT 1146 par 500 deta — pehle self-heal.
    await ensureBatchScheduleSchema();
    const [rows] = await mysqlPool.query('SELECT * FROM Batches ORDER BY createdAt DESC');
    return NextResponse.json({ success: true, data: { batches: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureDoubtsSchema } from '@/lib/ensure-doubts-schema';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureDoubtsSchema();
    const url = new URL(req.url);
    const status = url.searchParams.get('status');

    let query = `
      SELECT d.*, 
             tp.name AS assignedToName,
             (SELECT COUNT(*) FROM DoubtMessages WHERE doubtId = d.id) AS messageCount
      FROM Doubts d
      LEFT JOIN TeacherProfiles tp ON d.assignedTo = tp.userId
      WHERE d.studentId = ?
    `;
    const params: any[] = [session.userId];

    if (status) {
      query += ' AND d.status = ?';
      params.push(status);
    }

    query += ' ORDER BY d.createdAt DESC';

    const [rows]: any = await mysqlPool.query(query, params);
    return NextResponse.json({ success: true, data: { doubts: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureDoubtsSchema();
    const body = await req.json();
    const { title, content, priority, category, subject, lectureId, isPublic } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Title and content required' } }, { status: 400 });
    }

    const validPriorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];
    const doubtPriority = validPriorities.includes(priority) ? priority : 'MEDIUM';

    // SLA: URGENT=1hr, HIGH=4hr, MEDIUM=24hr, LOW=48hr
    const slaHours = { URGENT: 1, HIGH: 4, MEDIUM: 24, LOW: 48 };
    const slaDeadline = new Date();
    slaDeadline.setHours(slaDeadline.getHours() + slaHours[doubtPriority as keyof typeof slaHours]);

    const id = uuid();
    await mysqlPool.query(
      `INSERT INTO Doubts (id, studentId, title, content, status, priority, category, subject, lectureId, isPublic, slaDeadline)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, title.trim(), content.trim(), 'OPEN', doubtPriority,
       category || 'ACADEMIC', subject || null, lectureId || null, isPublic !== false ? 1 : 0, slaDeadline]
    );

    // Auto-assign to available teacher if HIGH/URGENT
    if (doubtPriority === 'HIGH' || doubtPriority === 'URGENT') {
      const [teachers]: any = await mysqlPool.query(
        `SELECT userId FROM TeacherProfiles WHERE status = 'active' 
         ORDER BY (SELECT COUNT(*) FROM Doubts WHERE assignedTo = userId AND status != 'RESOLVED') ASC
         LIMIT 1`
      );
      if (teachers.length > 0) {
        await mysqlPool.query(
          'UPDATE Doubts SET assignedTo = ?, assignedAt = NOW() WHERE id = ?',
          [teachers[0].userId, id]
        );
      }
    }

    return NextResponse.json({ success: true, data: { id, priority: doubtPriority, slaDeadline } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

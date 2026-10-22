import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - Teacher's announcements
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const [announcements]: any = await mysqlPool.query(
      `SELECT ta.*, c.title AS courseTitle, b.name AS batchName,
        (SELECT COUNT(*) FROM AnnouncementReads WHERE announcementId = ta.id) AS readCount
       FROM TeacherAnnouncements ta
       LEFT JOIN Courses c ON ta.courseId = c.id
       LEFT JOIN Batches b ON ta.batchId = b.id
       WHERE ta.teacherId = ?
       ORDER BY ta.pinToTop DESC, ta.createdAt DESC LIMIT 20`,
      [session.userId]
    );
    return NextResponse.json({ success: true, data: announcements });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Create announcement
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const body = await request.json();
    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO TeacherAnnouncements (id, teacherId, courseId, batchId, title, message, priority, type, targetAudience, pinToTop, expiresAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, body.courseId || null, body.batchId || null, body.title, body.message,
       body.priority || 'MEDIUM', body.type || 'GENERAL', body.targetAudience || 'ENROLLED',
       body.pinToTop ? 1 : 0, body.expiresAt || null]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE - Delete announcement
export async function DELETE(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.TEACHER);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    await mysqlPool.query('DELETE FROM TeacherAnnouncements WHERE id = ? AND teacherId = ?', [id, session.userId]);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

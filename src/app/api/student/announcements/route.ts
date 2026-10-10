import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Get teacher announcements
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    let where = "WHERE (ta.targetAudience = 'ALL' OR ta.batchId IN (SELECT batchId FROM StudentEnrollments WHERE studentId = ? AND status = 'ACTIVE'))";
    const params: any[] = [session.userId];

    if (courseId) {
      where += ' AND ta.courseId = ?';
      params.push(courseId);
    }

    where += " AND (ta.expiresAt IS NULL OR ta.expiresAt > NOW())";

    const [announcements]: any = await mysqlPool.query(
      `SELECT ta.*, tp.name AS teacherName, c.title AS courseTitle, b.name AS batchName,
        (SELECT COUNT(*) FROM AnnouncementReads WHERE announcementId = ta.id AND userId = ?) AS isRead
       FROM TeacherAnnouncements ta
       LEFT JOIN TeacherProfiles tp ON ta.teacherId = tp.userId
       LEFT JOIN Courses c ON ta.courseId = c.id
       LEFT JOIN Batches b ON ta.batchId = b.id
       ${where}
       ORDER BY ta.pinToTop DESC, ta.createdAt DESC LIMIT 30`,
      [session.userId, ...params]
    );

    const [unreadCount]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS count FROM TeacherAnnouncements ta
       WHERE NOT EXISTS (SELECT 1 FROM AnnouncementReads WHERE announcementId = ta.id AND userId = ?)
       AND (ta.targetAudience = 'ALL' OR ta.batchId IN (SELECT batchId FROM StudentEnrollments WHERE studentId = ? AND status = 'ACTIVE'))`,
      [session.userId, session.userId]
    );

    return NextResponse.json({
      success: true,
      data: { announcements, unreadCount: unreadCount[0]?.count || 0 }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Mark announcement as read
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { randomUUID } = await import('crypto');
    await mysqlPool.query(
      `INSERT INTO AnnouncementReads (id, announcementId, userId) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE readAt = NOW()`,
      [randomUUID(), body.announcementId, session.userId]
    );
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

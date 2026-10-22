import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { mentorId, scheduledAt, durationMinutes, notes } = body;

    if (!mentorId || !scheduledAt) {
      return NextResponse.json({ success: false, error: { message: 'Mentor and time required' } }, { status: 400 });
    }

    // Check mentor exists
    const [mentors]: any = await mysqlPool.query(
      'SELECT userId FROM TeacherProfiles WHERE userId = ? AND status = ?',
      [mentorId, 'active']
    );

    if (mentors.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Mentor not found' } }, { status: 404 });
    }

    // Create or update mentorship
    let [mentorship]: any = await mysqlPool.query(
      'SELECT id FROM Mentorships WHERE mentorId = ? AND studentId = ? AND status = ?',
      [mentorId, session.userId, 'ACTIVE']
    );

    let mentorshipId;
    if (mentorship.length === 0) {
      mentorshipId = uuid();
      await mysqlPool.query(
        'INSERT INTO Mentorships (id, mentorId, studentId, status) VALUES (?, ?, ?, ?)',
        [mentorshipId, mentorId, session.userId, 'ACTIVE']
      );
    } else {
      mentorshipId = mentorship[0].id;
    }

    // Create session
    const sessionId = uuid();
    await mysqlPool.query(
      'INSERT INTO MentorshipSessions (id, mentorshipId, mentorId, studentId, scheduledAt, durationMinutes, notes, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [sessionId, mentorshipId, mentorId, session.userId, scheduledAt, durationMinutes || 30, notes || null, 'PENDING']
    );

    return NextResponse.json({ success: true, data: { sessionId } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

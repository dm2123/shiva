import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const { isOnline } = body;

    // Update or insert availability
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM TeacherAvailability WHERE teacherId = ?',
      [session.userId]
    );

    if (existing.length > 0) {
      await mysqlPool.query(
        'UPDATE TeacherAvailability SET isOnline = ?, lastSeenAt = NOW() WHERE teacherId = ?',
        [isOnline ? 1 : 0, session.userId]
      );
    } else {
      const { v4: uuid } = require('uuid');
      await mysqlPool.query(
        'INSERT INTO TeacherAvailability (id, teacherId, isOnline, lastSeenAt) VALUES (?, ?, ?, NOW())',
        [uuid(), session.userId, isOnline ? 1 : 0]
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const teacherId = url.searchParams.get('teacherId');

    if (teacherId) {
      const [rows]: any = await mysqlPool.query(
        'SELECT * FROM TeacherAvailability WHERE teacherId = ?',
        [teacherId]
      );
      return NextResponse.json({ success: true, data: { availability: rows[0] || null } });
    }

    // Get all online teachers
    const [rows]: any = await mysqlPool.query(
      `SELECT ta.*, sp.name
       FROM TeacherAvailability ta
       JOIN StudentProfiles sp ON ta.teacherId = sp.userId
       WHERE ta.isOnline = 1`
    );

    return NextResponse.json({ success: true, data: { onlineTeachers: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

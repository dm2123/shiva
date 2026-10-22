import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [certificates]: any = await mysqlPool.query(
      `SELECT c.*, co.title AS courseTitle, co.description AS courseDescription
       FROM Certificates c
       JOIN Courses co ON c.courseId = co.id
       WHERE c.studentId = ?
       ORDER BY c.issuedAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: { certificates } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ success: false, error: { message: 'Course ID required' } }, { status: 400 });
    }

    // Check enrollment
    const [enrollment]: any = await mysqlPool.query(
      'SELECT id FROM Enrollments WHERE studentId = ? AND courseId = ?',
      [session.userId, courseId]
    );

    if (enrollment.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Not enrolled in this course' } }, { status: 403 });
    }

    // Check if certificate already exists
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM Certificates WHERE studentId = ? AND courseId = ?',
      [session.userId, courseId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: { certificateId: existing[0].id, alreadyExists: true } });
    }

    // Get student name
    const [student]: any = await mysqlPool.query(
      'SELECT name FROM StudentProfiles WHERE userId = ?',
      [session.userId]
    );

    // Get course title
    const [course]: any = await mysqlPool.query(
      'SELECT title FROM Courses WHERE id = ?',
      [courseId]
    );

    // Generate certificate
    const certificateId = uuid();
    const certificateNumber = `TS-${Date.now().toString(36).toUpperCase()}`;

    await mysqlPool.query(
      `INSERT INTO Certificates (id, studentId, courseId, certificateNumber, issuedAt)
       VALUES (?, ?, ?, ?, NOW())`,
      [certificateId, session.userId, courseId, certificateNumber]
    );

    // Award XP
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 100, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Course completion certificate']
    );

    return NextResponse.json({
      success: true,
      data: {
        certificateId,
        certificateNumber,
        studentName: student[0]?.name,
        courseName: course[0]?.title,
        issuedAt: new Date().toISOString()
      }
    }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

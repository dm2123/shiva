import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { rating, title, content } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ success: false, error: { message: 'Rating must be 1-5' } }, { status: 400 });
    }

    // Check if student is enrolled
    const [enrollment]: any = await mysqlPool.query(
      'SELECT id FROM Enrollments WHERE studentId = ? AND courseId = ?',
      [session.userId, params.id]
    );

    if (enrollment.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Must be enrolled to review' } }, { status: 403 });
    }

    // Check existing review
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM CourseReviews WHERE courseId = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already reviewed this course' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO CourseReviews (id, courseId, studentId, rating, title, content, isVerified) VALUES (?, ?, ?, ?, ?, ?, 1)',
      [id, params.id, session.userId, rating, title?.trim() || null, content?.trim() || null]
    );

    // Award XP for review
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 5, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Course review submitted']
    );

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

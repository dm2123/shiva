import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM LectureNotes WHERE lectureId = ? AND studentId = ?',
      [params.id, session.userId]
    );
    return NextResponse.json({ success: true, data: { note: rows[0] || null } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Content required' } }, { status: 400 });
    }

    // Upsert
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM LectureNotes WHERE lectureId = ? AND studentId = ?',
      [params.id, session.userId]
    );

    if (existing.length > 0) {
      await mysqlPool.query(
        'UPDATE LectureNotes SET content = ?, updatedAt = NOW() WHERE id = ?',
        [content.trim(), existing[0].id]
      );
      return NextResponse.json({ success: true, data: { id: existing[0].id, content: content.trim() } });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO LectureNotes (id, lectureId, studentId, content) VALUES (?, ?, ?, ?)',
      [id, params.id, session.userId, content.trim()]
    );

    return NextResponse.json({ success: true, data: { id, content: content.trim() } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { content } = body;

    if (!content?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Content required' } }, { status: 400 });
    }

    // Verify post exists
    const [posts]: any = await mysqlPool.query('SELECT id FROM ForumPosts WHERE id = ?', [params.id]);
    if (posts.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO ForumAnswers (id, postId, authorId, content) VALUES (?, ?, ?, ?)',
      [id, params.id, session.userId, content.trim()]
    );

    // Award XP
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 2, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Forum answer posted']
    );

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

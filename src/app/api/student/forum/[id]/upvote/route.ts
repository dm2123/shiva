import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { answerId } = body;

    // Check existing upvote
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM ForumUpvotes WHERE userId = ? AND postId = ?',
      [session.userId, params.id]
    );

    if (existing.length > 0) {
      // Remove upvote
      await mysqlPool.query('DELETE FROM ForumUpvotes WHERE id = ?', [existing[0].id]);
      return NextResponse.json({ success: true, data: { upvoted: false } });
    }

    // Add upvote
    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO ForumUpvotes (id, postId, answerId, userId) VALUES (?, ?, ?, ?)',
      [id, params.id, answerId || null, session.userId]
    );

    return NextResponse.json({ success: true, data: { upvoted: true } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

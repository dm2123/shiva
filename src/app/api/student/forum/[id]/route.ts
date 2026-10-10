import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [posts]: any = await mysqlPool.query(
      `SELECT fp.*, sp.name AS authorName,
              (SELECT COUNT(*) FROM ForumUpvotes WHERE postId = fp.id) AS upvoteCount
       FROM ForumPosts fp
       LEFT JOIN StudentProfiles sp ON fp.authorId = sp.userId
       WHERE fp.id = ?`,
      [params.id]
    );

    if (posts.length === 0) {
      return NextResponse.json({ success: false, error: { message: 'Post not found' } }, { status: 404 });
    }

    const [answers]: any = await mysqlPool.query(
      `SELECT fa.*, sp.name AS authorName,
              (SELECT COUNT(*) FROM ForumUpvotes WHERE answerId = fa.id) AS upvoteCount
       FROM ForumAnswers fa
       LEFT JOIN StudentProfiles sp ON fa.authorId = sp.userId
       WHERE fa.postId = ?
       ORDER BY fa.createdAt DESC`,
      [params.id]
    );

    // Check if user upvoted
    const [upvotes]: any = await mysqlPool.query(
      'SELECT postId, answerId FROM ForumUpvotes WHERE userId = ? AND (postId = ? OR answerId IN (SELECT id FROM ForumAnswers WHERE postId = ?))',
      [session.userId, params.id, params.id]
    );

    return NextResponse.json({
      success: true,
      data: {
        post: posts[0],
        answers,
        myUpvotes: upvotes
      }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

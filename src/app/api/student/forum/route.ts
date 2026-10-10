import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const search = url.searchParams.get('search');
    const courseId = url.searchParams.get('courseId');

    let query = `
      SELECT fp.*, sp.name AS authorName,
             (SELECT COUNT(*) FROM ForumAnswers WHERE postId = fp.id) AS answerCount,
             (SELECT COUNT(*) FROM ForumUpvotes WHERE postId = fp.id) AS upvoteCount
      FROM ForumPosts fp
      LEFT JOIN StudentProfiles sp ON fp.authorId = sp.userId
    `;
    const params: any[] = [];
    const conditions: string[] = [];

    if (search) {
      conditions.push('(fp.title LIKE ? OR fp.content LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    if (courseId) {
      conditions.push('fp.courseId = ?');
      params.push(courseId);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY fp.createdAt DESC LIMIT 50';

    const [rows]: any = await mysqlPool.query(query, params);
    return NextResponse.json({ success: true, data: { posts: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { title, content, courseId, tags } = body;

    if (!title?.trim() || !content?.trim()) {
      return NextResponse.json({ success: false, error: { message: 'Title and content required' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO ForumPosts (id, authorId, title, content, courseId, tags) VALUES (?, ?, ?, ?, ?, ?)',
      [id, session.userId, title.trim(), content.trim(), courseId || null, JSON.stringify(tags || [])]
    );

    // Award XP
    await mysqlPool.query(
      'INSERT INTO StudentXP (id, studentId, points, source, description) VALUES (?, ?, 5, ?, ?)',
      [uuid(), session.userId, 'DAILY_LOGIN', 'Forum post created']
    );

    return NextResponse.json({ success: true, data: { id } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

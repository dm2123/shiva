import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - List e-books with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const subjectId = searchParams.get('subjectId');
    const courseId = searchParams.get('courseId');
    const difficulty = searchParams.get('difficulty');
    const freeOnly = searchParams.get('freeOnly') === 'true';
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = "WHERE eb.status = 'ACTIVE'";
    const params: any[] = [];

    if (category) { where += ' AND eb.category = ?'; params.push(category); }
    if (subjectId) { where += ' AND eb.subjectId = ?'; params.push(subjectId); }
    if (courseId) { where += ' AND eb.courseId = ?'; params.push(courseId); }
    if (difficulty) { where += ' AND eb.difficulty = ?'; params.push(difficulty); }
    if (freeOnly) { where += ' AND eb.isFree = 1'; }
    if (search) { where += ' AND (eb.title LIKE ? OR eb.author LIKE ?)'; params.push(`%${search}%`, `%${search}%`); }

    const [countResult]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM EBooks eb ${where}`, params
    );
    const total = countResult[0]?.total || 0;

    const [books]: any = await mysqlPool.query(
      `SELECT eb.*, s.name AS subjectName, c.title AS courseTitle,
        (SELECT epub.completed FROM EBookProgress epub WHERE epub.ebookId = eb.id AND epub.userId = ?) AS userCompleted,
        (SELECT epub.currentPage FROM EBookProgress epub WHERE epub.ebookId = eb.id AND epub.userId = ?) AS userCurrentPage
       FROM EBooks eb
       LEFT JOIN Subjects s ON eb.subjectId = s.id
       LEFT JOIN Courses c ON eb.courseId = c.id
       ${where}
       ORDER BY eb.downloadCount DESC
       LIMIT ? OFFSET ?`,
      [session.userId, session.userId, ...params, limit, offset]
    );

    return NextResponse.json({
      success: true,
      data: {
        books,
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

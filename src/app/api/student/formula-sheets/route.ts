import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - List formula sheets
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const courseId = searchParams.get('courseId');
    const difficulty = searchParams.get('difficulty');
    const chapterId = searchParams.get('chapterId');

    let where = "WHERE fs.status = 'ACTIVE'";
    const params: any[] = [];

    if (subjectId) { where += ' AND fs.subjectId = ?'; params.push(subjectId); }
    if (courseId) { where += ' AND fs.courseId = ?'; params.push(courseId); }
    if (difficulty) { where += ' AND fs.difficulty = ?'; params.push(difficulty); }
    if (chapterId) { where += ' AND fs.chapterId = ?'; params.push(chapterId); }

    const [sheets]: any = await mysqlPool.query(
      `SELECT fs.*, s.name AS subjectName, c.title AS courseTitle, ch.name AS chapterName
       FROM FormulaSheets fs
       LEFT JOIN Subjects s ON fs.subjectId = s.id
       LEFT JOIN Courses c ON fs.courseId = c.id
       LEFT JOIN Chapters ch ON fs.chapterId = ch.id
       ${where}
       ORDER BY fs.downloadCount DESC`,
      params
    );

    return NextResponse.json({
      success: true,
      data: sheets.map((s: any) => ({
        ...s,
        content: typeof s.content === 'string' ? JSON.parse(s.content) : s.content,
      }))
    });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

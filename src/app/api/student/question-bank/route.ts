import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';

// GET - Enhanced question bank with filters
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const subjectId = searchParams.get('subjectId');
    const chapterId = searchParams.get('chapterId');
    const difficulty = searchParams.get('difficulty');
    const type = searchParams.get('type');
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    let where = 'WHERE 1=1';
    const params: any[] = [];

    if (subjectId) { where += ' AND q.subjectId = ?'; params.push(subjectId); }
    if (chapterId) { where += ' AND q.chapterId = ?'; params.push(chapterId); }
    if (type) { where += ' AND q.questionType = ?'; params.push(type); }
    if (difficulty) {
      where += ' AND qd.difficulty = ?';
      params.push(difficulty);
    }
    if (tag) {
      where += ' AND EXISTS (SELECT 1 FROM QuestionTags qt WHERE qt.questionId = q.id AND qt.tag = ?)';
      params.push(tag);
    }
    if (search) {
      where += ' AND q.questionText LIKE ?';
      params.push(`%${search}%`);
    }

    const [countResult]: any = await mysqlPool.query(
      `SELECT COUNT(*) AS total FROM Questions q
       LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       ${where}`, params
    );
    const total = countResult[0]?.total || 0;

    const [questions]: any = await mysqlPool.query(
      `SELECT q.*, qd.difficulty, qd.estimatedTimeSeconds, qd.correctRate, qd.avgTimeSeconds, qd.totalAttempts,
        c.title AS chapterTitle, s.name AS subjectName,
        (SELECT GROUP_CONCAT(qt.tag) FROM QuestionTags qt WHERE qt.questionId = q.id) AS tags
       FROM Questions q
       LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       LEFT JOIN Chapters c ON q.chapterId = c.id
       LEFT JOIN Subjects s ON q.subjectId = s.id
       ${where}
       ORDER BY FIELD(qd.difficulty, 'EASY', 'MEDIUM', 'HARD', 'VERY_HARD'), q.id
       LIMIT ? OFFSET ?`,
      [...params, limit, offset]
    );

    // Get available tags
    const [tags]: any = await mysqlPool.query(
      'SELECT DISTINCT tag, COUNT(*) AS count FROM QuestionTags GROUP BY tag ORDER BY count DESC LIMIT 50'
    );

    // Get difficulty distribution
    const [diffDist]: any = await mysqlPool.query(
      `SELECT qd.difficulty, COUNT(*) AS count
       FROM Questions q LEFT JOIN QuestionDifficulty qd ON q.id = qd.questionId
       GROUP BY qd.difficulty`
    );

    return NextResponse.json({
      success: true,
      data: {
        questions: questions.map((q: any) => ({
          ...q,
          options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
          tags: q.tags ? q.tags.split(',') : [],
        })),
        pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
        filters: { tags, difficultyDistribution: diffDist }
      }
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

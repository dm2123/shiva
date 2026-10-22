import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.TEACHER);

    const [polls]: any = await mysqlPool.query(
      `SELECT lcp.*,
        (SELECT COUNT(*) FROM LiveClassPollResponses WHERE pollId = lcp.id) AS responseCount,
        (SELECT JSON_ARRAYAGG(JSON_OBJECT('optionIndex', selectedOption, 'count', cnt))
         FROM (SELECT selectedOption, COUNT(*) AS cnt FROM LiveClassPollResponses WHERE pollId = lcp.id GROUP BY selectedOption) sub
        ) AS results
       FROM LiveClassPolls lcp
       WHERE lcp.liveClassId = ? AND lcp.isActive = TRUE
       ORDER BY lcp.createdAt DESC LIMIT 1`,
      [params.id]
    );

    return NextResponse.json({ success: true, data: { poll: polls[0] || null } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const { question, options } = body;

    if (!question || !Array.isArray(options) || options.length < 2) {
      return NextResponse.json({ success: false, error: { message: 'Question and at least 2 options required' } }, { status: 400 });
    }

    // Deactivate any existing active poll
    await mysqlPool.query(
      'UPDATE LiveClassPolls SET isActive = FALSE WHERE liveClassId = ? AND isActive = TRUE',
      [params.id]
    );

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO LiveClassPolls (id, liveClassId, question, options, createdBy) VALUES (?, ?, ?, ?, ?)',
      [id, params.id, question, JSON.stringify(options), session.userId]
    );

    return NextResponse.json({ success: true, data: { id, question, options } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

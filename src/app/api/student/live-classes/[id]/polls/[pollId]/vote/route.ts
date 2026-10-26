import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';
import { v4 as uuid } from 'uuid';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string; pollId: string } }
) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    // LiveClassPollResponses table purane DB par missing ho to vote
    // 500 ke bajay self-heal ke baad kaam kare.
    await ensureLiveClassSchema();
    const body = await req.json();
    const { selectedOption } = body;

    if (selectedOption === undefined || selectedOption === null) {
      return NextResponse.json({ success: false, error: { message: 'selectedOption is required' } }, { status: 400 });
    }

    // Check if already voted
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM LiveClassPollResponses WHERE pollId = ? AND userId = ?',
      [params.pollId, session.userId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: false, error: { message: 'Already voted' } }, { status: 409 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO LiveClassPollResponses (id, pollId, userId, selectedOption) VALUES (?, ?, ?, ?)',
      [id, params.pollId, session.userId, selectedOption]
    );

    // Get updated results
    const [results]: any = await mysqlPool.query(
      `SELECT selectedOption, COUNT(*) AS count FROM LiveClassPollResponses WHERE pollId = ? GROUP BY selectedOption`,
      [params.pollId]
    );

    return NextResponse.json({ success: true, data: { voted: true, results } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

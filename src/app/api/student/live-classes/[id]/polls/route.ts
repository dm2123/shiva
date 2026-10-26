import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureLiveClassSchema } from '@/lib/ensure-live-class-schema';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.STUDENT);
    // LiveClassPolls / Responses tables purane DB par missing hon to
    // poll list 500 ke bajay honest empty de.
    await ensureLiveClassSchema();

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

    const poll = polls[0] || null;

    // Check if current user already voted
    if (poll) {
      const [voted]: any = await mysqlPool.query(
        'SELECT selectedOption FROM LiveClassPollResponses WHERE pollId = ? AND userId = ?',
        [poll.id, params.id]
      );
      poll.userVote = voted[0]?.selectedOption ?? null;
    }

    return NextResponse.json({ success: true, data: { poll } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

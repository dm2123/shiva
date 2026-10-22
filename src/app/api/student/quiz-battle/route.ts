import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// POST - Create quiz battle
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();

    // Check for waiting battle to join
    const [waiting]: any = await mysqlPool.query(
      `SELECT * FROM QuizBattles WHERE status = 'WAITING' AND player1Id != ? LIMIT 1`,
      [session.userId]
    );

    if (waiting.length > 0) {
      // Join existing battle
      await mysqlPool.query(
        'UPDATE QuizBattles SET player2Id = ?, status = "PLAYER1_TURN", startedAt = NOW() WHERE id = ?',
        [session.userId, waiting[0].id]
      );
      return NextResponse.json({ success: true, data: waiting[0], message: 'Joined battle!' });
    }

    // Create new battle
    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO QuizBattles (id, player1Id, questionCount, status) VALUES (?, ?, ?, 'WAITING')`,
      [id, session.userId, body.questionCount || 10]
    );

    return NextResponse.json({ success: true, id, message: 'Waiting for opponent...' });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// GET - Get battle status
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const battleId = searchParams.get('battleId');

    if (battleId) {
      const [rows]: any = await mysqlPool.query(
        `SELECT qb.*, u1.email AS player1Email, u2.email AS player2Email
         FROM QuizBattles qb
         LEFT JOIN Users u1 ON qb.player1Id = u1.id
         LEFT JOIN Users u2 ON qb.player2Id = u2.id
         WHERE qb.id = ?`, [battleId]
      );
      return NextResponse.json({ success: true, data: rows[0] });
    }

    // Get user's recent battles
    const [battles]: any = await mysqlPool.query(
      `SELECT qb.*, u1.email AS player1Email, u2.email AS player2Email
       FROM QuizBattles qb
       LEFT JOIN Users u1 ON qb.player1Id = u1.id
       LEFT JOIN Users u2 ON qb.player2Id = u2.id
       WHERE qb.player1Id = ? OR qb.player2Id = ?
       ORDER BY qb.createdAt DESC LIMIT 10`,
      [session.userId, session.userId]
    );
    return NextResponse.json({ success: true, data: battles });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

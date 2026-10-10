import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List battlegrounds
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || 'WAITING';

    const [battlegrounds]: any = await mysqlPool.query(
      `SELECT bg.*, c.title AS courseTitle,
        (SELECT COUNT(*) FROM BattlegroundEntries WHERE battlegroundId = bg.id) AS participantCount,
        (SELECT COUNT(*) FROM BattlegroundEntries WHERE battlegroundId = bg.id AND userId = ?) AS userJoined,
        (SELECT COUNT(*) FROM BattlegroundEntries WHERE battlegroundId = bg.id AND userId = ? AND status = 'FINISHED') AS userFinished
       FROM Battlegrounds bg
       LEFT JOIN Courses c ON bg.courseId = c.id
       WHERE bg.status = ?
       ORDER BY bg.startDate ASC`,
      [session.userId, session.userId, status]
    );

    return NextResponse.json({ success: true, data: battlegrounds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Join battleground
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const { battlegroundId } = body;

    // Check if already joined
    const [existing]: any = await mysqlPool.query(
      'SELECT * FROM BattlegroundEntries WHERE battlegroundId = ? AND userId = ?',
      [battlegroundId, session.userId]
    );
    if (existing.length > 0) {
      return NextResponse.json({ error: 'Already joined' }, { status: 400 });
    }

    // Check capacity
    const [bg]: any = await mysqlPool.query('SELECT * FROM Battlegrounds WHERE id = ?', [battlegroundId]);
    if (bg.length === 0) return NextResponse.json({ error: 'Battleground not found' }, { status: 404 });
    if (bg[0].currentParticipants >= bg[0].maxParticipants) {
      return NextResponse.json({ error: 'Battleground is full' }, { status: 400 });
    }

    const id = randomUUID();
    await mysqlPool.query(
      'INSERT INTO BattlegroundEntries (id, battlegroundId, userId) VALUES (?, ?, ?)',
      [id, battlegroundId, session.userId]
    );
    await mysqlPool.query(
      'UPDATE Battlegrounds SET currentParticipants = currentParticipants + 1 WHERE id = ?',
      [battlegroundId]
    );

    return NextResponse.json({ success: true, id, message: 'Joined battleground!' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

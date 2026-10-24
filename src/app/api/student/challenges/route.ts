import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool, findUserById, findTestByIdDb } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureChallengeSchema } from '@/lib/ensure-challenge-schema';
import {
  areFriends,
  fetchDisplayMap,
  expireStaleChallenges,
  CHALLENGE_EXPIRY_DAYS,
} from '@/lib/challenge-utils';
import { randomUUID } from 'crypto';

/**
 * GET /api/student/challenges
 * Meri saari challenges (maine bheji + mujhe aayi), nayi pehle.
 * Har row me dono players ke naam, test ka title, scores aur winner —
 * sab asal DB rows se; koi fake result nahi.
 */
export async function GET(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;

    await expireStaleChallenges(me);

    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.challengerId, c.opponentId, c.testId, c.status,
              c.challengerBest, c.opponentBest, c.winnerId,
              c.createdAt, c.acceptedAt, c.expiresAt, c.completedAt,
              t.title AS testTitle
         FROM Challenges c
         LEFT JOIN Tests t ON t.id = c.testId
        WHERE c.challengerId = ? OR c.opponentId = ?
        ORDER BY c.createdAt DESC
        LIMIT 50`,
      [me, me]
    );

    const ids: string[] = [];
    for (const r of rows || []) {
      ids.push(r.challengerId, r.opponentId);
      if (r.winnerId) ids.push(r.winnerId);
    }
    const names = await fetchDisplayMap(ids);

    const challenges = (rows || []).map((r: any) => {
      const challenger = names[r.challengerId] || { userId: r.challengerId, name: null, email: '' };
      const opponent = names[r.opponentId] || { userId: r.opponentId, name: null, email: '' };
      const winner = r.winnerId ? names[r.winnerId] || { userId: r.winnerId, name: null, email: '' } : null;
      return {
        id: r.id,
        testId: r.testId,
        testTitle: r.testTitle || 'Test',
        challenger,
        opponent,
        myRole: r.challengerId === me ? 'challenger' : 'opponent',
        status: r.status,
        challengerBest: r.challengerBest == null ? null : Number(r.challengerBest),
        opponentBest: r.opponentBest == null ? null : Number(r.opponentBest),
        winner,
        isTie: r.status === 'COMPLETED' && !r.winnerId,
        createdAt: r.createdAt ?? null,
        acceptedAt: r.acceptedAt ?? null,
        expiresAt: r.expiresAt ?? null,
        completedAt: r.completedAt ?? null,
      };
    });

    return NextResponse.json(createApiResponse({ challenges }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch challenges'), { status: 500 });
  }
}

/**
 * POST /api/student/challenges  { opponentId, testId }
 * Dost ko test par challenge bhejo. Opponent dost hona chahiye,
 * test PUBLISHED hona chahiye.
 */
export async function POST(req: NextRequest) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;
    const body = await req.json().catch(() => ({}));
    const { opponentId, testId } = body || {};

    if (!opponentId || !testId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'opponentId aur testId chahiye'), { status: 400 });
    }
    if (opponentId === me) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'Khud ko challenge nahi bhej sakte'), { status: 400 });
    }

    const opponent = await findUserById(String(opponentId));
    if (!opponent || opponent.role !== UserRole.STUDENT || opponent.status !== 'ACTIVE') {
      return NextResponse.json(createApiError('NOT_FOUND', 'Aisa koi student nahi mila'), { status: 404 });
    }
    if (!(await areFriends(me, String(opponentId)))) {
      return NextResponse.json(
        createApiError('FORBIDDEN', 'Challenge sirf dost ko bhej sakte ho — pehle friend request bhejo'),
        { status: 403 }
      );
    }

    const test = await findTestByIdDb(String(testId));
    if (!test || test.status !== 'PUBLISHED') {
      return NextResponse.json(createApiError('NOT_FOUND', 'Test nahi mila ya publish nahi hai'), { status: 404 });
    }

    const [dup]: any = await mysqlPool.query(
      `SELECT id FROM Challenges
        WHERE testId = ? AND status IN ('PENDING','ACCEPTED')
          AND ((challengerId = ? AND opponentId = ?) OR (challengerId = ? AND opponentId = ?))
        LIMIT 1`,
      [testId, me, opponentId, opponentId, me]
    );
    if (dup.length > 0) {
      return NextResponse.json(
        createApiError('CONFLICT', 'Is test par pehle se ek khuli challenge hai'),
        { status: 409 }
      );
    }

    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO Challenges (id, challengerId, opponentId, testId, status, expiresAt)
       VALUES (?, ?, ?, 'PENDING', DATE_ADD(NOW(), INTERVAL ${CHALLENGE_EXPIRY_DAYS} DAY))`,
      [id, me, opponentId, testId]
    );

    return NextResponse.json(
      createApiResponse({ id, status: 'PENDING', testId, opponentId }),
      { status: 201 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to create challenge'), { status: 500 });
  }
}

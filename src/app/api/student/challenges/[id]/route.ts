import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { ensureChallengeSchema } from '@/lib/ensure-challenge-schema';
import {
  fetchDisplayMap,
  bestAttemptAfter,
  decideChallengeWinner,
  expireStaleChallenges,
} from '@/lib/challenge-utils';

async function loadChallenge(id: string): Promise<any | null> {
  const [rows]: any = await mysqlPool.query(
    `SELECT c.*, t.title AS testTitle, t.totalMarks AS totalMarks
       FROM Challenges c LEFT JOIN Tests t ON t.id = c.testId
      WHERE c.id = ?`,
    [id]
  );
  return rows?.[0] || null;
}

/**
 * GET /api/student/challenges/:id
 * Challenge detail. Status ACCEPTED hai aur dono ne challenge ke baad
 * test de diya ho to yahin faisla ho jata hai (COMPLETED + winnerId) —
 * jeet hamesha asal attempt-scores se, koi fake result nahi.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;

    await expireStaleChallenges(me);

    const c = await loadChallenge(params.id);
    if (!c) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Challenge nahi mili'), { status: 404 });
    }
    if (c.challengerId !== me && c.opponentId !== me) {
      return NextResponse.json(createApiError('FORBIDDEN', 'Ye challenge tumhari nahi hai'), { status: 403 });
    }

    // Auto-judge: dono ne challenge ke baad attempt poora kiya?
    if (c.status === 'ACCEPTED') {
      const [challengerBest, opponentBest] = await Promise.all([
        bestAttemptAfter(c.testId, c.challengerId, c.createdAt),
        bestAttemptAfter(c.testId, c.opponentId, c.createdAt),
      ]);
      const { outcome, winnerSide } = decideChallengeWinner(challengerBest, opponentBest);
      if (outcome !== 'AWAITING_ATTEMPTS') {
        const winnerId = winnerSide === 'challenger' ? c.challengerId : winnerSide === 'opponent' ? c.opponentId : null;
        await mysqlPool.query(
          `UPDATE Challenges SET status = 'COMPLETED', challengerBest = ?, opponentBest = ?,
                  winnerId = ?, completedAt = NOW() WHERE id = ?`,
          [challengerBest, opponentBest, winnerId, c.id]
        );
        Object.assign(c, {
          status: 'COMPLETED',
          challengerBest,
          opponentBest,
          winnerId,
          completedAt: new Date(),
        });
      } else {
        // Abhi faisla nahi — progress dikhao (kisne de diya, kisne nahi)
        Object.assign(c, {
          challengerBest,
          opponentBest,
          challengerAttempted: challengerBest != null,
          opponentAttempted: opponentBest != null,
        });
      }
    }

    const names = await fetchDisplayMap(
      [c.challengerId, c.opponentId, c.winnerId].filter(Boolean)
    );
    const challenger = names[c.challengerId] || { userId: c.challengerId, name: null, email: '' };
    const opponent = names[c.opponentId] || { userId: c.opponentId, name: null, email: '' };
    const winner = c.winnerId ? names[c.winnerId] || { userId: c.winnerId, name: null, email: '' } : null;

    return NextResponse.json(
      createApiResponse({
        id: c.id,
        testId: c.testId,
        testTitle: c.testTitle || 'Test',
        totalMarks: c.totalMarks == null ? null : Number(c.totalMarks),
        challenger,
        opponent,
        myRole: c.challengerId === me ? 'challenger' : 'opponent',
        status: c.status,
        challengerBest: c.challengerBest == null ? null : Number(c.challengerBest),
        opponentBest: c.opponentBest == null ? null : Number(c.opponentBest),
        challengerAttempted: c.challengerAttempted ?? (c.challengerBest != null),
        opponentAttempted: c.opponentAttempted ?? (c.opponentBest != null),
        winner,
        isTie: c.status === 'COMPLETED' && !c.winnerId,
        createdAt: c.createdAt ?? null,
        acceptedAt: c.acceptedAt ?? null,
        expiresAt: c.expiresAt ?? null,
        completedAt: c.completedAt ?? null,
      }),
      { status: 200 }
    );
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch challenge'), { status: 500 });
  }
}

/**
 * PATCH /api/student/challenges/:id  { action: 'accept' | 'decline' | 'cancel' }
 * - accept/decline: sirf opponent, sirf PENDING par
 * - cancel: sirf challenger, sirf PENDING par
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await ensureChallengeSchema();
    const session = await requireRole(req, UserRole.STUDENT);
    const me = session.userId;
    const body = await req.json().catch(() => ({}));
    const { action } = body || {};

    if (action !== 'accept' && action !== 'decline' && action !== 'cancel') {
      return NextResponse.json(
        createApiError('BAD_REQUEST', "action 'accept'/'decline'/'cancel' me se ho"),
        { status: 400 }
      );
    }

    const c = await loadChallenge(params.id);
    if (!c) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Challenge nahi mili'), { status: 404 });
    }
    if (c.status !== 'PENDING') {
      return NextResponse.json(
        createApiError('CONFLICT', `Challenge pehle hi ${c.status} hai`),
        { status: 409 }
      );
    }
    if (c.expiresAt && new Date(c.expiresAt).getTime() < Date.now()) {
      await mysqlPool.query(`UPDATE Challenges SET status = 'EXPIRED' WHERE id = ?`, [c.id]);
      return NextResponse.json(createApiError('GONE', 'Challenge ki expiry nikal gayi'), { status: 410 });
    }

    if (action === 'cancel') {
      if (c.challengerId !== me) {
        return NextResponse.json(createApiError('FORBIDDEN', 'Sirf bhejne wala cancel kar sakta hai'), { status: 403 });
      }
      await mysqlPool.query(`UPDATE Challenges SET status = 'CANCELLED' WHERE id = ?`, [c.id]);
      return NextResponse.json(createApiResponse({ id: c.id, status: 'CANCELLED' }), { status: 200 });
    }

    // accept / decline — sirf opponent
    if (c.opponentId !== me) {
      return NextResponse.json(createApiError('FORBIDDEN', 'Sirf samne wala jawab de sakta hai'), { status: 403 });
    }
    const next = action === 'accept' ? 'ACCEPTED' : 'DECLINED';
    if (next === 'ACCEPTED') {
      await mysqlPool.query(
        `UPDATE Challenges SET status = 'ACCEPTED', acceptedAt = NOW() WHERE id = ?`,
        [c.id]
      );
    } else {
      await mysqlPool.query(`UPDATE Challenges SET status = 'DECLINED' WHERE id = ?`, [c.id]);
    }
    return NextResponse.json(createApiResponse({ id: c.id, status: next }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to update challenge'), { status: 500 });
  }
}

import { mysqlPool } from '@/lib/db';

/**
 * Friend/challenge shared logic.
 *
 * Pure faisle (decideChallengeWinner) yahan hain taaki unit test DB ke bina
 * chal sake. DB wale helpers (areFriends, fetchDisplayMap, bestAttemptAfter)
 * routes me istemal hote hain.
 */

export const CHALLENGE_EXPIRY_DAYS = 7;

/** Challenge ke baad wala sabse achha score — jeet ka faisla isi par. */
export type ChallengeOutcome = 'AWAITING_ATTEMPTS' | 'CHALLENGER_WIN' | 'OPPONENT_WIN' | 'TIE';

export function decideChallengeWinner(
  challengerBest: number | null,
  opponentBest: number | null
): { outcome: ChallengeOutcome; winnerSide: 'challenger' | 'opponent' | null } {
  if (challengerBest == null || opponentBest == null) {
    return { outcome: 'AWAITING_ATTEMPTS', winnerSide: null };
  }
  if (challengerBest > opponentBest) return { outcome: 'CHALLENGER_WIN', winnerSide: 'challenger' };
  if (opponentBest > challengerBest) return { outcome: 'OPPONENT_WIN', winnerSide: 'opponent' };
  return { outcome: 'TIE', winnerSide: null };
}

/** Dono users ke beech ACCEPTED dosti hai ya nahi. */
export async function areFriends(a: string, b: string): Promise<boolean> {
  if (!a || !b || a === b) return false;
  const [rows]: any = await mysqlPool.query(
    `SELECT id FROM Friendships WHERE status = 'ACCEPTED'
       AND ((requesterId = ? AND addresseeId = ?) OR (requesterId = ? AND addresseeId = ?))
     LIMIT 1`,
    [a, b, b, a]
  );
  return (rows || []).length > 0;
}

export interface DisplayInfo {
  userId: string;
  name: string | null;
  email: string;
}

/** userIds ke liye naam+email ek query me (Users + StudentProfiles). */
export async function fetchDisplayMap(userIds: string[]): Promise<Record<string, DisplayInfo>> {
  const ids = [...new Set((userIds || []).filter(Boolean))];
  const map: Record<string, DisplayInfo> = {};
  if (ids.length === 0) return map;
  const [rows]: any = await mysqlPool.query(
    `SELECT u.id AS userId, u.email AS email, sp.name AS name
       FROM Users u LEFT JOIN StudentProfiles sp ON sp.userId = u.id
      WHERE u.id IN (${ids.map(() => '?').join(',')})`,
    ids
  );
  for (const r of rows || []) {
    map[r.userId] = { userId: r.userId, name: r.name || null, email: r.email };
  }
  return map;
}

/**
 * Challenge create hone ke BAAD wala sabse achha poora attempt-score
 * (AssessmentAttempts: assessmentId = testId, EVALUATED/COMPLETED).
 * Koi attempt nahi to null — fake 0 kabhi nahi.
 */
export async function bestAttemptAfter(
  testId: string,
  studentId: string,
  after: Date | string
): Promise<number | null> {
  const [rows]: any = await mysqlPool.query(
    `SELECT MAX(score) AS best FROM AssessmentAttempts
      WHERE assessmentId = ? AND studentId = ?
        AND status IN ('EVALUATED','COMPLETED') AND completedAt >= ?`,
    [testId, studentId, after]
  );
  const v = rows?.[0]?.best;
  return v == null ? null : Number(v);
}

/** PENDING challenges jinki expiry nikal gayi — EXPIRED mark karo (idempotent). */
export async function expireStaleChallenges(userId: string): Promise<void> {
  try {
    await mysqlPool.query(
      `UPDATE Challenges SET status = 'EXPIRED'
        WHERE status = 'PENDING' AND expiresAt IS NOT NULL AND expiresAt < NOW()
          AND (challengerId = ? OR opponentId = ?)`,
      [userId, userId]
    );
  } catch {
    /* best-effort — list phir bhi chalegi */
  }
}

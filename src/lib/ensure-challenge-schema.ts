import { mysqlPool } from '@/lib/db';

/**
 * Friend/challenge tables — Friendships, Challenges.
 *
 * Purane provisioned DBs par tables missing ho sakti hain → /api/student/friends*
 * aur /api/student/challenges* 500 dete. Ye helper tables ko idempotently
 * banata hai (process me ek baar, information_schema check ke saath).
 * Ye KABHI throw nahi karta: DDL permission na ho to false, route phir bhi
 * honest error dega.
 *
 * ensure-pyq-schema.ts jaisa pattern:
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - status VARCHAR (ENUM ki jagah): naye status add hone par purane DBs par
 *   hard 500 nahi aayega.
 */
let cache: Promise<boolean> | null = null;

const DDL_FRIENDSHIPS = `CREATE TABLE IF NOT EXISTS Friendships (
  id VARCHAR(36) PRIMARY KEY,
  requesterId VARCHAR(36) NOT NULL,
  addresseeId VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_friendship_pair (requesterId, addresseeId),
  INDEX idx_friend_requester (requesterId),
  INDEX idx_friend_addressee (addresseeId)
)`;

const DDL_CHALLENGES = `CREATE TABLE IF NOT EXISTS Challenges (
  id VARCHAR(36) PRIMARY KEY,
  challengerId VARCHAR(36) NOT NULL,
  opponentId VARCHAR(36) NOT NULL,
  testId VARCHAR(36) NOT NULL,
  status VARCHAR(20) DEFAULT 'PENDING',
  challengerBest DECIMAL(6,2),
  opponentBest DECIMAL(6,2),
  winnerId VARCHAR(36),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  acceptedAt DATETIME,
  expiresAt DATETIME,
  completedAt DATETIME,
  INDEX idx_ch_challenger (challengerId),
  INDEX idx_ch_opponent (opponentId),
  INDEX idx_ch_test (testId),
  INDEX idx_ch_status (status)
)`;

async function ensure(): Promise<boolean> {
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('Friendships','Challenges')`
    );
    const have = new Set((rows || []).map((r: any) => r.name));
    if (!have.has('Friendships')) {
      await mysqlPool.query(DDL_FRIENDSHIPS);
      console.log('[challenge-schema] created missing table Friendships');
    }
    if (!have.has('Challenges')) {
      await mysqlPool.query(DDL_CHALLENGES);
      console.log('[challenge-schema] created missing table Challenges');
    }
    return true;
  } catch (e: any) {
    console.error('[challenge-schema] Friend/Challenges tables unavailable:', e?.message);
    return false;
  }
}

/** True jab Friendships/Challenges maujood hon aur friend/challenge API use ho sake. */
export function ensureChallengeSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

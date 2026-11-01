import { UserRole, UserSession } from '@/types/auth';
import { mysqlPool } from './db';
import { ensureSessionSchema } from './ensure-session-schema';

/**
 * Session store — DATABASE-BACKED since the 2026-10-30 login-loop fix.
 *
 * Previously sessions lived in an in-process Map (global.memorySessionStore).
 * That could never work for page navigation: middleware runs in the Edge
 * Runtime with separate memory, so it never found the session the Node
 * runtime had just saved at login, and every portal page redirected back to
 * the login page. (It also meant a server restart logged everyone out.)
 *
 * The exported signatures and the UserSession shape are UNCHANGED — every
 * existing caller (lib/auth.ts, login/logout/register/google routes via it)
 * works exactly as before, only the storage moved to the `Sessions` table
 * (see lib/ensure-session-schema.ts).
 *
 * Datetimes are stored as UTC wall time ('YYYY-MM-DD HH:mm:ss'), matching
 * the conversion style used across lib/db.ts.
 */

function toSqlDatetime(iso: string): string {
  return iso.slice(0, 19).replace('T', ' ');
}

function toIsoString(value: any): string {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') {
    // MySQL DATETIME comes back as a Date by default; if a driver config ever
    // returns a string, it is UTC wall time (that is how we stored it).
    return value.includes('T') ? value : value.replace(' ', 'T') + 'Z';
  }
  return new Date(value).toISOString();
}

function rowToSession(row: any): UserSession {
  return {
    sessionId: row.sessionId,
    userId: row.userId,
    role: row.role as UserRole,
    email: row.email,
    createdAt: toIsoString(row.createdAt),
    expiresAt: toIsoString(row.expiresAt),
    ipAddress: row.ipAddress || undefined,
    userAgent: row.userAgent || undefined,
  };
}

export async function saveSession(session: UserSession, ttlSeconds: number = 604800): Promise<void> {
  // Expiry is carried by session.expiresAt (createServerSession computes it
  // from ttlSeconds), so the ttl argument is kept only for signature
  // compatibility with the old in-memory store.
  void ttlSeconds;
  await ensureSessionSchema();
  await mysqlPool.query(
    `INSERT INTO Sessions (sessionId, userId, role, email, createdAt, expiresAt, ipAddress, userAgent)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       userId = VALUES(userId), role = VALUES(role), email = VALUES(email),
       createdAt = VALUES(createdAt), expiresAt = VALUES(expiresAt),
       ipAddress = VALUES(ipAddress), userAgent = VALUES(userAgent)`,
    [
      session.sessionId,
      session.userId,
      session.role,
      session.email,
      toSqlDatetime(session.createdAt),
      toSqlDatetime(session.expiresAt),
      session.ipAddress || null,
      session.userAgent || null,
    ]
  );
}

export async function getSession(sessionId: string): Promise<UserSession | null> {
  // Fail-closed: any DB problem reads as "no session" (user is asked to log
  // in again) instead of throwing into middleware / page renders.
  try {
    await ensureSessionSchema();
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM Sessions WHERE sessionId = ?',
      [sessionId]
    );
    const row = rows && rows[0];
    if (!row) return null;

    const session = rowToSession(row);

    // Check expiration (same rule as the old in-memory store)
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      await deleteSession(sessionId);
      return null;
    }

    return session;
  } catch (e: any) {
    console.error('[sessions] getSession failed:', e?.message);
    return null;
  }
}

export async function deleteSession(sessionId: string): Promise<void> {
  try {
    await ensureSessionSchema();
    await mysqlPool.query('DELETE FROM Sessions WHERE sessionId = ?', [sessionId]);
  } catch (e: any) {
    // Logout must not 500 because cleanup failed; the cookie is expired
    // client-side regardless.
    console.error('[sessions] deleteSession failed:', e?.message);
  }
}

export async function clearAllSessions(): Promise<void> {
  await ensureSessionSchema();
  await mysqlPool.query('DELETE FROM Sessions');
}

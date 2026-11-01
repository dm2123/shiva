import { mysqlPool } from '@/lib/db';

/**
 * Sessions table self-heal (login-session fix, 2026-10-30).
 *
 * Sessions used to live in an in-process Map (see lib/redis.ts), which the
 * Edge-runtime middleware could never read — login redirected straight back
 * to the login page on every host. Sessions are now stored in this table so
 * both the Node runtime (login/logout routes) and the internal session-check
 * route (used by middleware) see the same data.
 *
 * Follows the repo's ensure-*-schema.ts pattern: CREATE TABLE IF NOT EXISTS,
 * checked once per process, NEVER throws. If one pass fails (DB briefly
 * down, no DDL permission), the cache is cleared so a later call retries —
 * sessions are too critical to stay broken until a restart.
 */
let cache: Promise<boolean> | null = null;

async function ensure(): Promise<boolean> {
  try {
    await mysqlPool.query(
      `CREATE TABLE IF NOT EXISTS Sessions (
        sessionId VARCHAR(64) NOT NULL PRIMARY KEY,
        userId VARCHAR(64) NOT NULL,
        role VARCHAR(20) NOT NULL,
        email VARCHAR(255) NOT NULL,
        createdAt DATETIME NOT NULL,
        expiresAt DATETIME NOT NULL,
        ipAddress VARCHAR(64) NULL,
        userAgent VARCHAR(512) NULL,
        INDEX idx_sessions_expires (expiresAt),
        INDEX idx_sessions_user (userId)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`
    );
    return true;
  } catch (e: any) {
    console.error('[session-schema] Sessions table unavailable:', e?.message);
    return false;
  }
}

/** True when the Sessions table exists and may be used. */
export function ensureSessionSchema(): Promise<boolean> {
  if (!cache) {
    cache = ensure().then((ok) => {
      if (!ok) cache = null; // retry on the next call, don't cache a failure
      return ok;
    });
  }
  return cache;
}

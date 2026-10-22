import { mysqlPool } from '@/lib/db';

/**
 * Google Sign-In needs three optional columns on the Users table:
 * googleId, authProvider and avatarUrl. The production database was
 * provisioned from init_db_full.sql, which predates Google Sign-In, so
 * those columns are missing there — Google login used to fail at the
 * final step with:
 *
 *   Unknown column 'googleid' in 'where clause'
 *
 * This helper checks information_schema once per process and adds any
 * missing column (the check makes every ALTER idempotent). It NEVER
 * throws: if the DB user cannot ALTER, it returns the columns that do
 * exist and the Google route falls back to plain email find-or-create,
 * so login is never blocked by a missing column.
 */

export const GOOGLE_USER_COLUMNS: Record<string, string> = {
  authProvider: 'VARCHAR(32) DEFAULT NULL',
  googleId: 'VARCHAR(64) DEFAULT NULL',
  avatarUrl: 'VARCHAR(500) DEFAULT NULL',
};

let cache: Promise<Set<string>> | null = null;

async function fetchUsersColumns(): Promise<Set<string>> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users'`
  );
  return new Set<string>(rows.map((r: any) => String(r.name)));
}

async function ensure(): Promise<Set<string>> {
  const cols = await fetchUsersColumns();

  for (const [col, def] of Object.entries(GOOGLE_USER_COLUMNS)) {
    if (cols.has(col)) continue;
    try {
      await mysqlPool.query(`ALTER TABLE Users ADD COLUMN \`${col}\` ${def}`);
      cols.add(col);
      console.log(`[google-schema] added missing column Users.${col}`);
    } catch (e: any) {
      // No DDL permission (or a race with another instance) — not fatal.
      // The route checks the returned set before using a column.
      console.error(`[google-schema] could not add Users.${col}:`, e?.message);
    }
  }

  // Best-effort lookup index on googleId (pure optimisation).
  if (cols.has('googleId')) {
    try {
      const [idx]: any = await mysqlPool.query(
        `SELECT 1 FROM information_schema.STATISTICS
          WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Users'
            AND INDEX_NAME = 'idx_google_id' LIMIT 1`
      );
      if (!idx.length) {
        await mysqlPool.query('ALTER TABLE Users ADD INDEX idx_google_id (googleId)');
      }
    } catch {
      /* index is optional */
    }
  }

  return cols;
}

/**
 * Returns the set of Users column names that exist (after attempting to
 * add the Google ones). Cached per process; a failed check is not cached
 * so the next login attempt retries.
 */
export function ensureGoogleUsersColumns(): Promise<Set<string>> {
  if (!cache) {
    cache = ensure().catch((e: any) => {
      console.error('[google-schema] column check failed:', e?.message);
      cache = null;
      return new Set<string>();
    });
  }
  return cache;
}

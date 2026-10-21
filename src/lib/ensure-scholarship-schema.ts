import { mysqlPool } from '@/lib/db';

/**
 * Scholarship tests need optional columns on the Tests table
 * (isScholarship, scholarshipReward, scholarshipEndDate, maxParticipants,
 * participantsCount — defined in schema_updates.sql). That migration was
 * never applied to the production database, which was provisioned from
 * init_db_full.sql, so the scholarships route used to fail with:
 *
 *   Unknown column 't.startTime' in 'order clause'
 *   (and would also have failed on t.isScholarshipTest / attempt joins)
 *
 * This helper mirrors ensure-google-schema.ts: it checks
 * information_schema once per process and adds any missing column (the
 * check makes every ALTER idempotent). It NEVER throws — if the DB user
 * cannot ALTER, the route falls back to an empty scholarship list
 * instead of a 500.
 */

export const SCHOLARSHIP_TEST_COLUMNS: Record<string, string> = {
  isScholarship: 'TINYINT(1) DEFAULT 0',
  scholarshipReward: 'DECIMAL(10,2) DEFAULT NULL',
  maxParticipants: 'INT DEFAULT NULL',
  participantsCount: 'INT DEFAULT 0',
  scholarshipEndDate: 'DATETIME DEFAULT NULL',
};

let cache: Promise<Set<string>> | null = null;

async function fetchTestsColumns(): Promise<Set<string>> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Tests'`
  );
  return new Set<string>(rows.map((r: any) => String(r.name)));
}

async function ensure(): Promise<Set<string>> {
  const cols = await fetchTestsColumns();

  for (const [col, def] of Object.entries(SCHOLARSHIP_TEST_COLUMNS)) {
    if (cols.has(col)) continue;
    try {
      await mysqlPool.query(`ALTER TABLE Tests ADD COLUMN \`${col}\` ${def}`);
      cols.add(col);
      console.log(`[scholarship-schema] added missing column Tests.${col}`);
    } catch (e: any) {
      // No DDL permission (or a race with another instance) — not fatal.
      console.error(`[scholarship-schema] could not add Tests.${col}:`, e?.message);
    }
  }

  return cols;
}

/**
 * Returns the set of Tests column names that exist (after attempting to
 * add the scholarship ones). Cached per process; a failed check is not
 * cached so the next request retries.
 */
export function ensureScholarshipTestColumns(): Promise<Set<string>> {
  if (!cache) {
    cache = ensure().catch((e: any) => {
      console.error('[scholarship-schema] column check failed:', e?.message);
      cache = null;
      return new Set<string>();
    });
  }
  return cache;
}

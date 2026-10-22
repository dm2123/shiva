import { mysqlPool } from '@/lib/db';

/**
 * Test analysis needs the student's real time-taken per attempt. The
 * mobile app measures elapsed time on-device and sends `timeTakenSec`
 * with the submit; website attempts derive duration from
 * startedAt/completedAt instead. AssessmentAttempts (provisioned from
 * init_db_full.sql) has no duration column, so this helper adds
 * `timeTakenSec` (INT, seconds) idempotently — checked once per process
 * via information_schema. It NEVER throws: if the DB user cannot ALTER,
 * callers simply skip the column and analysis omits time metrics.
 */
let cache: Promise<boolean> | null = null;

async function ensure(): Promise<boolean> {
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'AssessmentAttempts'
          AND COLUMN_NAME = 'timeTakenSec'`
    );
    if (rows && rows.length > 0) return true;
    await mysqlPool.query(
      'ALTER TABLE AssessmentAttempts ADD COLUMN `timeTakenSec` INT DEFAULT NULL'
    );
    console.log('[attempt-schema] added missing column AssessmentAttempts.timeTakenSec');
    return true;
  } catch (e: any) {
    // No DDL permission (or a race with another instance) — not fatal.
    console.error('[attempt-schema] timeTakenSec unavailable:', e?.message);
    return false;
  }
}

/** True when AssessmentAttempts.timeTakenSec exists and may be used. */
export function hasAttemptTimeColumn(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

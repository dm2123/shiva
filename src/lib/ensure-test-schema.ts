import { mysqlPool } from '@/lib/db';

/**
 * The student app groups tests into Mock / PYQ / Practice sections from
 * the test row's `type` (falling back to `category`). The Tests table
 * (provisioned from init_db_full.sql) has neither column, so this helper
 * adds them idempotently — checked once per process via
 * information_schema. It NEVER throws: if the DB user cannot ALTER,
 * callers simply omit type/category and the app keeps its honest
 * single-section list.
 *
 * Backfill: when the `type` column is created by THIS pass, every
 * pre-existing test gets type='mock' — the catalog that existed before
 * typing was introduced consists of mock tests. The backfill runs only
 * on the creation pass, never on later boots, so tests created
 * afterwards keep whatever type their creator set (or NULL).
 */
let cache: Promise<boolean> | null = null;

async function columnExists(name: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Tests'
        AND COLUMN_NAME = ?`,
    [name]
  );
  return !!(rows && rows.length > 0);
}

async function ensure(): Promise<boolean> {
  try {
    let typeReady = await columnExists('type');
    if (!typeReady) {
      await mysqlPool.query(
        "ALTER TABLE Tests ADD COLUMN `type` VARCHAR(20) DEFAULT NULL"
      );
      console.log('[test-schema] added missing column Tests.type');
      // One-time backfill for the pre-typing catalog (all mock tests).
      await mysqlPool.query(
        "UPDATE Tests SET `type` = 'mock' WHERE `type` IS NULL"
      );
      typeReady = true;
    }
    if (!(await columnExists('category'))) {
      await mysqlPool.query(
        'ALTER TABLE Tests ADD COLUMN `category` VARCHAR(60) DEFAULT NULL'
      );
      console.log('[test-schema] added missing column Tests.category');
    }
    return typeReady;
  } catch (e: any) {
    // No DDL permission (or a race with another instance) — not fatal.
    console.error('[test-schema] type/category unavailable:', e?.message);
    return false;
  }
}

/** True when Tests.type exists and may be used in INSERT/UPDATE. */
export function hasTestTypeColumns(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

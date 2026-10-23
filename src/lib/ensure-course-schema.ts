import { mysqlPool } from '@/lib/db';

/**
 * Course info columns shown on the app's course-detail screen
 * (§21: language, validity, "ye course kiske liye hai").
 *
 * The Courses table (provisioned from init_db_full.sql) historically has
 * none of these, so this helper adds them idempotently — checked once per
 * process via information_schema. It NEVER throws: if the DB user cannot
 * ALTER, callers strip the keys and the app keeps its honest empty states.
 */
let cache: Promise<boolean> | null = null;

async function columnExists(name: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Courses'
        AND COLUMN_NAME = ?`,
    [name]
  );
  return !!(rows && rows.length > 0);
}

async function ensure(): Promise<boolean> {
  try {
    const cols: [string, string][] = [
      ['language', 'VARCHAR(60) DEFAULT NULL'],
      ['validityMonths', 'INT DEFAULT NULL'],
      ['targetAudience', 'TEXT DEFAULT NULL'],
    ];
    for (const [name, def] of cols) {
      if (!(await columnExists(name))) {
        await mysqlPool.query(`ALTER TABLE Courses ADD COLUMN \`${name}\` ${def}`);
        console.log(`[course-schema] added missing column Courses.${name}`);
      }
    }
    return true;
  } catch (e: any) {
    // No DDL permission (or a race with another instance) — not fatal.
    console.error('[course-schema] course info columns unavailable:', e?.message);
    return false;
  }
}

/** True when Courses.language / validityMonths / targetAudience exist and may be used. */
export function hasCourseInfoColumns(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

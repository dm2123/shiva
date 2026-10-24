import { mysqlPool } from '@/lib/db';

/**
 * Teacher Verified Notes — VerifiedNotes.fileUrl (notes PDF attach).
 *
 * Canonical definition schema_ai_features.sql me hai (fileUrl VARCHAR(500)),
 * lekin purane provisioned DBs par table purani schema se bani ho sakti hai
 * (fileUrl column ke bina) ya table hi missing ho sakti hai → teacher ka
 * PDF attach wala POST 500 deta, aur app ko fileUrl kabhi nahi milta.
 * Ye helper (ensure-bookmark-schema.ts / ensure-pyq-schema.ts jaisa pattern)
 * table + fileUrl column ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath). Ye KABHI throw nahi karta: DDL
 * permission na ho to false, route phir bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - Table banate waqt sirf wahi columns jo route use karta hai (id, lectureId,
 *   teacherId, title, content, fileUrl, timestamps).
 */
let cache: Promise<boolean> | null = null;

const DDL_TABLE = `CREATE TABLE IF NOT EXISTS VerifiedNotes (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  fileUrl VARCHAR(500),
  version INT DEFAULT 1,
  isOfficial TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

async function ensure(): Promise<boolean> {
  try {
    const [tables]: any = await mysqlPool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'VerifiedNotes'`,
    );
    if (!tables || tables.length === 0) {
      await mysqlPool.query(DDL_TABLE);
      console.log('[verified-notes-schema] created missing table VerifiedNotes');
      return true;
    }
    const [cols]: any = await mysqlPool.query(
      `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'VerifiedNotes'
        AND COLUMN_NAME = 'fileUrl'`,
    );
    if (!cols || cols.length === 0) {
      await mysqlPool.query(
        `ALTER TABLE VerifiedNotes ADD COLUMN fileUrl VARCHAR(500)`,
      );
      console.log('[verified-notes-schema] added missing column VerifiedNotes.fileUrl');
    }
    return true;
  } catch (e: any) {
    console.error('[verified-notes-schema] VerifiedNotes unavailable:', e?.message);
    return false;
  }
}

/** True jab VerifiedNotes table + fileUrl column maujood ho. */
export function ensureVerifiedNotesSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

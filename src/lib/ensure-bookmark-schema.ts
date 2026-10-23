import { mysqlPool } from '@/lib/db';

/**
 * ContentBookmarks table — student ke lecture/note/DPP/PYQ bookmarks
 * ("Wapas Dekho" list app me).
 *
 * Canonical definition schema_ai_features.sql me hai, lekin purane provisioned
 * DBs par table missing ho sakti hai → /api/student/bookmarks 500 deta.
 * Ye helper table ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to false,
 * route phir bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se:
 * - contentType VARCHAR(20) (ENUM ki jagah): route koi bhi contentType string
 *   accept karta hai; ENUM unknown value par hard 500 deta.
 * - Koi FOREIGN KEY nahi: cross-table DDL Users table ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 */
let cache: Promise<boolean> | null = null;

const DDL = `CREATE TABLE IF NOT EXISTS ContentBookmarks (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  contentType VARCHAR(20) NOT NULL,
  contentId VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  note TEXT,
  highlightColor VARCHAR(20),
  positionSeconds INT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_bookmark_student (studentId),
  INDEX idx_bookmark_content (contentType, contentId)
)`;

async function ensure(): Promise<boolean> {
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ContentBookmarks'`
    );
    if (!rows || rows.length === 0) {
      await mysqlPool.query(DDL);
      console.log('[bookmark-schema] created missing table ContentBookmarks');
    }
    return true;
  } catch (e: any) {
    console.error('[bookmark-schema] ContentBookmarks unavailable:', e?.message);
    return false;
  }
}

/** True jab ContentBookmarks table maujood ho aur bookmarks API use ho sake. */
export function ensureBookmarkTable(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

import { mysqlPool } from '@/lib/db';

/**
 * Batch announcements — TeacherAnnouncements + AnnouncementReads tables.
 *
 * Canonical definition schema_batch_b.sql me hai, lekin purane provisioned
 * DBs par ye tables missing ho sakti hain (baaki tables ke liye bhi yahi
 * hua tha — isliye ensure-ebooks/formula/notifications/pyq pattern
 * bana) → /api/student/announcements tab 500 deta, aur app ka
 * "Batch Announcements" section + Home ka "What's New" kabhi ghoshna
 * dikhata hi nahi, chahe teacher ne announcement bheji ho ya nahi.
 * Ye helper (ensure-notifications-schema.ts jaisa pattern) dono tables
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to
 * false, route phir bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - priority/type/targetAudience VARCHAR (ENUM ki jagah): teacher/admin koi
 *   bhi value bhej sakta hai; ENUM unknown value par hard 500 deta.
 * - Sirf wahi columns jo announcements route use karta hai (WHERE: targetAudience,
 *   courseId, batchId, expiresAt; ORDER: pinToTop, createdAt; SELECT: ta.* +
 *   AnnouncementReads subquery; POST: AnnouncementReads insert).
 */
let cache: Promise<boolean> | null = null;

const DDL_ANNOUNCEMENTS = `CREATE TABLE IF NOT EXISTS TeacherAnnouncements (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36),
  batchId VARCHAR(36),
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  type VARCHAR(20) DEFAULT 'GENERAL',
  targetAudience VARCHAR(20) DEFAULT 'ENROLLED',
  pinToTop TINYINT(1) DEFAULT 0,
  viewCount INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME,
  INDEX idx_teacher_ann (teacherId),
  INDEX idx_batch_ann (batchId)
)`;

/** Route ka isRead subquery + POST mark-read isi table par chalte hain. */
const DDL_READS = `CREATE TABLE IF NOT EXISTS AnnouncementReads (
  id VARCHAR(36) PRIMARY KEY,
  announcementId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  readAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_announcement_user (announcementId, userId)
)`;

/** Route ke WHERE/ORDER/SELECT ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['title', 'VARCHAR(255) NOT NULL'],
  ['message', 'TEXT NOT NULL'],
  ['priority', "VARCHAR(20) DEFAULT 'MEDIUM'"],
  ['type', "VARCHAR(20) DEFAULT 'GENERAL'"],
  ['targetAudience', "VARCHAR(20) DEFAULT 'ENROLLED'"],
  ['courseId', 'VARCHAR(36)'],
  ['batchId', 'VARCHAR(36)'],
  ['pinToTop', 'TINYINT(1) DEFAULT 0'],
  ['viewCount', 'INT DEFAULT 0'],
  ['expiresAt', 'DATETIME'],
];

async function tableExists(name: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ?`,
    [name],
  );
  return !!(rows && rows.length > 0);
}

async function columnExists(table: string, column: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return !!(rows && rows.length > 0);
}

async function ensure(): Promise<boolean> {
  try {
    if (!(await tableExists('TeacherAnnouncements'))) {
      await mysqlPool.query(DDL_ANNOUNCEMENTS);
      console.log('[announcements-schema] created missing table TeacherAnnouncements');
    }
    if (!(await tableExists('AnnouncementReads'))) {
      await mysqlPool.query(DDL_READS);
      console.log('[announcements-schema] created missing table AnnouncementReads');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('TeacherAnnouncements', col))) {
        await mysqlPool.query(`ALTER TABLE TeacherAnnouncements ADD COLUMN ${col} ${ddl}`);
        console.log(`[announcements-schema] added missing column TeacherAnnouncements.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[announcements-schema] TeacherAnnouncements unavailable:', e?.message);
    return false;
  }
}

/** True jab TeacherAnnouncements + AnnouncementReads + route-critical columns maujood hon. */
export function ensureAnnouncementsSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

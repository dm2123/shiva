import { mysqlPool } from '@/lib/db';

/**
 * Short Notes / E-books — EBooks + EBookProgress tables.
 *
 * Canonical definition schema_batch_a.sql me hai, lekin purane provisioned
 * DBs par ye tables missing ho sakti hain (baaki tables ke liye bhi yahi
 * hua tha — isliye ensure-pyq/bookmark/verified-notes/challenge pattern
 * bana) → /api/student/ebooks tab 500 deta, aur Library ka "Short Notes"
 * tab hamesha error dikhata, chahe teacher ne ebooks daale hon ya nahi.
 * Ye helper (ensure-verified-notes-schema.ts jaisa pattern) dono tables
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to
 * false, route phir bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - category/difficulty/status VARCHAR (ENUM ki jagah): teacher/admin koi
 *   bhi category string bhej sakta hai; ENUM unknown value par hard 500 deta.
 * - fileUrl nullable rakha hai: draft ebook bina file ke bhi ban sake.
 * - Sirf wahi columns jo ebooks route use karta hai (filters: status,
 *   category, subjectId, courseId, difficulty, isFree, title/author search;
 *   order: downloadCount; select: eb.* + EBookProgress subquery).
 */
let cache: Promise<boolean> | null = null;

const DDL_EBOOKS = `CREATE TABLE IF NOT EXISTS EBooks (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  author VARCHAR(255),
  description TEXT,
  coverUrl VARCHAR(500),
  fileUrl VARCHAR(500),
  fileSizeMB DECIMAL(6,2),
  pageCount INT,
  courseId VARCHAR(36),
  subjectId VARCHAR(36),
  category VARCHAR(50) DEFAULT 'TEXTBOOK',
  difficulty VARCHAR(50) DEFAULT 'INTERMEDIATE',
  language VARCHAR(10) DEFAULT 'en',
  isFree TINYINT(1) DEFAULT 0,
  downloadCount INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ebooks_course (courseId),
  INDEX idx_ebooks_subject (subjectId),
  INDEX idx_ebooks_category (category)
)`;

/** Route ka subquery isi table se userCompleted/userCurrentPage padhta hai. */
const DDL_PROGRESS = `CREATE TABLE IF NOT EXISTS EBookProgress (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  ebookId VARCHAR(36) NOT NULL,
  currentPage INT DEFAULT 0,
  totalPages INT DEFAULT 0,
  highlights JSON,
  bookmarks JSON,
  lastReadAt DATETIME,
  completed TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_book (userId, ebookId)
)`;

/** Route ke filters/order/search ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['fileUrl', 'VARCHAR(500)'],
  ['status', "VARCHAR(20) DEFAULT 'ACTIVE'"],
  ['downloadCount', 'INT DEFAULT 0'],
  ['isFree', 'TINYINT(1) DEFAULT 0'],
  ['category', 'VARCHAR(50)'],
  ['difficulty', 'VARCHAR(50)'],
  ['subjectId', 'VARCHAR(36)'],
  ['courseId', 'VARCHAR(36)'],
  ['author', 'VARCHAR(255)'],
  ['pageCount', 'INT'],
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
    if (!(await tableExists('EBooks'))) {
      await mysqlPool.query(DDL_EBOOKS);
      console.log('[ebooks-schema] created missing table EBooks');
    }
    if (!(await tableExists('EBookProgress'))) {
      await mysqlPool.query(DDL_PROGRESS);
      console.log('[ebooks-schema] created missing table EBookProgress');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('EBooks', col))) {
        await mysqlPool.query(`ALTER TABLE EBooks ADD COLUMN ${col} ${ddl}`);
        console.log(`[ebooks-schema] added missing column EBooks.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[ebooks-schema] EBooks unavailable:', e?.message);
    return false;
  }
}

/** True jab EBooks + EBookProgress tables + route-critical columns maujood hon. */
export function ensureEbooksSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

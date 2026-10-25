import { mysqlPool } from '@/lib/db';

/**
 * Formula Sheets — FormulaSheets table (Library ka "Formula" tab, OTA 28).
 *
 * Canonical definition schema_batch_a.sql me hai, lekin purane provisioned
 * DBs par ye table missing ho sakti hai (EBooks/Pyq/Bookmarks ke liye bhi
 * yahi hua tha — isliye ensure-* pattern bana) → /api/student/formula-sheets
 * tab 500 deta, aur app + web dono ka Formula tab hamesha error dikhata,
 * chahe teacher ne sheets daali hon ya nahi.
 * Ye helper (ensure-ebooks-schema.ts jaisa pattern) table ko idempotently
 * banata hai (process me ek baar, information_schema check ke saath).
 * Ye KABHI throw nahi karta: DDL permission na ho to false, route phir
 * bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - difficulty/status VARCHAR (ENUM ki jagah): route difficulty ko free
 *   string filter ki tarah bhejta hai; ENUM unknown value par hard 500 deta.
 * - Sirf wahi columns jo formula-sheets route use karta hai (filters: status,
 *   subjectId, courseId, difficulty, chapterId; order: downloadCount;
 *   select: fs.* + Subjects/Courses/Chapters se naam).
 */
let cache: Promise<boolean> | null = null;

const DDL_FORMULA_SHEETS = `CREATE TABLE IF NOT EXISTS FormulaSheets (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  subjectId VARCHAR(36),
  courseId VARCHAR(36),
  chapterId VARCHAR(36),
  content JSON NOT NULL,
  pdfUrl VARCHAR(500),
  difficulty VARCHAR(50) DEFAULT 'JEE_MAIN',
  language VARCHAR(10) DEFAULT 'en',
  downloadCount INT DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_formula_subject (subjectId),
  INDEX idx_formula_chapter (chapterId)
)`;

/** Route ke filters/order ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['subjectId', 'VARCHAR(36)'],
  ['courseId', 'VARCHAR(36)'],
  ['chapterId', 'VARCHAR(36)'],
  ['content', 'JSON'],
  ['pdfUrl', 'VARCHAR(500)'],
  ['difficulty', 'VARCHAR(50)'],
  ['language', 'VARCHAR(10)'],
  ['downloadCount', 'INT DEFAULT 0'],
  ['status', "VARCHAR(20) DEFAULT 'ACTIVE'"],
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
    if (!(await tableExists('FormulaSheets'))) {
      await mysqlPool.query(DDL_FORMULA_SHEETS);
      console.log('[formula-schema] created missing table FormulaSheets');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('FormulaSheets', col))) {
        await mysqlPool.query(`ALTER TABLE FormulaSheets ADD COLUMN ${col} ${ddl}`);
        console.log(`[formula-schema] added missing column FormulaSheets.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[formula-schema] FormulaSheets unavailable:', e?.message);
    return false;
  }
}

/** True jab FormulaSheets table + route-critical columns maujood hon. */
export function ensureFormulaSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

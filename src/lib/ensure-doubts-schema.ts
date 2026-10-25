import { mysqlPool } from '@/lib/db';

/**
 * Doubts — Doubts + DoubtMessages tables (student doubts feature).
 *
 * Canonical definitions init_db_full.sql (Doubts base) + schema_doubts.sql
 * (enhanced columns + DoubtMessages) me hain, lekin purane provisioned
 * DBs par ye tables/columns missing ho sakti hain (study-plan/
 * question-bank ke liye bhi yahi hua tha — isliye ensure-* pattern bana).
 * Bina ensure ke student doubts ke teenon routes 500 dete:
 * - /api/student/doubts (list + raise) — Doubts table par
 * - /api/student/doubts/enhanced — Doubts + DoubtMessages (messageCount)
 * - /api/student/doubts/[id]/messages — DoubtMessages thread
 * Ye helper (ensure-study-plan-schema.ts jaisa pattern) dono tables ko
 * idempotently banata hai (process me ek baar, information_schema check
 * ke saath) aur maujood table me route-critical columns jodta hai.
 * Ye KABHI throw nahi karta: DDL permission na ho to false, route phir
 * bhi honest error dega.
 *
 * Is file ke saath theek hone wale do asli bug:
 * 1. Enhanced POST `content` + `lectureId` columns me INSERT karta hai,
 *    par canonical Doubts table me ye dono columns hain hi nahi
 *    (init_db_full.sql me sirf description hai; schema_doubts.sql ke
 *    ALTERs me bhi content/lectureId nahi) → enhanced doubt banate hi
 *    "Unknown column" 500. Ensure dono columns ADD karta hai.
 * 2. Messages POST resolved doubt par status 'REOPENED' likhta hai
 *    (DoubtTracker UI me REOPENED ka alag chip bhi hai), par canonical
 *    Doubts.status ENUM('OPEN','RESOLVED','CLOSED') hai → strict-mode
 *    par UPDATE fail, message save hone ke baad bhi POST 500 deta.
 *    Ensure ENUM status ko VARCHAR(20) par widen karta hai (existing
 *    values same rehti hain, sirf naye status allowed hote hain).
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - status/senderRole/category/priority VARCHAR (ENUM ki jagah): ENUM
 *   unknown value par hard 500 deta; route ke saare values VARCHAR
 *   me chalte hain.
 * - Fresh CREATE me courseId/description/content NULL-able: main
 *   doubts POST description bhejta hai (courseId ke saath), enhanced
 *   POST content bhejta hai (bina courseId) — dono flow ek hi table
 *   par chalne chahiye, isliye koi bhi ek column NOT NULL nahi ho sakta.
 * - Sirf wahi columns jo doubts routes use karte hain.
 */
let cache: Promise<boolean> | null = null;

const DDL_DOUBTS = `CREATE TABLE IF NOT EXISTS Doubts (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) DEFAULT NULL,
  chapterId VARCHAR(36) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  content TEXT DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'OPEN',
  teacherId VARCHAR(36) DEFAULT NULL,
  teacherResponse TEXT DEFAULT NULL,
  priority VARCHAR(20) DEFAULT 'MEDIUM',
  assignedTo VARCHAR(36) DEFAULT NULL,
  assignedAt DATETIME DEFAULT NULL,
  resolvedAt DATETIME DEFAULT NULL,
  slaDeadline DATETIME DEFAULT NULL,
  category VARCHAR(20) DEFAULT 'ACADEMIC',
  subject VARCHAR(100) DEFAULT NULL,
  lectureId VARCHAR(36) DEFAULT NULL,
  upvotes INT DEFAULT 0,
  isPublic TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_doubts_student (studentId),
  INDEX idx_doubts_course (courseId),
  INDEX idx_doubts_status (status)
)`;

const DDL_MESSAGES = `CREATE TABLE IF NOT EXISTS DoubtMessages (
  id VARCHAR(36) PRIMARY KEY,
  doubtId VARCHAR(36) NOT NULL,
  senderId VARCHAR(36) NOT NULL,
  senderRole VARCHAR(20) NOT NULL,
  content TEXT NOT NULL,
  attachmentUrl VARCHAR(500) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_doubt_messages_doubt (doubtId),
  INDEX idx_doubt_messages_sender (senderId)
)`;

/** Route ke filters/select/INSERT ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  Doubts: [
    ['studentId', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['chapterId', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['content', 'TEXT'],
    ['status', "VARCHAR(20) DEFAULT 'OPEN'"],
    ['teacherId', 'VARCHAR(36)'],
    ['teacherResponse', 'TEXT'],
    ['priority', "VARCHAR(20) DEFAULT 'MEDIUM'"],
    ['assignedTo', 'VARCHAR(36)'],
    ['assignedAt', 'DATETIME'],
    ['resolvedAt', 'DATETIME'],
    ['slaDeadline', 'DATETIME'],
    ['category', "VARCHAR(20) DEFAULT 'ACADEMIC'"],
    ['subject', 'VARCHAR(100)'],
    ['lectureId', 'VARCHAR(36)'],
    ['upvotes', 'INT DEFAULT 0'],
    ['isPublic', 'TINYINT(1) DEFAULT 1'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ],
  DoubtMessages: [
    ['doubtId', 'VARCHAR(36)'],
    ['senderId', 'VARCHAR(36)'],
    ['senderRole', 'VARCHAR(20)'],
    ['content', 'TEXT'],
    ['attachmentUrl', 'VARCHAR(500)'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
};

const DDL_BY_TABLE: Record<string, string> = {
  Doubts: DDL_DOUBTS,
  DoubtMessages: DDL_MESSAGES,
};

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

async function columnDataType(table: string, column: string): Promise<string | null> {
  const [rows]: any = await mysqlPool.query(
    `SELECT DATA_TYPE AS dataType FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?`,
    [table, column],
  );
  return rows && rows.length > 0 ? String(rows[0].dataType) : null;
}

async function ensure(): Promise<boolean> {
  try {
    for (const table of Object.keys(DDL_BY_TABLE)) {
      if (!(await tableExists(table))) {
        await mysqlPool.query(DDL_BY_TABLE[table]);
        console.log(`[doubts-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[doubts-schema] added missing column ${table}.${col}`);
        }
      }
    }
    // Canonical Doubts.status ENUM hai — messages route 'REOPENED'
    // likhta hai jo ENUM me nahi; ek baar VARCHAR par widen karo.
    if ((await columnDataType('Doubts', 'status')) === 'enum') {
      await mysqlPool.query(
        `ALTER TABLE Doubts MODIFY COLUMN status VARCHAR(20) DEFAULT 'OPEN'`,
      );
      console.log('[doubts-schema] widened Doubts.status ENUM -> VARCHAR(20)');
    }
    return true;
  } catch (e: any) {
    console.error('[doubts-schema] Doubts unavailable:', e?.message);
    return false;
  }
}

/** True jab Doubts + DoubtMessages + route-critical columns maujood hon. */
export function ensureDoubtsSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

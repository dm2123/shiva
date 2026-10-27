import { mysqlPool } from '@/lib/db';

/**
 * Student search index — StudentSearchIndex table.
 *
 * Canonical definition schema_remaining.sql me hai ("STUDENT SEARCH"
 * section), lekin purane provisioned DBs par ye table missing ho
 * sakti hai — aur tab is table ko poochne wale routes 500 dete hain
 * (MySQL me LEFT JOIN wali missing table bhi 1146 error deti hai):
 * - admin/student-search GET (COUNT + list + stats — teenon queries
 *   StudentSearchIndex par; list me StudentProfiles ka LEFT JOIN
 *   bhi hai, isliye wahan StudentProfiles ensure bhi chahiye);
 * - teacher/student-search GET (wahi teen queries, status/batch
 *   filters ke saath).
 * Ye helper (ensure-teacher-assignment-schema.ts jaisa pattern)
 * table ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath). Ye KABHI throw nahi karta:
 * DDL permission na ho to false, route phir bhi apna honest error
 * dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): purani rows wali table par NOT NULL ADD fail
 *   ho sakta hai, aur heal ko strict schema nahi banana.
 * - Maujood table par UNIQUE key / FULLTEXT index dobara nahi jode
 *   jaate (pehle se maujood duplicate rows hon to fail hoga) —
 *   DDL (nayi table) me UNIQUE key + FULLTEXT canonical jaise hi
 *   hain. Routes LIKE se search karte hain, MATCH se nahi, isliye
 *   FULLTEXT route-critical nahi hai.
 * - db.ts ke helpers me wiring jaan-boojh kar nahi ki (db <->
 *   ensure circular import hota; codebase me ensures routes me
 *   hi lagte hain) — isliye har StudentSearchIndex-consuming
 *   route handler me ye ensure auth ke baad call hota hai.
 */
let cache: Promise<boolean> | null = null;

const DDL_STUDENT_SEARCH_INDEX = `CREATE TABLE IF NOT EXISTS StudentSearchIndex (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  studentProfileId VARCHAR(36),
  name VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(20),
  targetExam VARCHAR(100),
  batchName VARCHAR(255),
  courseName VARCHAR(255),
  enrollmentStatus VARCHAR(50),
  lastActiveAt DATETIME,
  totalXP INT DEFAULT 0,
  currentStreak INT DEFAULT 0,
  avgTestScore DECIMAL(5,2) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user (userId),
  FULLTEXT INDEX ft_search (name, email, targetExam)
)`;

/** Route/helpers ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['id', 'VARCHAR(36)'],
  ['userId', 'VARCHAR(36)'],
  ['studentProfileId', 'VARCHAR(36)'],
  ['name', 'VARCHAR(255)'],
  ['email', 'VARCHAR(255)'],
  ['phone', 'VARCHAR(20)'],
  ['targetExam', 'VARCHAR(100)'],
  ['batchName', 'VARCHAR(255)'],
  ['courseName', 'VARCHAR(255)'],
  ['enrollmentStatus', 'VARCHAR(50)'],
  ['lastActiveAt', 'DATETIME'],
  ['totalXP', 'INT DEFAULT 0'],
  ['currentStreak', 'INT DEFAULT 0'],
  ['avgTestScore', 'DECIMAL(5,2) DEFAULT 0'],
  ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
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
    if (!(await tableExists('StudentSearchIndex'))) {
      await mysqlPool.query(DDL_STUDENT_SEARCH_INDEX);
      console.log('[student-search-schema] created missing table StudentSearchIndex');
    }
    for (const [col, colDdl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('StudentSearchIndex', col))) {
        await mysqlPool.query(`ALTER TABLE StudentSearchIndex ADD COLUMN ${col} ${colDdl}`);
        console.log(`[student-search-schema] added missing column StudentSearchIndex.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[student-search-schema] student search table unavailable:', e?.message);
    return false;
  }
}

/** True jab StudentSearchIndex + route-critical columns maujood hon. */
export function ensureStudentSearchSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

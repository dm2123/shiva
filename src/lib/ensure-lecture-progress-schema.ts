import { mysqlPool } from '@/lib/db';

/**
 * Learn progress — LectureProgress table.
 *
 * Canonical definition init_db_full.sql me hai (PROGRESS TRACKING
 * section), lekin purane provisioned DBs par ye table missing ho
 * sakti hai (analytics/gamification/doubts ke liye bhi yahi hua tha
 * — isliye ensure-* pattern bana) → tab:
 * - POST /api/student/learn/progress (Mark Complete / position save)
 *   500 deta, chahe student ne kabhi progress save ki ho ya nahi;
 * - GET /api/student/learn/lecture (app ka LearnScreen — har lecture
 *   par getLectureProgressDb, bina catch ke) poori lecture list ke
 *   bajay 500 deta.
 * Ye helper (ensure-analytics-schema.ts jaisa pattern) table ko
 * idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to
 * false, route phir bhi apna honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - Sirf wahi columns jo learn/progress + learn/lecture routes aur
 *   db.ts ke save/get helpers use karte hain (id, studentId,
 *   lectureId, isCompleted, positionSeconds) + lastWatchedAt/
 *   createdAt jo canonical me hain aur web pages ke resume queries
 *   me aate hain. Maujood table par UNIQUE key dobara nahi jodi
 *   jaati (pehle se maujood duplicate rows hon to fail hoga) —
 *   helpers ka ON DUPLICATE KEY UPDATE deterministic id PK
 *   (`lp-<user>-<lecture>`) par chalta hai, isliye wahi kaafi hai.
 */
let cache: Promise<boolean> | null = null;

const DDL_LECTURE_PROGRESS = `CREATE TABLE IF NOT EXISTS LectureProgress (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  lectureId VARCHAR(36) NOT NULL,
  isCompleted BOOLEAN DEFAULT FALSE,
  positionSeconds INT DEFAULT 0,
  lastWatchedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_lecture (studentId, lectureId),
  INDEX idx_studentId (studentId),
  INDEX idx_lectureId (lectureId)
)`;

/** Route/helpers ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['id', 'VARCHAR(36)'],
  ['studentId', 'VARCHAR(36)'],
  ['lectureId', 'VARCHAR(36)'],
  ['isCompleted', 'BOOLEAN DEFAULT FALSE'],
  ['positionSeconds', 'INT DEFAULT 0'],
  ['lastWatchedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
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
    if (!(await tableExists('LectureProgress'))) {
      await mysqlPool.query(DDL_LECTURE_PROGRESS);
      console.log('[lecture-progress-schema] created missing table LectureProgress');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('LectureProgress', col))) {
        await mysqlPool.query(`ALTER TABLE LectureProgress ADD COLUMN ${col} ${ddl}`);
        console.log(`[lecture-progress-schema] added missing column LectureProgress.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[lecture-progress-schema] LectureProgress unavailable:', e?.message);
    return false;
  }
}

/** True jab LectureProgress table + route-critical columns maujood hon. */
export function ensureLectureProgressSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

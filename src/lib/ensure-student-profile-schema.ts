import { mysqlPool } from '@/lib/db';

/**
 * StudentProfiles — student profile table (teacher doubts leg).
 *
 * Canonical definition init_db_full.sql me hai (id, userId UNIQUE,
 * name, phone, avatarUrl, targetExam, enrolledAt), lekin purane
 * provisioned DBs par ye table missing ho sakti hai — aur tab is
 * table ko poochne wale routes 500 dete hain (MySQL me LEFT JOIN
 * wali missing table bhi 1146 error deti hai):
 * - teacher/doubts GET (inbox: LEFT JOIN StudentProfiles sp ON
 *   d.studentId = sp.userId — studentName ke liye);
 * - teacher/doubts/queue GET (teenon filters: INNER JOIN
 *   StudentProfiles sp ON d.studentId = sp.userId — studentName
 *   ke liye; table missing ho to queue poori 1146 par 500 deti).
 * Ye helper (ensure-doubts-schema.ts / ensure-teacher-assignment-
 * schema.ts jaisa pattern) table ko idempotently banata hai
 * (process me ek baar, information_schema check ke saath) aur
 * maujood table me route-critical columns jodta hai.
 * Ye KABHI throw nahi karta: DDL permission na ho to false, route
 * phir bhi apna honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema
 *   par depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): purani rows wali table par NOT NULL ADD fail
 *   ho sakta hai, aur heal ko strict schema nahi banana — isliye
 *   fresh CREATE me NOT NULL wale name ko bhi ADD sirf
 *   VARCHAR(255) se hota hai.
 * - Maujood table par UNIQUE key dobara nahi jodi jaati (pehle se
 *   maujood duplicate rows hon to fail hoga) — DDL (nayi table)
 *   me UNIQUE key canonical jaisi hi hai, isliye duplicate profile
 *   par bhi DB-level guard barkarar rehta hai.
 * - Do extra columns (currentClass, email) kisi .sql file me defined
 *   nahi hain, lekin routes unhe SELECT karte hain (teacher/admin
 *   student-search: sp.currentClass; parent/children + mentors:
 *   sp.email) — isliye fresh CREATE me ye dono bhi hain aur maujood
 *   table me ADD bhi hote hain, taaki StudentProfiles leg kabhi
 *   1054 (Unknown column) par na gire. Un routes ki apni wiring
 *   (StudentSearchIndex jaise doosre tables) is run ka hissa nahi
 *   hai — wo alag candidate hai.
 * - db.ts ke helpers (getStudentProfileByUserId /
 *   createStudentProfile) me wiring jaan-boojh kar nahi ki
 *   (db <-> ensure circular import hota; codebase me ensures
 *   routes me hi lagte hain) — isliye har StudentProfiles-consuming
 *   route handler me ye ensure auth ke baad call hota hai.
 */
let cache: Promise<boolean> | null = null;

const DDL_STUDENT_PROFILES = `CREATE TABLE IF NOT EXISTS StudentProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  avatarUrl VARCHAR(500) DEFAULT NULL,
  targetExam VARCHAR(100) DEFAULT NULL,
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  currentClass VARCHAR(100) DEFAULT NULL,
  email VARCHAR(255) DEFAULT NULL
)`;

/** Route ke filters/select/INSERT ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['id', 'VARCHAR(36)'],
  ['userId', 'VARCHAR(36)'],
  ['name', 'VARCHAR(255)'],
  ['phone', 'VARCHAR(20)'],
  ['avatarUrl', 'VARCHAR(500)'],
  ['targetExam', 'VARCHAR(100)'],
  ['enrolledAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ['currentClass', 'VARCHAR(100)'],
  ['email', 'VARCHAR(255)'],
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
    if (!(await tableExists('StudentProfiles'))) {
      await mysqlPool.query(DDL_STUDENT_PROFILES);
      console.log('[student-profile-schema] created missing table StudentProfiles');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('StudentProfiles', col))) {
        await mysqlPool.query(`ALTER TABLE StudentProfiles ADD COLUMN ${col} ${ddl}`);
        console.log(`[student-profile-schema] added missing column StudentProfiles.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[student-profile-schema] StudentProfiles unavailable:', e?.message);
    return false;
  }
}

/** True jab StudentProfiles + route-critical columns maujood hon. */
export function ensureStudentProfileSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

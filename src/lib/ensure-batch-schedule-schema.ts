import { mysqlPool } from '@/lib/db';

/**
 * Batch timetable — BatchSchedule + TeacherProfiles + Batches.
 *
 * Canonical definitions: BatchSchedule schema_timetable.sql me hai;
 * TeacherProfiles aur Batches init_db_full.sql me hain. Lekin purane
 * provisioned DBs par inme se koi table missing ho sakti hai — aur
 * tab student batch routes 500 deti hain (MySQL me LEFT JOIN wali
 * missing table bhi 1146 error deti hai, join hone se nahi bachata):
 * - student/batches/[id]/today (BatchSchedule + Subjects +
 *   TeacherProfiles + LiveClasses) — "Aaj Ki Classes" ki neev;
 * - student/batches/[id]/schedule (BatchSchedule + Subjects +
 *   TeacherProfiles + Batches + Courses);
 * - student/batches/[id]/upcoming (BatchSchedule + Subjects +
 *   TeacherProfiles) — 7 din tak har din ek query.
 * Ye helper (ensure-live-class-schema.ts jaisa pattern) teeno tables
 * ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath). Ye KABHI throw nahi karta:
 * DDL permission na ho to false, route phir bhi apna honest error dega.
 *
 * Jaan-boojh kar is file me NAHI (duplicate DDL se bachne ke liye,
 * ensure-analytics-schema.ts ke scope note jaisa):
 * - Subjects / Courses: unka CREATE pehle se
 *   ensure-analytics-schema.ts me hai — batch routes wahi ensure
 *   bhi call karte hain, is file me dobara DDL nahi banaya.
 * - LiveClasses: uska CREATE pehle se ensure-live-class-schema.ts
 *   me hai — today route wahi ensure bhi call karta hai.
 * - Admin batches list (SELECT * FROM Batches): wahi Batches table
 *   hai, par wo route db.ts-style seedha query karta hai aur is run
 *   ka scope student timetable routes hai; Batches ka ensure yahan
 *   hone se wo route bhi agle wiring par isi ka fayda utha sakta hai.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): purani rows wali table par NOT NULL ADD fail
 *   ho sakta hai, aur heal ko strict schema nahi banana.
 * - Maujood table par UNIQUE key dobara nahi jodi jaati (pehle se
 *   maujood duplicate rows hon to fail hoga) — DDL (nayi table) me
 *   UNIQUE keys canonical jaisi hi hain.
 * - Routes sirf padhte hain (koi INSERT/UPDATE nahi), isliye
 *   canonical ENUM values (lectureType, Batches.status,
 *   TeacherProfiles.status) CREATE me waise hi rakhe hain; padhne
 *   par ENUM kabhi hard 500 nahi deta.
 */
let cache: Promise<boolean> | null = null;

const DDL_BATCH_SCHEDULE = `CREATE TABLE IF NOT EXISTS BatchSchedule (
  id VARCHAR(36) PRIMARY KEY,
  batchId VARCHAR(36) NOT NULL,
  dayOfWeek TINYINT NOT NULL,
  startTime TIME NOT NULL,
  endTime TIME NOT NULL,
  subjectId VARCHAR(36) DEFAULT NULL,
  teacherId VARCHAR(36) DEFAULT NULL,
  lectureType ENUM('LECTURE', 'DOUBT', 'TEST', 'REVISION') DEFAULT 'LECTURE',
  isActive TINYINT(1) DEFAULT 1,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_schedule_batch (batchId),
  INDEX idx_schedule_day (dayOfWeek)
)`;

const DDL_TEACHER_PROFILES = `CREATE TABLE IF NOT EXISTS TeacherProfiles (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) DEFAULT NULL,
  phone VARCHAR(20) DEFAULT NULL,
  photoUrl VARCHAR(500) DEFAULT NULL,
  bio TEXT DEFAULT NULL,
  qualification VARCHAR(255) DEFAULT NULL,
  experienceYears INT DEFAULT 0,
  slug VARCHAR(255) UNIQUE DEFAULT NULL,
  subjects JSON DEFAULT NULL,
  status ENUM('pending_setup', 'active', 'suspended', 'deactivated') DEFAULT 'active',
  phoneVerified BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE,
  lastLoginAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_slug (slug)
)`;

const DDL_BATCHES = `CREATE TABLE IF NOT EXISTS Batches (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  teacherId VARCHAR(36) DEFAULT NULL,
  name VARCHAR(255) NOT NULL,
  startDate DATETIME DEFAULT NULL,
  endDate DATETIME DEFAULT NULL,
  status ENUM('UPCOMING', 'ACTIVE', 'COMPLETED') DEFAULT 'UPCOMING',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_status (status)
)`;

/** Table -> route-critical columns (maujood table par ADD ke liye). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  BatchSchedule: [
    ['id', 'VARCHAR(36)'],
    ['batchId', 'VARCHAR(36)'],
    ['dayOfWeek', 'TINYINT'],
    ['startTime', 'TIME'],
    ['endTime', 'TIME'],
    ['subjectId', 'VARCHAR(36)'],
    ['teacherId', 'VARCHAR(36)'],
    ['lectureType', "ENUM('LECTURE', 'DOUBT', 'TEST', 'REVISION')"],
    ['isActive', 'TINYINT(1) DEFAULT 1'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  TeacherProfiles: [
    ['id', 'VARCHAR(36)'],
    ['userId', 'VARCHAR(36)'],
    ['name', 'VARCHAR(255)'],
    ['email', 'VARCHAR(255)'],
    ['phone', 'VARCHAR(20)'],
    ['photoUrl', 'VARCHAR(500)'],
    ['bio', 'TEXT'],
    ['qualification', 'VARCHAR(255)'],
    ['experienceYears', 'INT DEFAULT 0'],
    ['slug', 'VARCHAR(255)'],
    ['subjects', 'JSON'],
    ['status', "ENUM('pending_setup', 'active', 'suspended', 'deactivated')"],
    ['phoneVerified', 'BOOLEAN DEFAULT FALSE'],
    ['emailVerified', 'BOOLEAN DEFAULT FALSE'],
    ['lastLoginAt', 'DATETIME'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME'],
  ],
  Batches: [
    ['id', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['teacherId', 'VARCHAR(36)'],
    ['name', 'VARCHAR(255)'],
    ['startDate', 'DATETIME'],
    ['endDate', 'DATETIME'],
    ['status', "ENUM('UPCOMING', 'ACTIVE', 'COMPLETED')"],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME'],
  ],
};

const DDLS: [string, string][] = [
  ['BatchSchedule', DDL_BATCH_SCHEDULE],
  ['TeacherProfiles', DDL_TEACHER_PROFILES],
  ['Batches', DDL_BATCHES],
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
    for (const [table, ddl] of DDLS) {
      if (!(await tableExists(table))) {
        await mysqlPool.query(ddl);
        console.log(`[batch-schedule-schema] created missing table ${table}`);
      }
      for (const [col, colDdl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${colDdl}`);
          console.log(`[batch-schedule-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[batch-schedule-schema] batch schedule tables unavailable:', e?.message);
    return false;
  }
}

/** True jab BatchSchedule + TeacherProfiles + Batches + route-critical columns maujood hon. */
export function ensureBatchScheduleSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

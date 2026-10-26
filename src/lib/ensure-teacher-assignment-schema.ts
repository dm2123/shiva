import { mysqlPool } from '@/lib/db';

/**
 * Teacher-course assignments — TeacherCourseAssignments table.
 *
 * Canonical definition init_db_full.sql me hai (TEACHER & ENROLLMENT
 * section), lekin purane provisioned DBs par ye table missing ho sakti
 * hai — aur tab is table ko poochne wale routes 500 dete hain (MySQL
 * me LEFT JOIN wali missing table bhi 1146 error deti hai):
 * - admin/teachers/assignments GET (TCA + TeacherProfiles + Courses
 *   joins) aur POST (assignTeacherToCourse → db.ts INSERT; duplicate
 *   check wala helper error swallow karke false deta hai, isliye bina
 *   ensure ke INSERT 1146 par 500 deta);
 * - admin/batches POST (Batches INSERT ke baad TCA INSERT — batch ban
 *   jaata, assignment fail ho jaata, 500);
 * - student/doubts POST (getCourseTeacherId — doubt banne se pehle
 *   hi 500);
 * - teacher/doubts GET + PATCH (getTeacherCourseIds — teacher ka
 *   inbox khaali hone ke bajay 500; khaali table par honest empty
 *   hi sahi jawab hai).
 * Ye helper (ensure-batch-schedule-schema.ts jaisa pattern) table ko
 * idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho
 * to false, route phir bhi apna honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): purani rows wali table par NOT NULL ADD fail
 *   ho sakta hai, aur heal ko strict schema nahi banana.
 * - Maujood table par UNIQUE key dobara nahi jodi jaati (pehle se
 *   maujood duplicate rows hon to fail hoga) — DDL (nayi table) me
 *   UNIQUE key canonical jaisi hi hai, isliye duplicate assignment
 *   par bhi DB-level guard barkarar rehta hai.
 * - db.ts ke helpers (create/get/isAssigned) me wiring jaan-boojh
 *   kar nahi ki (db <-> ensure circular import hota; codebase me
 *   ensures routes me hi lagte hain) — isliye har TCA-consuming
 *   route handler me ye ensure auth ke baad call hota hai.
 */
let cache: Promise<boolean> | null = null;

const DDL_TEACHER_COURSE_ASSIGNMENTS = `CREATE TABLE IF NOT EXISTS TeacherCourseAssignments (
  id VARCHAR(36) PRIMARY KEY,
  teacherId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  assignedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_teacher_course (teacherId, courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_courseId (courseId)
)`;

/** Route/helpers ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['id', 'VARCHAR(36)'],
  ['teacherId', 'VARCHAR(36)'],
  ['courseId', 'VARCHAR(36)'],
  ['assignedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
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
    if (!(await tableExists('TeacherCourseAssignments'))) {
      await mysqlPool.query(DDL_TEACHER_COURSE_ASSIGNMENTS);
      console.log('[teacher-assignment-schema] created missing table TeacherCourseAssignments');
    }
    for (const [col, colDdl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('TeacherCourseAssignments', col))) {
        await mysqlPool.query(`ALTER TABLE TeacherCourseAssignments ADD COLUMN ${col} ${colDdl}`);
        console.log(`[teacher-assignment-schema] added missing column TeacherCourseAssignments.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[teacher-assignment-schema] teacher assignment table unavailable:', e?.message);
    return false;
  }
}

/** True jab TeacherCourseAssignments + route-critical columns maujood hon. */
export function ensureTeacherAssignmentSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

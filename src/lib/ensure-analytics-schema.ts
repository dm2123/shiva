import { mysqlPool } from '@/lib/db';

/**
 * Analytics — Courses / Subjects / Chapters / Lectures /
 * StudentEnrollments / Assessments / AssessmentAttempts / LectureNotes.
 *
 * Canonical definitions init_db_full.sql (aur LectureNotes ke liye
 * schema_updates.sql) me hain, lekin purane provisioned DBs par inme
 * se koi table missing ho sakti hai — analytics ke chaaron routes
 * (overview, trends, subject-wise, weakness) par ab tak koi self-heal
 * nahi tha, isliye Progress Report / subject bars / trends wala
 * student khaali DB par 500 dekhta tha, honest empty ke bajay. Ye
 * helper (ensure-gamification-schema.ts jaisa pattern) aathon tables
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho
 * to false, route phir bhi honest error dega.
 *
 * Scope note (jaan-boojh kar nahi chheda):
 * - StudentXP / DailyStreaks / LeaderboardCache overview me bhi
 *   chalte hain, par unka ensure pehle se ensure-gamification-schema
 *   me hai — overview/trends routes use wahi call karte hain, is
 *   file me duplicate DDL nahi banaya.
 * - Doubts overview me chalta hai, uska ensure pehle se
 *   ensure-doubts-schema me hai — overview route use wahi call karta
 *   hai.
 * - Subject-wise / weakness queries ka attempt→subject attribution
 *   abhi bhi course-level hai (Assessments me subjectId column hi
 *   nahi hai, sirf courseId) — is file se query semantics nahi
 *   badli; subject-level attribution ke liye response/question
 *   level ka design chahiye, wo alag kaam hai.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - status/type VARCHAR (ENUM ki jagah): ENUM unknown value par hard
 *   500 deta; routes wahi values bhejte hain jo canonical ENUM me
 *   hain, par nayi value aane par bhi route na toote.
 * - Sirf wahi columns jo chaaron analytics routes use karte hain,
 *   plus CREATE par likhne layak basic columns (taaki khaali table
 *   par aage ka writer na toote).
 */
let cache: Promise<boolean> | null = null;

const DDL_COURSES = `CREATE TABLE IF NOT EXISTS Courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'DRAFT',
  isPublished BOOLEAN DEFAULT FALSE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courses_status (status)
)`;

const DDL_SUBJECTS = `CREATE TABLE IF NOT EXISTS Subjects (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(50) DEFAULT NULL,
  description TEXT DEFAULT NULL,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_subjects_course (courseId),
  INDEX idx_subjects_sort (sortOrder)
)`;

const DDL_CHAPTERS = `CREATE TABLE IF NOT EXISTS Chapters (
  id VARCHAR(36) PRIMARY KEY,
  subjectId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chapters_subject (subjectId),
  INDEX idx_chapters_sort (sortOrder)
)`;

const DDL_LECTURES = `CREATE TABLE IF NOT EXISTS Lectures (
  id VARCHAR(36) PRIMARY KEY,
  chapterId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  videoUrl VARCHAR(500) DEFAULT NULL,
  durationSeconds INT DEFAULT 0,
  isPreviewable BOOLEAN DEFAULT FALSE,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_lectures_chapter (chapterId),
  INDEX idx_lectures_sort (sortOrder)
)`;

const DDL_ENROLLMENTS = `CREATE TABLE IF NOT EXISTS StudentEnrollments (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  batchId VARCHAR(36) DEFAULT NULL,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_enroll_student (studentId),
  INDEX idx_enroll_course (courseId)
)`;

const DDL_ASSESSMENTS = `CREATE TABLE IF NOT EXISTS Assessments (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  type VARCHAR(20) DEFAULT 'PRACTICE',
  totalMarks DECIMAL(10, 2) DEFAULT 100.00,
  passingMarks DECIMAL(10, 2) DEFAULT NULL,
  startTime DATETIME DEFAULT NULL,
  endTime DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_assessments_course (courseId),
  INDEX idx_assessments_type (type)
)`;

const DDL_ATTEMPTS = `CREATE TABLE IF NOT EXISTS AssessmentAttempts (
  id VARCHAR(36) PRIMARY KEY,
  assessmentId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  score DECIMAL(10, 2) DEFAULT 0.00,
  status VARCHAR(20) DEFAULT 'STARTED',
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_attempts_assessment (assessmentId),
  INDEX idx_attempts_student (studentId),
  INDEX idx_attempts_status (status)
)`;

const DDL_LECTURE_NOTES = `CREATE TABLE IF NOT EXISTS LectureNotes (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  content TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_notes_lecture (lectureId),
  INDEX idx_notes_student (studentId)
)`;

/** Route ke filters/select ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  Courses: [
    ['id', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
  ],
  Subjects: [
    ['id', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['name', 'VARCHAR(255)'],
  ],
  Chapters: [
    ['id', 'VARCHAR(36)'],
    ['subjectId', 'VARCHAR(36)'],
  ],
  Lectures: [
    ['id', 'VARCHAR(36)'],
    ['chapterId', 'VARCHAR(36)'],
  ],
  StudentEnrollments: [
    ['studentId', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
  ],
  Assessments: [
    ['id', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
  ],
  AssessmentAttempts: [
    ['id', 'VARCHAR(36)'],
    ['assessmentId', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
    ['score', 'DECIMAL(10, 2) DEFAULT 0.00'],
    ['completedAt', 'DATETIME DEFAULT NULL'],
  ],
  LectureNotes: [
    ['lectureId', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
  ],
};

const DDL_BY_TABLE: Record<string, string> = {
  Courses: DDL_COURSES,
  Subjects: DDL_SUBJECTS,
  Chapters: DDL_CHAPTERS,
  Lectures: DDL_LECTURES,
  StudentEnrollments: DDL_ENROLLMENTS,
  Assessments: DDL_ASSESSMENTS,
  AssessmentAttempts: DDL_ATTEMPTS,
  LectureNotes: DDL_LECTURE_NOTES,
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

async function ensure(): Promise<boolean> {
  try {
    for (const table of Object.keys(DDL_BY_TABLE)) {
      if (!(await tableExists(table))) {
        await mysqlPool.query(DDL_BY_TABLE[table]);
        console.log(`[analytics-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[analytics-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[analytics-schema] Analytics tables unavailable:', e?.message);
    return false;
  }
}

/** True jab analytics ke aathon tables + route-critical columns maujood hon. */
export function ensureAnalyticsSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

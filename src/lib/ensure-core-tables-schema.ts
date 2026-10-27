import { mysqlPool } from '@/lib/db';

/**
 * Core tables — Courses / StudentEnrollments / Users (core-tables leg).
 *
 * Ab tak koi ensure in teen tables ko banata nahi tha: ensure-course-
 * schema.ts sirf maujood Courses table par language/validityMonths/
 * targetAudience columns jodta hai (missing table par ALTER fail hokar
 * chupchaap false deta hai), aur ensure-google-schema.ts sirf maujood
 * Users table par google columns jodta hai. Isliye purane DB par admin
 * educators page (JOIN Users, subqueries par Courses +
 * StudentEnrollments) aur admin live-classes page (LEFT JOIN Courses,
 * TCA subquery par Users, teachers list FROM Users) 1146 par 500 dete
 * the — TCA/TeacherProfiles legs (12:30 run tak) ke baad bhi ye teen
 * tables hi aakhri missing leg the.
 *
 * Ye helper (ensure-student-profile-schema.ts jaisa pattern) teeno
 * tables ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath) aur maujood table me route-
 * critical columns jodta hai. Ye KABHI throw nahi karta: DDL
 * permission na ho to false, page phir bhi apna honest error dega.
 *
 * Do deliberate deviations canonical SQL (init_db_full.sql) se
 * (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema
 *   par depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): purani rows wali table par NOT NULL ADD fail
 *   ho sakta hai.
 * - Maujood table par UNIQUE key / index dobara nahi joda jaata
 *   (pehle se maujood duplicate rows hon to fail hoga) — DDL (nayi
 *   table) me UNIQUE key canonical jaisi hi hai.
 * - Users ke fresh CREATE me Google columns (authProvider/googleId/
 *   avatarUrl) bhi hain — ye canonical init_db_full.sql se baad ke
 *   hain, lekin Google login route unhe SELECT karta hai, isliye
 *   nayi table par wo leg bhi poora rehta hai.
 * - db.ts ke helpers me wiring jaan-boojh kar nahi ki (db <-> ensure
 *   circular import hota; codebase me ensures routes/pages me hi
 *   lagte hain).
 */
let cache: Promise<boolean> | null = null;

const DDL_USERS = `CREATE TABLE IF NOT EXISTS Users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('STUDENT', 'TEACHER', 'ADMIN') NOT NULL,
  status ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED') DEFAULT 'ACTIVE',
  phone VARCHAR(20) UNIQUE DEFAULT NULL,
  phoneVerified BOOLEAN DEFAULT FALSE,
  emailVerified BOOLEAN DEFAULT FALSE,
  passwordResetToken VARCHAR(255) DEFAULT NULL,
  passwordResetExpiresAt DATETIME DEFAULT NULL,
  lastLoginAt DATETIME DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  authProvider VARCHAR(32) DEFAULT NULL,
  googleId VARCHAR(64) DEFAULT NULL,
  avatarUrl VARCHAR(500) DEFAULT NULL,
  INDEX idx_email (email),
  INDEX idx_phone (phone),
  INDEX idx_role (role),
  INDEX idx_google_id (googleId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_COURSES = `CREATE TABLE IF NOT EXISTS Courses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  description TEXT DEFAULT NULL,
  thumbnailUrl VARCHAR(500) DEFAULT NULL,
  price DECIMAL(10, 2) DEFAULT 0.00,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  isPublished BOOLEAN DEFAULT FALSE,
  educatorId VARCHAR(36) DEFAULT NULL,
  language VARCHAR(60) DEFAULT NULL,
  validityMonths INT DEFAULT NULL,
  targetAudience TEXT DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_slug (slug),
  INDEX idx_status (status),
  INDEX idx_isPublished (isPublished)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_ENROLLMENTS = `CREATE TABLE IF NOT EXISTS StudentEnrollments (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  batchId VARCHAR(36) DEFAULT NULL,
  status ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE',
  enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_student_course (studentId, courseId),
  INDEX idx_studentId (studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_batchId (batchId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

/** Table -> [column, nullable ADD definition] (UNIQUE/index dobara nahi). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  Users: [
    ['id', 'VARCHAR(36)'],
    ['email', 'VARCHAR(255)'],
    ['password', 'VARCHAR(255)'],
    ['role', "ENUM('STUDENT', 'TEACHER', 'ADMIN')"],
    ['status', "ENUM('ACTIVE', 'SUSPENDED', 'DEACTIVATED') DEFAULT 'ACTIVE'"],
    ['phone', 'VARCHAR(20)'],
    ['phoneVerified', 'BOOLEAN DEFAULT FALSE'],
    ['emailVerified', 'BOOLEAN DEFAULT FALSE'],
    ['passwordResetToken', 'VARCHAR(255)'],
    ['passwordResetExpiresAt', 'DATETIME'],
    ['lastLoginAt', 'DATETIME'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
    ['authProvider', 'VARCHAR(32)'],
    ['googleId', 'VARCHAR(64)'],
    ['avatarUrl', 'VARCHAR(500)'],
  ],
  Courses: [
    ['id', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
    ['slug', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['thumbnailUrl', 'VARCHAR(500)'],
    ['price', 'DECIMAL(10, 2) DEFAULT 0.00'],
    ['status', "ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT'"],
    ['isPublished', 'BOOLEAN DEFAULT FALSE'],
    ['educatorId', 'VARCHAR(36)'],
    ['language', 'VARCHAR(60)'],
    ['validityMonths', 'INT'],
    ['targetAudience', 'TEXT'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ],
  StudentEnrollments: [
    ['id', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['batchId', 'VARCHAR(36)'],
    ['status', "ENUM('ACTIVE', 'COMPLETED', 'CANCELLED') DEFAULT 'ACTIVE'"],
    ['enrolledAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
};

const TABLE_DDL: Record<string, string> = {
  Users: DDL_USERS,
  Courses: DDL_COURSES,
  StudentEnrollments: DDL_ENROLLMENTS,
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
    for (const table of Object.keys(TABLE_DDL)) {
      if (!(await tableExists(table))) {
        await mysqlPool.query(TABLE_DDL[table]);
        console.log(`[core-tables-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[core-tables-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[core-tables-schema] core tables unavailable:', e?.message);
    return false;
  }
}

/** True jab Courses + StudentEnrollments + Users (+ route-critical columns) maujood hon. */
export function ensureCoreTablesSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

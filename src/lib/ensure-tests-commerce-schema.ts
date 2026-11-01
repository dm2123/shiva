import { mysqlPool } from '@/lib/db';

/**
 * Tests / AssessmentResponses / Orders / AuditLogs — tests-commerce leg.
 *
 * Ab tak koi ensure in chaar tables ko banata nahi tha: ensure-test-
 * schema.ts sirf maujood Tests table par type/category columns jodta
 * hai (missing table par ALTER fail hokar chupchaap false deta hai),
 * aur ensure-analytics-schema.ts Assessments + AssessmentAttempts to
 * banata hai par AssessmentResponses nahi. Isliye purane DB par admin
 * tests page (FROM Tests, subqueries par AssessmentAttempts +
 * AssessmentResponses, LEFT JOIN Courses) aur admin analytics page
 * (Orders revenue/monthly trend, Tests count, AuditLogs count) 1146
 * par 500 dete the — baaki saari legs (analytics/core/student-
 * profile/batch-schedule/doubts/live-class) ke baad bhi ye chaar
 * tables hi aakhri missing leg the.
 *
 * Ye helper (ensure-core-tables-schema.ts jaisa pattern) chaaron
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
 * - Tests ke fresh CREATE me type/category columns bhi hain — ye
 *   canonical init_db_full.sql se baad ke hain, lekin test-schema
 *   ensure unhe maujood table par jodta hai; nayi table par wo leg
 *   bhi poora rehta hai (column check unhe paakar skip karega).
 * - db.ts ke helpers me wiring jaan-boojh kar nahi ki (db <-> ensure
 *   circular import hota; codebase me ensures routes/pages me hi
 *   lagte hain).
 */
let cache: Promise<boolean> | null = null;

const DDL_TESTS = `CREATE TABLE IF NOT EXISTS Tests (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  courseId VARCHAR(36) NOT NULL,
  durationMinutes INT DEFAULT 60,
  totalMarks DECIMAL(10, 2) DEFAULT 100.00,
  passingMarks DECIMAL(10, 2) DEFAULT NULL,
  status ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT',
  type VARCHAR(20) DEFAULT NULL,
  category VARCHAR(60) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_RESPONSES = `CREATE TABLE IF NOT EXISTS AssessmentResponses (
  id VARCHAR(36) PRIMARY KEY,
  attemptId VARCHAR(36) NOT NULL,
  questionId VARCHAR(36) NOT NULL,
  selectedOptionId VARCHAR(36) DEFAULT NULL,
  answerText TEXT DEFAULT NULL,
  isCorrect BOOLEAN DEFAULT NULL,
  marksObtained DECIMAL(5, 2) DEFAULT 0.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_attemptId (attemptId),
  INDEX idx_questionId (questionId)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_ORDERS = `CREATE TABLE IF NOT EXISTS Orders (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  courseId VARCHAR(36) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING',
  paymentId VARCHAR(255) DEFAULT NULL,
  paymentMethod VARCHAR(50) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_studentId (studentId),
  INDEX idx_courseId (courseId),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

const DDL_AUDIT_LOGS = `CREATE TABLE IF NOT EXISTS AuditLogs (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  userId VARCHAR(36) DEFAULT NULL,
  action VARCHAR(100) NOT NULL,
  entity VARCHAR(100) NOT NULL,
  entityId VARCHAR(36) DEFAULT NULL,
  details JSON DEFAULT NULL,
  ipAddress VARCHAR(45) DEFAULT NULL,
  userAgent VARCHAR(500) DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_userId (userId),
  INDEX idx_entity (entity),
  INDEX idx_createdAt (createdAt)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`;

/** Table -> [column, nullable ADD definition] (UNIQUE/index dobara nahi). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  Tests: [
    ['id', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['courseId', 'VARCHAR(36)'],
    ['durationMinutes', 'INT DEFAULT 60'],
    ['totalMarks', 'DECIMAL(10, 2) DEFAULT 100.00'],
    ['passingMarks', 'DECIMAL(10, 2)'],
    ['status', "ENUM('DRAFT', 'PUBLISHED', 'ARCHIVED') DEFAULT 'DRAFT'"],
    ['type', 'VARCHAR(20)'],
    ['category', 'VARCHAR(60)'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ],
  AssessmentResponses: [
    ['id', 'VARCHAR(36)'],
    ['attemptId', 'VARCHAR(36)'],
    ['questionId', 'VARCHAR(36)'],
    ['selectedOptionId', 'VARCHAR(36)'],
    ['answerText', 'TEXT'],
    ['isCorrect', 'BOOLEAN'],
    ['marksObtained', 'DECIMAL(5, 2) DEFAULT 0.00'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ],
  Orders: [
    ['id', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
    ['courseId', 'VARCHAR(36)'],
    ['amount', 'DECIMAL(10, 2)'],
    ['status', "ENUM('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'PENDING'"],
    ['paymentId', 'VARCHAR(255)'],
    ['paymentMethod', 'VARCHAR(50)'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
  ],
  AuditLogs: [
    ['id', 'BIGINT'],
    ['userId', 'VARCHAR(36)'],
    ['action', 'VARCHAR(100)'],
    ['entity', 'VARCHAR(100)'],
    ['entityId', 'VARCHAR(36)'],
    ['details', 'JSON'],
    ['ipAddress', 'VARCHAR(45)'],
    ['userAgent', 'VARCHAR(500)'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
};

const TABLE_DDL: Record<string, string> = {
  Tests: DDL_TESTS,
  AssessmentResponses: DDL_RESPONSES,
  Orders: DDL_ORDERS,
  AuditLogs: DDL_AUDIT_LOGS,
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
        console.log(`[tests-commerce-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[tests-commerce-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[tests-commerce-schema] tests/commerce tables unavailable:', e?.message);
    return false;
  }
}

/** True jab Tests + AssessmentResponses + Orders + AuditLogs (+ route-critical columns) maujood hon. */
export function ensureTestsCommerceSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

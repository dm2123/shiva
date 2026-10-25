import { mysqlPool } from '@/lib/db';

/**
 * Study Plans — AiStudyPlans + AiStudyPlanTasks tables.
 *
 * Canonical definitions schema_ai_features.sql me hain, lekin purane
 * provisioned DBs par ye tables missing ho sakti hain (ebooks/formula/
 * pyq/bookmarks/question-bank ke liye bhi yahi hua tha — isliye ensure-*
 * pattern bana) → /api/student/study-plan tab 500 deta, chahe student
 * ne plan banaya ho ya nahi. Web ka StudyPlanGenerator isi route par
 * chalta hai (POST → GET list → GET [planId] → PATCH toggle).
 * Ye helper (ensure-question-bank-schema.ts jaisa pattern) dono tables
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to
 * false, route phir bhi honest error dega.
 *
 * Doosra bug jo is file ke saath theek hota hai: study-plan POST
 * AiStudyPlans/AiStudyPlanTasks me bina id ke INSERT karta tha, jabki
 * canonical schema me id VARCHAR(36) PRIMARY KEY hai (koi default
 * nahi). Strict-mode MySQL par INSERT 1364 par fail hota, aur
 * non-strict par bhi planId ke liye insertId hamesha 0 milta — web
 * phir /study-plan/0 kholta aur 404 pata. Route ab crypto.randomUUID()
 * se plan + har task ki id banata hai aur wahi planId wapas deta hai,
 * taaki POST ke turant baad detail GET wahi plan khole.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - status/taskType VARCHAR (ENUM ki jagah): ENUM unknown value par
 *   hard 500 deta; route 'ACTIVE'/'STUDY' bhejta hai jo canonical ENUM
 *   me hain, par naye taskType aane par bhi route na toote.
 * - Sirf wahi columns jo study-plan routes use karte hain.
 */
let cache: Promise<boolean> | null = null;

const DDL_PLANS = `CREATE TABLE IF NOT EXISTS AiStudyPlans (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  targetExam VARCHAR(100),
  targetDate DATE,
  planData JSON,
  status VARCHAR(20) DEFAULT 'ACTIVE',
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_plan_student (studentId)
)`;

const DDL_TASKS = `CREATE TABLE IF NOT EXISTS AiStudyPlanTasks (
  id VARCHAR(36) PRIMARY KEY,
  planId VARCHAR(36) NOT NULL,
  dayNumber INT NOT NULL,
  subject VARCHAR(100),
  topic VARCHAR(255),
  taskType VARCHAR(20) DEFAULT 'STUDY',
  durationMinutes INT DEFAULT 60,
  completed TINYINT(1) DEFAULT 0,
  completedAt DATETIME,
  INDEX idx_task_plan (planId)
)`;

/** Route ke filters/select ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  AiStudyPlans: [
    ['studentId', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
    ['targetExam', 'VARCHAR(100)'],
    ['targetDate', 'DATE'],
    ['planData', 'JSON'],
    ['status', "VARCHAR(20) DEFAULT 'ACTIVE'"],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  AiStudyPlanTasks: [
    ['planId', 'VARCHAR(36)'],
    ['dayNumber', 'INT'],
    ['subject', 'VARCHAR(100)'],
    ['topic', 'VARCHAR(255)'],
    ['taskType', "VARCHAR(20) DEFAULT 'STUDY'"],
    ['durationMinutes', 'INT DEFAULT 60'],
    ['completed', 'TINYINT(1) DEFAULT 0'],
    ['completedAt', 'DATETIME'],
  ],
};

const DDL_BY_TABLE: Record<string, string> = {
  AiStudyPlans: DDL_PLANS,
  AiStudyPlanTasks: DDL_TASKS,
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
        console.log(`[study-plan-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[study-plan-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[study-plan-schema] StudyPlan unavailable:', e?.message);
    return false;
  }
}

/** True jab AiStudyPlans + AiStudyPlanTasks + route-critical columns maujood hon. */
export function ensureStudyPlanSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

import { mysqlPool } from '@/lib/db';

/**
 * Live classes — LiveClasses + interaction tables.
 *
 * Canonical definitions alag-alag schema files me bikhri hain
 * (LiveClasses: init_db_full.sql; LiveClassMessages / LiveClassPolls /
 * LiveClassPollResponses: schema_updates.sql; LiveClassAttendance:
 * schema_ai_features.sql), lekin purane provisioned DBs par ye tables
 * missing ho sakti hain — aur tab raw-SQL wali routes 500 deti hain:
 * - student/teacher chat (LiveClassMessages) GET + POST;
 * - student/teacher polls (LiveClassPolls + LiveClassPollResponses)
 *   GET + POST, vote POST;
 * - student attendance (LiveClassAttendance) GET + POST — is route me
 *   try/catch bhi nahi hai, isliye unhandled 500;
 * - admin live-classes (LiveClasses) GET + POST + PATCH + DELETE;
 * - teacher live-classes POST (createLiveClassDb throw karta hai);
 * - student hand-raise POST — ye sirf missing table par hi nahi,
 *   CANONICAL schema par bhi toot-ta hai: hand-raise route
 *   `LiveClasses.handRaises` SELECT/UPDATE karta hai, lekin ye column
 *   repo ki kisi bhi .sql file me hai hi nahi.
 * Ye helper (ensure-lecture-progress-schema.ts jaisa pattern) saari
 * 5 tables ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath). Ye KABHI throw nahi karta:
 * DDL permission na ho to false, route phir bhi apna honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - Maujood table par column ADD hamesha nullable type se hota hai
 *   (NOT NULL nahi): JSON column par NOT NULL ADD purani rows wali
 *   table par fail hota hai, aur heal ko strict schema nahi banana.
 * - handRaises JSON: route `JSON.parse(... || '[]')` karta hai, isliye
 *   NULL (default) theek hai; DDL me bhi isi liye shamil hai taaki
 *   nayi aur healed DBs ek jaisi rahen.
 * - Maujood table par UNIQUE key dobara nahi jodi jaati (pehle se
 *   maujood duplicate rows hon to fail hoga) — DDL (nayi table) me
 *   UNIQUE keys canonical jaisi hi hain.
 *
 * Jaan-boojh kar NAHI wired:
 * - student live-classes list GET: db.ts ke listLiveClassesDb /
 *   getStudentEnrollmentsByStudentIdDb errors ko swallow karke [] dete
 *   hain — table missing par bhi 500 nahi, honest empty hi milta hai.
 * - teacher live-classes GET: wahi swallowing; uska profile lookup
 *   (TeacherProfiles) alag family hai, is ensure se cover nahi.
 * - batches/[id]/today: LiveClasses ke alawa BatchSchedule / Subjects /
 *   TeacherProfiles bhi poochta hai (wo families abhi uncovered hain),
 *   isliye aadha fix daalkar "safe" ka daava nahi karna.
 * - db.ts helpers: ensure wiring routes me hi hoti hai (db <-> ensure
 *   circular import banta), isliye helpers me wiring nahi ki.
 */
let cache: Promise<boolean> | null = null;

const DDL_LIVE_CLASSES = `CREATE TABLE IF NOT EXISTS LiveClasses (
  id VARCHAR(36) PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT DEFAULT NULL,
  courseId VARCHAR(36) DEFAULT NULL,
  subjectId VARCHAR(36) DEFAULT NULL,
  chapterId VARCHAR(36) DEFAULT NULL,
  batchId VARCHAR(36) DEFAULT NULL,
  teacherId VARCHAR(36) DEFAULT NULL,
  startTime DATETIME NOT NULL,
  endTime DATETIME DEFAULT NULL,
  actualStartedAt DATETIME DEFAULT NULL,
  actualEndedAt DATETIME DEFAULT NULL,
  status ENUM('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED') DEFAULT 'SCHEDULED',
  meetingUrl VARCHAR(500) DEFAULT NULL,
  recordingUrl VARCHAR(500) DEFAULT NULL,
  handRaises JSON DEFAULT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_courseId (courseId),
  INDEX idx_teacherId (teacherId),
  INDEX idx_status (status),
  INDEX idx_startTime (startTime)
)`;

const DDL_LIVE_CLASS_MESSAGES = `CREATE TABLE IF NOT EXISTS LiveClassMessages (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  message TEXT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_liveClassId (liveClassId),
  INDEX idx_createdAt (createdAt)
)`;

const DDL_LIVE_CLASS_POLLS = `CREATE TABLE IF NOT EXISTS LiveClassPolls (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  question TEXT NOT NULL,
  options JSON NOT NULL,
  createdBy VARCHAR(36) NOT NULL,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_liveClassId (liveClassId)
)`;

const DDL_LIVE_CLASS_POLL_RESPONSES = `CREATE TABLE IF NOT EXISTS LiveClassPollResponses (
  id VARCHAR(36) PRIMARY KEY,
  pollId VARCHAR(36) NOT NULL,
  userId VARCHAR(36) NOT NULL,
  selectedOption INT NOT NULL,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_poll_user (pollId, userId),
  INDEX idx_pollId (pollId)
)`;

const DDL_LIVE_CLASS_ATTENDANCE = `CREATE TABLE IF NOT EXISTS LiveClassAttendance (
  id VARCHAR(36) PRIMARY KEY,
  liveClassId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  joinedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  leftAt DATETIME DEFAULT NULL,
  durationMinutes INT DEFAULT 0,
  cameraOn TINYINT(1) DEFAULT 0,
  UNIQUE KEY unique_attendance (liveClassId, studentId),
  INDEX idx_liveClassId (liveClassId),
  INDEX idx_studentId (studentId)
)`;

/** Table -> route-critical columns (maujood table par ADD ke liye). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  LiveClasses: [
    ['id', 'VARCHAR(36)'],
    ['title', 'VARCHAR(255)'],
    ['description', 'TEXT'],
    ['courseId', 'VARCHAR(36)'],
    ['subjectId', 'VARCHAR(36)'],
    ['chapterId', 'VARCHAR(36)'],
    ['batchId', 'VARCHAR(36)'],
    ['teacherId', 'VARCHAR(36)'],
    ['startTime', 'DATETIME'],
    ['endTime', 'DATETIME'],
    ['actualStartedAt', 'DATETIME'],
    ['actualEndedAt', 'DATETIME'],
    ['status', "ENUM('SCHEDULED', 'LIVE', 'ENDED', 'CANCELLED')"],
    ['meetingUrl', 'VARCHAR(500)'],
    ['recordingUrl', 'VARCHAR(500)'],
    ['handRaises', 'JSON'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['updatedAt', 'DATETIME'],
  ],
  LiveClassMessages: [
    ['id', 'VARCHAR(36)'],
    ['liveClassId', 'VARCHAR(36)'],
    ['userId', 'VARCHAR(36)'],
    ['message', 'TEXT'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  LiveClassPolls: [
    ['id', 'VARCHAR(36)'],
    ['liveClassId', 'VARCHAR(36)'],
    ['question', 'TEXT'],
    ['options', 'JSON'],
    ['createdBy', 'VARCHAR(36)'],
    ['isActive', 'BOOLEAN DEFAULT TRUE'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  LiveClassPollResponses: [
    ['id', 'VARCHAR(36)'],
    ['pollId', 'VARCHAR(36)'],
    ['userId', 'VARCHAR(36)'],
    ['selectedOption', 'INT'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  LiveClassAttendance: [
    ['id', 'VARCHAR(36)'],
    ['liveClassId', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
    ['joinedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
    ['leftAt', 'DATETIME'],
    ['durationMinutes', 'INT DEFAULT 0'],
    ['cameraOn', 'TINYINT(1) DEFAULT 0'],
  ],
};

const DDLS: [string, string][] = [
  ['LiveClasses', DDL_LIVE_CLASSES],
  ['LiveClassMessages', DDL_LIVE_CLASS_MESSAGES],
  ['LiveClassPolls', DDL_LIVE_CLASS_POLLS],
  ['LiveClassPollResponses', DDL_LIVE_CLASS_POLL_RESPONSES],
  ['LiveClassAttendance', DDL_LIVE_CLASS_ATTENDANCE],
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
        console.log(`[live-class-schema] created missing table ${table}`);
      }
      for (const [col, colDdl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${colDdl}`);
          console.log(`[live-class-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[live-class-schema] live class tables unavailable:', e?.message);
    return false;
  }
}

/** True jab saari 5 live-class tables + route-critical columns maujood hon. */
export function ensureLiveClassSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

import { mysqlPool } from '@/lib/db';

/**
 * Gamification — StudentXP + DailyStreaks + LeaderboardCache tables.
 *
 * Canonical definitions schema_updates.sql me hain (GAMIFICATION
 * section), lekin purane provisioned DBs par ye tables missing ho
 * sakti hain (study-plan/doubts/ebooks/formula/pyq ke liye bhi yahi
 * hua tha — isliye ensure-* pattern bana) → streak GET, streak
 * checkin, XP GET/earn aur leaderboard GET tab 500 dete, chahe
 * student ne kabhi XP kamaya ho ya nahi. Home ka streak ring, XP
 * tiles aur Progress Report ka rank sab isi par chalte hain.
 * Ye helper (ensure-study-plan-schema.ts jaisa pattern) teeno tables
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath). Ye KABHI throw nahi karta: DDL permission na ho to
 * false, route phir bhi honest error dega.
 *
 * Is file ke saath theek hone wale route bugs:
 * - Streak GET sirf 30 din fetch karta tha jabki current-streak loop
 *   365 din tak chalta hai → 30 din se lambi streak hamesha 30 par
 *   atak jaati thi. Route ab 365 din fetch karta hai.
 * - Checkin ka SELECT-then-INSERT double-tap/concurrent request par
 *   race karta tha: dono SELECT khaali dekhte, doosra INSERT UNIQUE
 *   (studentId, streakDate) par 500 deta aur XP do baar award ho sakta
 *   tha. Route ab ER_DUP_ENTRY ko alreadyCheckedIn samajhta hai.
 * - XP earn me negative points pass ho jaate the (sirf `!points`
 *   check tha) → total XP aur LeaderboardCache dono ghat jaate.
 *   Route ab sirf positive integer points leta hai.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par
 *   depend karta; self-heal ko standalone rehna chahiye.
 * - source VARCHAR (ENUM ki jagah): ENUM unknown value par hard 500
 *   deta; routes wahi 7 sources bhejte hain jo canonical ENUM me hain,
 *   par naya source aane par bhi route na toote.
 * - Sirf wahi columns jo streak/xp/leaderboard routes use karte hain.
 * - UNIQUE keys best-effort hain: pehle se maujood duplicate rows
 *   hon to CREATE UNIQUE INDEX fail hoga, use ignore kiya jaata hai
 *   (route ke SUM-based reads tab bhi sahi total dete hain); nayi
 *   table banne par DDL me key pehle se hoti hai.
 */
let cache: Promise<boolean> | null = null;

const DDL_XP = `CREATE TABLE IF NOT EXISTS StudentXP (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  points INT DEFAULT 0,
  source VARCHAR(20) NOT NULL,
  description TEXT,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_xp_student (studentId),
  INDEX idx_xp_source (source),
  INDEX idx_xp_created (createdAt)
)`;

const DDL_STREAKS = `CREATE TABLE IF NOT EXISTS DailyStreaks (
  id VARCHAR(36) PRIMARY KEY,
  studentId VARCHAR(36) NOT NULL,
  streakDate DATE NOT NULL,
  loginMinutes INT DEFAULT 0,
  testsCompleted INT DEFAULT 0,
  lecturesWatched INT DEFAULT 0,
  UNIQUE KEY unique_student_date (studentId, streakDate),
  INDEX idx_streak_student (studentId),
  INDEX idx_streak_date (streakDate)
)`;

const DDL_CACHE = `CREATE TABLE IF NOT EXISTS LeaderboardCache (
  id VARCHAR(36) PRIMARY KEY,
  courseId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  totalXP INT DEFAULT 0,
  testScore DECIMAL(5,2) DEFAULT 0,
  completionPct DECIMAL(5,2) DEFAULT 0,
  userRank INT DEFAULT 0,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_course_student (courseId, studentId),
  INDEX idx_cache_course (courseId),
  INDEX idx_cache_rank (userRank)
)`;

/** Route ke filters/select ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  StudentXP: [
    ['studentId', 'VARCHAR(36)'],
    ['points', 'INT DEFAULT 0'],
    ['source', 'VARCHAR(20)'],
    ['description', 'TEXT'],
    ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
  DailyStreaks: [
    ['studentId', 'VARCHAR(36)'],
    ['streakDate', 'DATE'],
    ['loginMinutes', 'INT DEFAULT 0'],
    ['testsCompleted', 'INT DEFAULT 0'],
    ['lecturesWatched', 'INT DEFAULT 0'],
  ],
  LeaderboardCache: [
    ['courseId', 'VARCHAR(36)'],
    ['studentId', 'VARCHAR(36)'],
    ['totalXP', 'INT DEFAULT 0'],
    ['testScore', 'DECIMAL(5,2) DEFAULT 0'],
    ['completionPct', 'DECIMAL(5,2) DEFAULT 0'],
    ['userRank', 'INT DEFAULT 0'],
    ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
  ],
};

const DDL_BY_TABLE: Record<string, string> = {
  StudentXP: DDL_XP,
  DailyStreaks: DDL_STREAKS,
  LeaderboardCache: DDL_CACHE,
};

/** Best-effort UNIQUE keys (checkin race + xp/earn upsert in par nirbhar). */
const UNIQUE_KEYS: [string, string, string][] = [
  ['DailyStreaks', 'unique_student_date', '(studentId, streakDate)'],
  ['LeaderboardCache', 'unique_course_student', '(courseId, studentId)'],
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

async function indexExists(table: string, index: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT INDEX_NAME AS name FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND INDEX_NAME = ?`,
    [table, index],
  );
  return !!(rows && rows.length > 0);
}

async function ensure(): Promise<boolean> {
  try {
    for (const table of Object.keys(DDL_BY_TABLE)) {
      if (!(await tableExists(table))) {
        await mysqlPool.query(DDL_BY_TABLE[table]);
        console.log(`[gamification-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[gamification-schema] added missing column ${table}.${col}`);
        }
      }
    }
    for (const [table, index, cols] of UNIQUE_KEYS) {
      if (!(await indexExists(table, index))) {
        try {
          await mysqlPool.query(`CREATE UNIQUE INDEX ${index} ON ${table} ${cols}`);
          console.log(`[gamification-schema] added missing unique key ${table}.${index}`);
        } catch (e: any) {
          console.error(`[gamification-schema] unique key ${table}.${index} skip:`, e?.message);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[gamification-schema] Gamification unavailable:', e?.message);
    return false;
  }
}

/** True jab StudentXP + DailyStreaks + LeaderboardCache + route-critical columns maujood hon. */
export function ensureGamificationSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

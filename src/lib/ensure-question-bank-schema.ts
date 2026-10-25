import { mysqlPool } from '@/lib/db';

/**
 * Question Bank — Questions + QuestionTags + QuestionDifficulty tables.
 *
 * Canonical definitions init_db_full.sql (Questions) aur schema_batch_a.sql
 * (QuestionTags/QuestionDifficulty) me hain, lekin purane provisioned DBs
 * par ye tables missing ho sakti hain (baaki tables ke liye bhi yahi hua
 * tha — isliye ensure-* pattern bana) → /api/student/question-bank tab
 * 500 deta, aur Library ka Question Bank tab + ChapterDetail/Learn ka DPP
 * section hamesha error dikhata, chahe teacher ne sawal daale hon ya nahi.
 * Ye helper (ensure-formula-schema.ts jaisa pattern) teeno tables ko
 * idempotently banata hai (process me ek baar, information_schema check
 * ke saath). Ye KABHI throw nahi karta: DDL permission na ho to false,
 * route phir bhi honest error dega.
 *
 * Doosra bug jo is file ke saath theek hota hai: student question-bank
 * route pehle q.questionText/q.questionType filter karta tha, jabki
 * canonical writer (lib/db.ts createQuestion + admin questions route)
 * Questions me title/type likhta hai. Isliye type ya search filter lagate
 * hi query "unknown column" par 500 deti thi, aur bina filter ke bhi list
 * me questionText khaali aata tha (web + app dono questionText dekhte
 * hain). Route ab canonical title/type par filter karta hai aur response
 * me title→questionText, type→questionType alias deta hai, taaki purane
 * rows (jinme dono column hon) bhi dikhte rahen.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - type/difficulty VARCHAR (ENUM ki jagah): UI 'NUMERICAL' jaisi values
 *   bhejta hai jabki canonical ENUM me 'NUMERICAL' hai hi nahi; ENUM
 *   unknown value par hard 500 deta.
 * - Sirf wahi columns jo question-bank route use karta hai (filters:
 *   subjectId, chapterId, type, difficulty, tag, search; joins: Chapters,
 *   Subjects; select: q.* + QuestionDifficulty + QuestionTags).
 */
let cache: Promise<boolean> | null = null;

const DDL_QUESTIONS = `CREATE TABLE IF NOT EXISTS Questions (
  id VARCHAR(36) PRIMARY KEY,
  chapterId VARCHAR(36),
  subjectId VARCHAR(36),
  title TEXT NOT NULL,
  type VARCHAR(50) DEFAULT 'MCQ',
  options JSON,
  correctAnswer TEXT,
  explanation TEXT,
  difficulty VARCHAR(20) DEFAULT 'MEDIUM',
  marks DECIMAL(5,2) DEFAULT 4.00,
  negativeMarks DECIMAL(5,2) DEFAULT 1.00,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_chapterId (chapterId),
  INDEX idx_subjectId (subjectId),
  INDEX idx_difficulty (difficulty)
)`;

const DDL_QUESTION_TAGS = `CREATE TABLE IF NOT EXISTS QuestionTags (
  id VARCHAR(36) PRIMARY KEY,
  questionId VARCHAR(36) NOT NULL,
  tag VARCHAR(100) NOT NULL,
  INDEX idx_question_tag (questionId, tag),
  INDEX idx_tag (tag)
)`;

const DDL_QUESTION_DIFFICULTY = `CREATE TABLE IF NOT EXISTS QuestionDifficulty (
  id VARCHAR(36) PRIMARY KEY,
  questionId VARCHAR(36) NOT NULL,
  difficulty VARCHAR(20) DEFAULT 'MEDIUM',
  estimatedTimeSeconds INT DEFAULT 60,
  correctRate DECIMAL(5,2) DEFAULT 0,
  avgTimeSeconds DECIMAL(6,2) DEFAULT 0,
  totalAttempts INT DEFAULT 0,
  UNIQUE KEY uk_question (questionId)
)`;

/** Route ke filters/joins ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: Record<string, [string, string][]> = {
  Questions: [
    ['chapterId', 'VARCHAR(36)'],
    ['subjectId', 'VARCHAR(36)'],
    ['title', 'TEXT'],
    ['type', "VARCHAR(50) DEFAULT 'MCQ'"],
    ['options', 'JSON'],
    ['correctAnswer', 'TEXT'],
    ['explanation', 'TEXT'],
    ['difficulty', "VARCHAR(20) DEFAULT 'MEDIUM'"],
    ['marks', 'DECIMAL(5,2) DEFAULT 4.00'],
    ['negativeMarks', 'DECIMAL(5,2) DEFAULT 1.00'],
  ],
  QuestionTags: [
    ['questionId', 'VARCHAR(36)'],
    ['tag', 'VARCHAR(100)'],
  ],
  QuestionDifficulty: [
    ['questionId', 'VARCHAR(36)'],
    ['difficulty', "VARCHAR(20) DEFAULT 'MEDIUM'"],
    ['estimatedTimeSeconds', 'INT DEFAULT 60'],
    ['correctRate', 'DECIMAL(5,2) DEFAULT 0'],
    ['avgTimeSeconds', 'DECIMAL(6,2) DEFAULT 0'],
    ['totalAttempts', 'INT DEFAULT 0'],
  ],
};

const DDL_BY_TABLE: Record<string, string> = {
  Questions: DDL_QUESTIONS,
  QuestionTags: DDL_QUESTION_TAGS,
  QuestionDifficulty: DDL_QUESTION_DIFFICULTY,
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
        console.log(`[question-bank-schema] created missing table ${table}`);
      }
      for (const [col, ddl] of REQUIRED_COLUMNS[table]) {
        if (!(await columnExists(table, col))) {
          await mysqlPool.query(`ALTER TABLE ${table} ADD COLUMN ${col} ${ddl}`);
          console.log(`[question-bank-schema] added missing column ${table}.${col}`);
        }
      }
    }
    return true;
  } catch (e: any) {
    console.error('[question-bank-schema] QuestionBank unavailable:', e?.message);
    return false;
  }
}

/** True jab Questions + QuestionTags + QuestionDifficulty + route-critical columns maujood hon. */
export function ensureQuestionBankSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

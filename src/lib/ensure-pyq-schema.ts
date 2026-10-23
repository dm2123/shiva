import { mysqlPool } from '@/lib/db';

/**
 * PYQ (Previous Year Question) tables — PyqExams, PyqQuestions, PyqAttempts.
 *
 * Canonical definition schema_ai_features.sql me hai, lekin purane provisioned
 * DBs par tables missing ho sakti hain → /api/student/pyq* 500 deta.
 * Ye helper tables ko idempotently banata hai (process me ek baar,
 * information_schema check ke saath). Ye KABHI throw nahi karta: DDL
 * permission na ho to false, route phir bhi honest error dega.
 *
 * Deliberate deviations canonical SQL se (ensure-bookmark-schema.ts jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - questionType/difficulty VARCHAR (ENUM ki jagah): teacher POST koi bhi
 *   questionType string bhej sakta hai; ENUM unknown value par hard 500 deta.
 */
let cache: Promise<boolean> | null = null;

const DDL_EXAMS = `CREATE TABLE IF NOT EXISTS PyqExams (
  id VARCHAR(36) PRIMARY KEY,
  examName VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  subject VARCHAR(100),
  shift VARCHAR(50),
  totalQuestions INT DEFAULT 0,
  totalMarks INT DEFAULT 0,
  durationMinutes INT DEFAULT 180,
  pdfUrl VARCHAR(500),
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
)`;

const DDL_QUESTIONS = `CREATE TABLE IF NOT EXISTS PyqQuestions (
  id VARCHAR(36) PRIMARY KEY,
  examId VARCHAR(36) NOT NULL,
  questionNumber INT NOT NULL,
  questionText TEXT NOT NULL,
  questionType VARCHAR(20) DEFAULT 'MCQ',
  options JSON,
  correctAnswer TEXT,
  solution TEXT,
  marks DECIMAL(4,1) DEFAULT 4.0,
  topic VARCHAR(255),
  difficulty VARCHAR(20) DEFAULT 'MEDIUM',
  INDEX idx_pyqq_exam (examId)
)`;

const DDL_ATTEMPTS = `CREATE TABLE IF NOT EXISTS PyqAttempts (
  id VARCHAR(36) PRIMARY KEY,
  examId VARCHAR(36) NOT NULL,
  studentId VARCHAR(36) NOT NULL,
  answers JSON,
  score DECIMAL(6,2) DEFAULT 0,
  timeTakenSeconds INT DEFAULT 0,
  completed TINYINT(1) DEFAULT 0,
  startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  INDEX idx_pyqa_exam_student (examId, studentId)
)`;

async function ensure(): Promise<boolean> {
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT TABLE_NAME AS name FROM information_schema.TABLES
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME IN ('PyqExams','PyqQuestions','PyqAttempts')`
    );
    const have = new Set((rows || []).map((r: any) => r.name));
    if (!have.has('PyqExams')) {
      await mysqlPool.query(DDL_EXAMS);
      console.log('[pyq-schema] created missing table PyqExams');
    }
    if (!have.has('PyqQuestions')) {
      await mysqlPool.query(DDL_QUESTIONS);
      console.log('[pyq-schema] created missing table PyqQuestions');
    }
    if (!have.has('PyqAttempts')) {
      await mysqlPool.query(DDL_ATTEMPTS);
      console.log('[pyq-schema] created missing table PyqAttempts');
    }
    return true;
  } catch (e: any) {
    console.error('[pyq-schema] Pyq tables unavailable:', e?.message);
    return false;
  }
}

/** True jab PyqExams/PyqQuestions/PyqAttempts maujood hon aur PYQ API use ho sake. */
export function ensurePyqSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

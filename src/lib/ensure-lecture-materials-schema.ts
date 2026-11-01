import { mysqlPool } from '@/lib/db';

/**
 * LectureMaterials table — per-lecture study material (notes / DPP /
 * slides / answer keys ke PDF links).
 *
 * Canonical definition schema_updates.sql me hai (id, lectureId, title,
 * fileUrl, fileType ENUM('PDF','NOTES','SLIDES','DPP','ANSWER_KEY'),
 * createdAt), lekin provisioned DBs par table tabhi banti jab koi wo
 * SQL file haath se chalaye — runtime par koi ensure-* helper ise create
 * NAHI karta tha. Natija: student reader route
 * (GET /api/student/lectures/[id]/materials) aur teacher writer route
 * (POST /api/teacher/lectures/[id]/materials) dono hi table-missing par
 * 1146 se 500 dete the, aur MaterialsList component hamesha khaali
 * rehta tha. Ye helper (ensure-bookmark-schema.ts jaisa pattern) table
 * ko idempotently banata hai (process me ek baar, information_schema
 * check ke saath) aur maujood table me naye columns jodta hai.
 * Ye KABHI throw nahi karta: DDL permission na ho to false.
 *
 * Deliberate deviations canonical SQL se (doosre ensure-* jaisa):
 * - fileType VARCHAR(30) (ENUM ki jagah): route koi bhi fileType string
 *   accept karta hai; ENUM unknown value par hard 500 deta.
 * - Koi FOREIGN KEY nahi: self-heal ko standalone rehna chahiye.
 * - Teen extra columns jo canonical me nahi hain:
 *   - chapterId: chapter-level materials query (student chapters route)
 *     ke liye; writer lecture se derive karke bharta hai, purani rows
 *     par NULL rahega (chapter query lecture-join se bhi cover hoti
 *     hai, isliye NULL safe hai).
 *   - isPublished: student side sirf published material dikhe — admin
 *     draft/unpublish kar sake. Default TRUE taaki purani rows (jo
 *     pehle se live maani gayi hain) dikhti rahein.
 *   - sortOrder: admin ke diye order me list dikhe.
 */
let cache: Promise<boolean> | null = null;

const DDL = `CREATE TABLE IF NOT EXISTS LectureMaterials (
  id VARCHAR(36) PRIMARY KEY,
  lectureId VARCHAR(36) NOT NULL,
  chapterId VARCHAR(36) DEFAULT NULL,
  title VARCHAR(255) NOT NULL,
  fileUrl TEXT NOT NULL,
  fileType VARCHAR(30) DEFAULT 'NOTES',
  isPublished BOOLEAN DEFAULT TRUE,
  sortOrder INT DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_materials_lecture (lectureId),
  INDEX idx_materials_chapter (chapterId),
  INDEX idx_materials_published (isPublished)
)`;

/** Maujood table par route-critical columns (ADD hamesha nullable/default type se). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['chapterId', 'VARCHAR(36) DEFAULT NULL'],
  ['isPublished', 'BOOLEAN DEFAULT TRUE'],
  ['sortOrder', 'INT DEFAULT 0'],
  ['updatedAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'],
];

async function tableExists(): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT TABLE_NAME AS name FROM information_schema.TABLES
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LectureMaterials'`
  );
  return !!(rows && rows.length > 0);
}

async function columnExists(column: string): Promise<boolean> {
  const [rows]: any = await mysqlPool.query(
    `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'LectureMaterials' AND COLUMN_NAME = ?`,
    [column]
  );
  return !!(rows && rows.length > 0);
}

async function ensure(): Promise<boolean> {
  try {
    if (!(await tableExists())) {
      await mysqlPool.query(DDL);
      console.log('[lecture-materials-schema] created missing table LectureMaterials');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists(col))) {
        await mysqlPool.query(`ALTER TABLE LectureMaterials ADD COLUMN ${col} ${ddl}`);
        console.log(`[lecture-materials-schema] added missing column LectureMaterials.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[lecture-materials-schema] LectureMaterials unavailable:', e?.message);
    return false;
  }
}

/** True jab LectureMaterials table + naye columns maujood hon. */
export function ensureLectureMaterialsSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

/**
 * Material row ko API response shape me badlo: canonical fileType se
 * ek simple category derive hoti hai (Notes/DPP area ke liye) —
 * DPP fileType = 'DPP', baaki jaane-maane doc types = 'NOTE',
 * kuch aur ho to 'OTHER'. Koi data invent nahi hota, sirf label hai.
 */
export function materialCategory(fileType: string | null | undefined): 'NOTE' | 'DPP' | 'OTHER' {
  const t = String(fileType || '').toUpperCase();
  if (t === 'DPP') return 'DPP';
  if (t === 'NOTES' || t === 'NOTE' || t === 'PDF' || t === 'SLIDES' || t === 'ANSWER_KEY') return 'NOTE';
  return 'OTHER';
}

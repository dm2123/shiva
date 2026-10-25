import { mysqlPool } from '@/lib/db';

/**
 * Offline Downloads — OfflineContent table (web /app/offline-downloads
 * + app DownloadsScreen, dono /api/student/offline-downloads se chalte hain).
 *
 * Is route ka bug doosre ensure-* routes se alag aur bada tha:
 * - Route `offlinecontent` (lowercase) se SELECT karta tha, jabki canonical
 *   schema (schema_batch_a.sql) me table `OfflineContent` hai — case-sensitive
 *   MySQL par ye table hi nahi milti.
 * - Uske upar route aise columns maangta tha jo kisi bhi canonical table me
 *   hain hi nahi: title, sizeMB, status, downloadedAt, progress. Na
 *   OfflineContent (fileSizeMB, downloadStatus, createdAt, lastAccessedAt)
 *   me, na OfflineDownloads (contentTitle, fileUrl) me.
 * - Route ka catch har error par `success: true, data: []` deta tha, isliye
 *   page hamesha "No downloads yet" dikhata — chahe table/columns ki wajah
 *   se query fail ho rahi ho. Galti chhup jaati thi, khaali lagta tha.
 * Ye helper (ensure-notifications-schema.ts jaisa pattern) table ko
 * idempotently banata hai (process me ek baar, information_schema check ke
 * saath). Ye KABHI throw nahi karta: DDL permission na ho to false, route
 * phir bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - contentType/downloadStatus VARCHAR (ENUM ki jagah): ENUM unknown value
 *   par hard 500 deta.
 * - Ek deliberate addition: nullable `title` column. Canonical OfflineContent
 *   me title hota hi nahi, par web/app dono download ki title dikhate hain.
 *   Title ka koi honest source join karke nahi nikala ja sakta (contentId
 *   alag-alag tables — Lectures, EBooks, DPP, PYQ — ki taraf ishara kar
 *   sakta hai, galat join galat title dega). Isliye title sirf tab milega
 *   jab koi writer download record banate waqt asal title snapshot kare;
 *   tab tak page content-type label dikhata hai, koi nakli title nahi.
 * - Sirf wahi columns jo offline-downloads route use karta hai (select: id,
 *   title, contentType, contentId, fileSizeMB, downloadStatus, createdAt,
 *   expiresAt, lastAccessedAt; filter: userId).
 */
let cache: Promise<boolean> | null = null;

const DDL_OFFLINECONTENT = `CREATE TABLE IF NOT EXISTS OfflineContent (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255),
  contentType VARCHAR(50) NOT NULL,
  contentId VARCHAR(36) NOT NULL,
  fileSizeMB DECIMAL(6,2) DEFAULT 0,
  downloadStatus VARCHAR(20) DEFAULT 'PENDING',
  localPath VARCHAR(500),
  expiresAt DATETIME,
  lastAccessedAt DATETIME,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uk_user_content (userId, contentType, contentId),
  INDEX idx_user_status (userId, downloadStatus)
)`;

/** Route ke select/filter ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['userId', 'VARCHAR(36)'],
  ['title', 'VARCHAR(255)'],
  ['contentType', 'VARCHAR(50)'],
  ['contentId', 'VARCHAR(36)'],
  ['fileSizeMB', 'DECIMAL(6,2) DEFAULT 0'],
  ['downloadStatus', "VARCHAR(20) DEFAULT 'PENDING'"],
  ['localPath', 'VARCHAR(500)'],
  ['expiresAt', 'DATETIME'],
  ['lastAccessedAt', 'DATETIME'],
  ['createdAt', 'DATETIME DEFAULT CURRENT_TIMESTAMP'],
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
    if (!(await tableExists('OfflineContent'))) {
      await mysqlPool.query(DDL_OFFLINECONTENT);
      console.log('[offline-schema] created missing table OfflineContent');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('OfflineContent', col))) {
        await mysqlPool.query(`ALTER TABLE OfflineContent ADD COLUMN ${col} ${ddl}`);
        console.log(`[offline-schema] added missing column OfflineContent.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[offline-schema] OfflineContent unavailable:', e?.message);
    return false;
  }
}

/** True jab OfflineContent table + route-critical columns maujood hon. */
export function ensureOfflineSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

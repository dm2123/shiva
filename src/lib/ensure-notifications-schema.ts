import { mysqlPool } from '@/lib/db';

/**
 * Student Notifications — Notifications table (app ka NotificationsScreen
 * + web /app/notifications, dono /api/student/notifications se chalte hain).
 *
 * Canonical definition init_db_full.sql me hai, lekin purane provisioned
 * DBs par ye table missing ho sakti hai (EBooks/FormulaSheets/Pyq ke liye
 * bhi yahi hua tha — isliye ensure-* pattern bana) → route 500 deta, aur
 * Notifications screen hamesha error dikhata, chahe teacher/admin ne
 * notification bheji ho ya nahi.
 * Ye helper (ensure-ebooks-schema.ts jaisa pattern) table ko idempotently
 * banata hai (process me ek baar, information_schema check ke saath).
 * Ye KABHI throw nahi karta: DDL permission na ho to false, route phir
 * bhi honest error dega.
 *
 * Do deliberate deviations canonical SQL se (doosre ensure-* jaisa pattern):
 * - Koi FOREIGN KEY nahi: cross-table DDL doosri tables ke schema par depend
 *   karta; self-heal ko standalone rehna chahiye.
 * - type VARCHAR (ENUM ki jagah): route type ko free string ki tarah
 *   padhta hai; ENUM unknown value par hard 500 deta.
 * - Sirf wahi columns jo notifications route use karta hai (select: id,
 *   title, message, type, isRead, createdAt; filter: userId; update:
 *   isRead).
 */
let cache: Promise<boolean> | null = null;

const DDL_NOTIFICATIONS = `CREATE TABLE IF NOT EXISTS Notifications (
  id VARCHAR(36) PRIMARY KEY,
  userId VARCHAR(36) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'INFO',
  isRead TINYINT(1) DEFAULT 0,
  createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user (userId),
  INDEX idx_notifications_read (isRead)
)`;

/** Route ke select/filter/update ke liye zaroori columns (table maujood ho to). */
const REQUIRED_COLUMNS: [string, string][] = [
  ['userId', 'VARCHAR(36)'],
  ['title', 'VARCHAR(255)'],
  ['message', 'TEXT'],
  ['type', 'VARCHAR(20)'],
  ['isRead', 'TINYINT(1) DEFAULT 0'],
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
    if (!(await tableExists('Notifications'))) {
      await mysqlPool.query(DDL_NOTIFICATIONS);
      console.log('[notifications-schema] created missing table Notifications');
    }
    for (const [col, ddl] of REQUIRED_COLUMNS) {
      if (!(await columnExists('Notifications', col))) {
        await mysqlPool.query(`ALTER TABLE Notifications ADD COLUMN ${col} ${ddl}`);
        console.log(`[notifications-schema] added missing column Notifications.${col}`);
      }
    }
    return true;
  } catch (e: any) {
    console.error('[notifications-schema] Notifications unavailable:', e?.message);
    return false;
  }
}

/** True jab Notifications table + route-critical columns maujood hon. */
export function ensureNotificationsSchema(): Promise<boolean> {
  if (!cache) cache = ensure();
  return cache;
}

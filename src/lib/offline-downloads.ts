import { randomUUID } from 'crypto';
import { mysqlPool } from '@/lib/db';
import { ensureOfflineSchema } from '@/lib/ensure-offline-schema';

/**
 * Downloads write path — OfflineContent (canonical table, schema_batch_a.sql)
 * ka ek hi writer. Isse pehle koi writer tha hi nahi: web ke DownloadButton /
 * DownloadManager ne `/api/student/downloads` ko pukara tha jo maujood hi
 * nahi tha, aur RN/web-list wala `/api/student/offline-downloads` sirf GET
 * tha. Dono routes ab isi lib se likhte/mitate hain taaki do alag writer
 * kabhi alag table ya alag duplicate-rule na bana dein.
 *
 * Honest-data niyam:
 * - title sirf caller ke diye hue asal snapshot se aata hai (content card ka
 *   title). Kabhi generate nahi hota; na ho to NULL rehta hai aur list
 *   content-type label dikhati hai.
 * - localPath caller ka diya hua path/URL hai; is lib me uski scheme check
 *   nahi hoti — jo route use link ke roop me render karega (downloads
 *   adapter), wahi http(s) enforce karta hai.
 * - Ek user ke liye (contentType, contentId) par ek hi row: dobara save
 *   duplicate row nahi banata (bookmarks POST jaisa idempotent pattern).
 *   Dobara save par sirf lastAccessedAt taza hota hai, aur agar pehli row
 *   ka title NULL tha to ab mila asal title bhar diya jaata hai — maujood
 *   asal title kabhi overwrite nahi hota.
 * - Nayi row ka downloadStatus 'COMPLETED' hai: is API se bani row ka
 *   matlab hai user ne is content ko offline ke liye save kar liya.
 *   DDL default 'PENDING' sirf chal rahe download ke liye tha, jo ye API
 *   track nahi karti — saved row ko PENDING dikhana galat hota.
 */

export interface SaveDownloadInput {
  contentType: string;
  contentId: string;
  /** Asal title snapshot (content card se); na ho to null. */
  title?: string | null;
  fileSizeMB?: number | null;
  localPath?: string | null;
}

export interface SaveDownloadResult {
  id: string;
  alreadySaved: boolean;
}

export interface DownloadRow {
  id: string;
  title: string | null;
  contentType: string;
  contentId: string;
  sizeMB: number | null;
  status: string | null;
  localPath: string | null;
  createdAt: string | null;
  lastAccessedAt: string | null;
}

/** Length/type checks jo OfflineContent ke column sizes se aate hain. */
export function validateSaveInput(input: SaveDownloadInput): string | null {
  if (!input.contentType || typeof input.contentType !== 'string' || !input.contentType.trim()) {
    return 'contentType is required';
  }
  if (input.contentType.length > 50) return 'contentType is too long';
  if (!input.contentId || typeof input.contentId !== 'string' || !input.contentId.trim()) {
    return 'contentId is required';
  }
  if (input.contentId.length > 36) return 'contentId is too long';
  if (input.title != null && (typeof input.title !== 'string' || input.title.length > 255)) {
    return 'title is too long';
  }
  if (input.fileSizeMB != null && (typeof input.fileSizeMB !== 'number' || !Number.isFinite(input.fileSizeMB) || input.fileSizeMB < 0)) {
    return 'fileSizeMB must be a non-negative number';
  }
  if (input.localPath != null && (typeof input.localPath !== 'string' || input.localPath.length > 500)) {
    return 'localPath is too long';
  }
  return null;
}

export async function saveDownload(userId: string, input: SaveDownloadInput): Promise<SaveDownloadResult> {
  await ensureOfflineSchema();
  const title = input.title?.trim() ? input.title.trim() : null;
  const [existing]: any = await mysqlPool.query(
    'SELECT id FROM OfflineContent WHERE userId = ? AND contentType = ? AND contentId = ? LIMIT 1',
    [userId, input.contentType, input.contentId],
  );
  if (existing && existing.length > 0) {
    // Idempotent re-save: sirf lastAccessedAt taza + NULL title bharo.
    await mysqlPool.query(
      'UPDATE OfflineContent SET lastAccessedAt = NOW(), title = COALESCE(title, ?) WHERE id = ? AND userId = ?',
      [title, existing[0].id, userId],
    );
    return { id: existing[0].id, alreadySaved: true };
  }
  const id = randomUUID();
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await mysqlPool.query(
    `INSERT INTO OfflineContent
       (id, userId, title, contentType, contentId, fileSizeMB, downloadStatus, localPath, createdAt, lastAccessedAt)
     VALUES (?, ?, ?, ?, ?, ?, 'COMPLETED', ?, ?, ?)`,
    [id, userId, title, input.contentType, input.contentId, input.fileSizeMB ?? 0, input.localPath ?? null, now, now],
  );
  return { id, alreadySaved: false };
}

/** Sirf apni row mit sakti hai (id + userId dono match). False = mili hi nahi. */
export async function removeDownload(userId: string, id: string): Promise<boolean> {
  await ensureOfflineSchema();
  const [existing]: any = await mysqlPool.query(
    'SELECT id FROM OfflineContent WHERE id = ? AND userId = ? LIMIT 1',
    [id, userId],
  );
  if (!existing || existing.length === 0) return false;
  await mysqlPool.query('DELETE FROM OfflineContent WHERE id = ? AND userId = ?', [id, userId]);
  return true;
}

export async function listDownloadRows(userId: string): Promise<DownloadRow[]> {
  await ensureOfflineSchema();
  const [rows]: any = await mysqlPool.query(
    `SELECT id, title, contentType, contentId,
            fileSizeMB AS sizeMB, downloadStatus AS status,
            localPath, createdAt, lastAccessedAt
     FROM OfflineContent WHERE userId = ? ORDER BY createdAt DESC`,
    [userId],
  );
  return (rows || []) as DownloadRow[];
}

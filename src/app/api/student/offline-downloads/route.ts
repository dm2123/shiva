import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureOfflineSchema } from '@/lib/ensure-offline-schema';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    await ensureOfflineSchema();

    // Canonical table OfflineContent (schema_batch_a.sql) ke asal columns,
    // web/app contract par alias kiye hue. Purana query `offlinecontent`
    // se title/sizeMB/status/downloadedAt/progress maangta tha — ye columns
    // kisi canonical table me hain hi nahi, isliye query hamesha fail hoti
    // thi aur catch use chhupakar khaali list deta tha.
    // title: OfflineContent me asal me title column nahi hota; ensure usey
    // nullable banata hai taaki future writer asal title snapshot kar sake.
    // Tab tak row ka title null rehta hai (page content-type label dikhata
    // hai) — koi nakli title nahi banaya jaata.
    const [rows] = await mysqlPool.query(
      `SELECT id, title, contentType, contentId,
              fileSizeMB AS sizeMB, downloadStatus AS status,
              createdAt AS downloadedAt, expiresAt, lastAccessedAt
       FROM OfflineContent
       WHERE userId = ?
       ORDER BY createdAt DESC`,
      [session.userId]
    );

    return NextResponse.json({ success: true, data: rows });
  } catch (error) {
    if ((error as any).name === 'AuthError') return NextResponse.json({ error: (error as any).message }, { status: (error as any).statusCode || 401 });
    // Honest error: pehle wala `success: true, data: []` har DB galti ko
    // "koi download nahi" jaisa dikhata tha. Ab 500 saaf batata hai.
    return NextResponse.json({ success: false, error: 'Failed to load downloads' }, { status: 500 });
  }
}

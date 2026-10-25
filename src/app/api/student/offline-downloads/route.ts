import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { ensureOfflineSchema } from '@/lib/ensure-offline-schema';
import { saveDownload, removeDownload, validateSaveInput } from '@/lib/offline-downloads';

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

/**
 * POST — download record banao (idempotent, writer pehle tha hi nahi).
 * Body: { contentType, contentId, title?, fileSizeMB?, localPath? }.
 * title sirf caller ka asal snapshot hota hai; dobara save par duplicate
 * row nahi banti (alreadySaved: true + wahi id wapas).
 */
export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const input = {
      contentType: body?.contentType,
      contentId: body?.contentId,
      title: body?.title ?? null,
      fileSizeMB: body?.fileSizeMB ?? null,
      localPath: body?.localPath ?? null,
    };
    const validationError = validateSaveInput(input);
    if (validationError) {
      return NextResponse.json({ success: false, error: validationError }, { status: 400 });
    }
    const result = await saveDownload(session.userId, input);
    return NextResponse.json(
      { success: true, data: { id: result.id, alreadySaved: result.alreadySaved } },
      { status: result.alreadySaved ? 200 : 201 },
    );
  } catch (error: any) {
    if (error?.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: 'Failed to save download' }, { status: 500 });
  }
}

/**
 * DELETE — apni download record mitayo. Bookmarks DELETE jaisa contract:
 * id query param me (?id=...). Doosre user ki row par 404 (ownership leak
 * nahi — ye batana bhi galat hota ki wo row maujood hai ya nahi, isliye
 * dono case me ek hi 'not found' jawab).
 */
export async function DELETE(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const id = new URL(req.url).searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'id query parameter is required' }, { status: 400 });
    }
    const removed = await removeDownload(session.userId, id);
    if (!removed) {
      return NextResponse.json({ success: false, error: 'Download not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { deleted: true } });
  } catch (error: any) {
    if (error?.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: 'Failed to delete download' }, { status: 500 });
  }
}

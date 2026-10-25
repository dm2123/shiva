import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import {
  saveDownload,
  listDownloadRows,
  validateSaveInput,
} from '@/lib/offline-downloads';

/**
 * Legacy web contract — DownloadButton / DownloadManager isi route ko
 * pukarte hain, par ye route repo me maujood hi nahi tha (isliye web par
 * download toggle/manager hamesha fail hota tha). Ye koi doosri table nahi
 * banata: neeche wahi OfflineContent + wahi offline-downloads lib hai, sirf
 * response/request shape web components ke contract par map ki gayi hai:
 * - GET -> { success, data: { downloads: [...] } }
 * - POST body: { contentType, contentId, contentTitle, fileUrl, fileSizeMB }
 * - DELETE yahan nahi — `/api/student/downloads/[id]` route me hai (web
 *   components usi path par DELETE bhejte hain).
 *
 * fileUrl safety: DownloadManager fileUrl ko seedha <a href> me daalta hai,
 * isliye sirf http(s) URL store hoti hai — javascript:/data: jaisi scheme
 * 400 degi, kabhi DB me nahi jayegi. fileUrl OfflineContent.localPath me
 * rakhi jaati hai (alag fileUrl column canonical table me nahi hai).
 * contentTitle caller ke content card ka asal title hai; na ho to list me
 * title ki jagah content-type label dikhega, koi nakli title nahi banega.
 */
function toWebRow(row: Awaited<ReturnType<typeof listDownloadRows>>[number]) {
  return {
    id: row.id,
    contentType: row.contentType,
    contentId: row.contentId,
    contentTitle: row.title ?? row.contentType,
    fileUrl: row.localPath ?? '',
    fileSizeMB: row.sizeMB ?? 0,
    downloadStatus: row.status,
    lastAccessedAt: row.lastAccessedAt,
    createdAt: row.createdAt,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const rows = await listDownloadRows(session.userId);
    return NextResponse.json({ success: true, data: { downloads: rows.map(toWebRow) } });
  } catch (error: any) {
    if (error?.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: 'Failed to load downloads' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
    }
    const fileUrl = body?.fileUrl;
    if (fileUrl != null && (typeof fileUrl !== 'string' || !/^https?:\/\//i.test(fileUrl))) {
      return NextResponse.json({ success: false, error: 'fileUrl must be an http(s) URL' }, { status: 400 });
    }
    const input = {
      contentType: body?.contentType,
      contentId: body?.contentId,
      title: body?.contentTitle ?? null,
      fileSizeMB: body?.fileSizeMB ?? null,
      localPath: fileUrl ?? null,
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

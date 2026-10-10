import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { randomUUID } from 'crypto';

// GET - List shared content
export async function GET(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const { searchParams } = new URL(request.url);
    const shareType = searchParams.get('shareType') || 'BATCH';
    const targetId = searchParams.get('targetId');

    let where = 'WHERE 1=1';
    const params: any[] = [];
    if (shareType) { where += ' AND cs.shareType = ?'; params.push(shareType); }
    if (targetId) { where += ' AND cs.targetId = ?'; params.push(targetId); }

    const [shares]: any = await mysqlPool.query(
      `SELECT cs.*, u.email AS sharedByEmail, sp.name AS sharedByName,
        (SELECT COUNT(*) FROM ContentShareViews WHERE shareId = cs.id) AS viewCountActual
       FROM ContentShares cs
       LEFT JOIN Users u ON cs.sharedBy = u.id
       LEFT JOIN StudentProfiles sp ON cs.sharedBy = sp.userId
       ${where}
       ORDER BY cs.createdAt DESC LIMIT 30`,
      params
    );

    return NextResponse.json({ success: true, data: shares });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST - Share content
export async function POST(request: NextRequest) {
  try {
    const session = await requireRole(request, UserRole.STUDENT);
    const body = await request.json();
    const id = randomUUID();
    await mysqlPool.query(
      `INSERT INTO ContentShares (id, sharedBy, contentType, contentId, contentUrl, title, message, shareType, targetId)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, body.contentType, body.contentId || null, body.contentUrl || null,
       body.title, body.message || null, body.shareType || 'BATCH', body.targetId || null]
    );
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

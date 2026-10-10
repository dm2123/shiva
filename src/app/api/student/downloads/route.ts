import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);

    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM OfflineDownloads WHERE studentId = ? ORDER BY createdAt DESC',
      [session.userId]
    );

    return NextResponse.json({ success: true, data: { downloads: rows } });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();
    const { contentType, contentId, contentTitle, fileUrl, fileSizeMB } = body;

    if (!contentType || !contentId || !fileUrl) {
      return NextResponse.json({ success: false, error: { message: 'Missing required fields' } }, { status: 400 });
    }

    // Check if already downloaded
    const [existing]: any = await mysqlPool.query(
      'SELECT id FROM OfflineDownloads WHERE studentId = ? AND contentType = ? AND contentId = ?',
      [session.userId, contentType, contentId]
    );

    if (existing.length > 0) {
      return NextResponse.json({ success: true, data: { id: existing[0].id, alreadyDownloaded: true } });
    }

    const id = uuid();
    await mysqlPool.query(
      `INSERT INTO OfflineDownloads (id, studentId, contentType, contentId, contentTitle, fileUrl, fileSizeMB, downloadStatus)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, session.userId, contentType, contentId, contentTitle || 'Untitled', fileUrl, fileSizeMB || 0, 'COMPLETED']
    );

    return NextResponse.json({ success: true, data: { id, alreadyDownloaded: false } }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';
import { randomUUID } from 'crypto';

export async function GET(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const type = url.searchParams.get('type');

    let query = 'SELECT * FROM ContentBookmarks WHERE studentId = ?';
    const params: any[] = [session.userId];

    if (type) {
      query += ' AND contentType = ?';
      params.push(type);
    }

    query += ' ORDER BY createdAt DESC';

    const [rows]: any = await mysqlPool.query(query, params);

    return NextResponse.json(createApiResponse({ bookmarks: rows || [] }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch bookmarks'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const body = await req.json();

    const { contentType, contentId, title, note, highlightColor, positionSeconds } = body;

    if (!contentType || !contentId) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'contentType and contentId are required'), { status: 400 });
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const bookmarkId = randomUUID();

    await mysqlPool.query(
      `INSERT INTO ContentBookmarks (id, studentId, contentType, contentId, title, note, highlightColor, positionSeconds, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [bookmarkId, session.userId, contentType, contentId, title || null, note || null, highlightColor || null, positionSeconds || null, now]
    );

    return NextResponse.json(createApiResponse({ bookmarkId, contentType, contentId }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to add bookmark'), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.STUDENT);
    const url = new URL(req.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json(createApiError('BAD_REQUEST', 'id query parameter is required'), { status: 400 });
    }

    const [existing]: any = await mysqlPool.query('SELECT * FROM ContentBookmarks WHERE id = ? AND studentId = ?', [id, session.userId]);
    if (!existing || existing.length === 0) {
      return NextResponse.json(createApiError('NOT_FOUND', 'Bookmark not found'), { status: 404 });
    }

    await mysqlPool.query('DELETE FROM ContentBookmarks WHERE id = ? AND studentId = ?', [id, session.userId]);

    return NextResponse.json(createApiResponse({ deleted: true }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to delete bookmark'), { status: 500 });
  }
}

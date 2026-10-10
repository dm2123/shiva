import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { createApiResponse, createApiError } from '@/lib/utils';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || '';
    const state = searchParams.get('state') || '';
    const q = (searchParams.get('q') || '').trim();

    let query = 'SELECT * FROM Colleges WHERE 1=1';
    const params: any[] = [];

    if (type) {
      query += ' AND type = ?';
      params.push(type);
    }
    if (state) {
      query += ' AND state = ?';
      params.push(state);
    }
    if (q) {
      query += ' AND (name LIKE ? OR city LIKE ?)';
      const like = `%${q}%`;
      params.push(like, like);
    }

    query += ' ORDER BY name ASC LIMIT 200';

    const [rows]: any = await mysqlPool.query(query, params);
    return NextResponse.json(createApiResponse({ colleges: rows }), { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to fetch colleges'), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const { name, city, state, type, website, ranking, cutoff } = body;

    if (!name || !city || !state) {
      return NextResponse.json(createApiError('VALIDATION_ERROR', 'name, city, and state are required'), { status: 400 });
    }

    const id = `col-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    await mysqlPool.query(
      `INSERT INTO Colleges (id, name, city, state, type, website, ranking, cutoff) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, name, city, state, type || null, website || null, ranking || null, cutoff || null]
    );

    return NextResponse.json(createApiResponse({ id }), { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') {
      return NextResponse.json(createApiError(error.errorCode, error.message), { status: error.statusCode });
    }
    return NextResponse.json(createApiError('INTERNAL_SERVER_ERROR', error.message || 'Failed to add college'), { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.TEACHER);
    const url = new URL(req.url);
    const since = url.searchParams.get('since');

    let query = 'SELECT lcm.*, u.email FROM LiveClassMessages lcm JOIN Users u ON lcm.userId = u.id WHERE lcm.liveClassId = ?';
    const queryParams: any[] = [params.id];

    if (since) {
      query += ' AND lcm.createdAt > ?';
      queryParams.push(since);
    }

    query += ' ORDER BY lcm.createdAt ASC LIMIT 200';

    const [rows]: any = await mysqlPool.query(query, queryParams);
    return NextResponse.json({ success: true, data: { messages: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json({ success: false, error: { message: 'Message is required' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO LiveClassMessages (id, liveClassId, userId, message) VALUES (?, ?, ?, ?)',
      [id, params.id, session.userId, message]
    );

    return NextResponse.json({ success: true, data: { id, message } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

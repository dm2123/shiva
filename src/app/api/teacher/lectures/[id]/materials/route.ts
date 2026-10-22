import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { mysqlPool } from '@/lib/db';
import { v4 as uuid } from 'uuid';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.TEACHER);
    const [rows]: any = await mysqlPool.query(
      'SELECT * FROM LectureMaterials WHERE lectureId = ? ORDER BY createdAt DESC',
      [params.id]
    );
    return NextResponse.json({ success: true, data: { materials: rows } });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.TEACHER);
    const body = await req.json();
    const { title, fileUrl, fileType } = body;

    if (!title || !fileUrl) {
      return NextResponse.json({ success: false, error: { message: 'Title and fileUrl required' } }, { status: 400 });
    }

    const id = uuid();
    await mysqlPool.query(
      'INSERT INTO LectureMaterials (id, lectureId, title, fileUrl, fileType) VALUES (?, ?, ?, ?, ?)',
      [id, params.id, title, fileUrl, fileType || 'NOTES']
    );

    return NextResponse.json({ success: true, data: { id, title, fileUrl, fileType } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { createCourse } from '@/services/academic.service';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const [rows]: any = await mysqlPool.query('SELECT * FROM Courses ORDER BY createdAt DESC');
    return NextResponse.json({ success: true, data: { courses: rows } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    return NextResponse.json({ success: false, error: 'Error fetching courses' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const course = await createCourse(body);
    return NextResponse.json({ success: true, data: { course } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    if (error.message && error.message.includes('DUPLICATE')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 409 });
    }
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 400 });
  }
}

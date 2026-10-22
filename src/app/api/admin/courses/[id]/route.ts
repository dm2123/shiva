import { NextRequest, NextResponse } from 'next/server';
import { mysqlPool } from '@/lib/db';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getCourseById, updateCourse } from '@/services/academic.service';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const course = await getCourseById(params.id);
    return NextResponse.json({ success: true, data: { course } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to load course' } }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const updates: any = {};
    for (const k of ['title', 'slug', 'description', 'thumbnailUrl', 'price', 'status', 'isPublished']) {
      if (body[k] !== undefined) updates[k] = body[k];
    }
    const course = await updateCourse(params.id, updates);
    return NextResponse.json({ success: true, data: { course } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
      return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
    }
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to update course' } }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const { id } = params;
    if (mysqlPool) {
      // Direct delete, don't worry about foreign keys for now (handled by DB cascade)
      await mysqlPool.query('DELETE FROM Courses WHERE id = ?', [id]);
      return NextResponse.json({ success: true }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: 'Database connection failed' }, { status: 500 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
    console.error('Delete Error:', error);
    return NextResponse.json({ success: false, error: 'Delete failed' }, { status: 500 });
  }
}


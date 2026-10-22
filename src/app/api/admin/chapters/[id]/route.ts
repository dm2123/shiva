import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getChapterById, updateChapter, deleteChapter } from '@/services/academic.service';

function fail(error: any) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
  }
  console.error('Admin /api/admin/chapters/[id] Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const chapter = await getChapterById(params.id);
    return NextResponse.json({ success: true, data: { chapter } }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const updates: any = {};
    for (const k of ['subjectId', 'title', 'description', 'sortOrder']) if (body[k] !== undefined) updates[k] = body[k];
    const chapter = await updateChapter(params.id, updates);
    return NextResponse.json({ success: true, data: { chapter } }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await deleteChapter(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

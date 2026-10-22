import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { findLectureByIdDb } from '@/lib/db';
import { updateLecture, deleteLecture } from '@/services/academic.service';
import { normalizeLectureBody } from '@/lib/cms-normalize';

function fail(error: any) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
  }
  console.error('Admin /api/admin/lectures/[id] Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || 'Internal server error' } }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const lecture = await findLectureByIdDb(params.id);
    if (!lecture) {
      return NextResponse.json({ success: false, error: { message: 'Lecture not found' } }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: { lecture } }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const normalized = normalizeLectureBody(body);
    const updates: any = {};
    for (const k of ['chapterId', 'title', 'description', 'videoUrl', 'durationSeconds', 'isPreviewable', 'sortOrder']) if (normalized[k] !== undefined) updates[k] = normalized[k];
    const lecture = await updateLecture(params.id, updates);
    return NextResponse.json({ success: true, data: { lecture } }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await deleteLecture(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return fail(error);
  }
}

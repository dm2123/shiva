import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getTestById, updateTest, deleteTest } from '@/services/test.service';

function fail(error: any, fallback: string) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
  }
  console.error('Admin /api/admin/tests/[id] Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || fallback } }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const test = await getTestById(params.id);
    return NextResponse.json({ success: true, data: { test } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to load test');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const updates: any = {};
    for (const k of ['title', 'description', 'courseId', 'status', 'type', 'category']) {
      if (body[k] !== undefined) updates[k] = body[k];
    }
    for (const k of ['durationMinutes', 'totalMarks', 'passingMarks']) {
      if (body[k] != null) updates[k] = Number(body[k]);
    }
    const test = await updateTest(params.id, updates);
    return NextResponse.json({ success: true, data: { test } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to update test');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await deleteTest(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to delete test');
  }
}

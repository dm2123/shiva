import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createTest, listAllTests } from '@/services/test.service';

function fail(error: any, fallback: string) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  console.error('Admin /api/admin/tests Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || fallback } }, { status: 400 });
}

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const courseId = req.nextUrl.searchParams.get('courseId');
    const status = req.nextUrl.searchParams.get('status');
    const type = req.nextUrl.searchParams.get('type');
    let tests: any[] = await listAllTests();
    if (courseId) tests = tests.filter((t) => t.courseId === courseId);
    if (status) tests = tests.filter((t) => t.status === status);
    if (type) tests = tests.filter((t) => t.type === type);
    return NextResponse.json({ success: true, data: { tests } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to load tests');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();
    const test = await createTest({
      title: body.title,
      description: body.description,
      courseId: body.courseId,
      durationMinutes: body.durationMinutes != null ? Number(body.durationMinutes) : 60,
      totalMarks: body.totalMarks != null ? Number(body.totalMarks) : 100,
      passingMarks: body.passingMarks != null ? Number(body.passingMarks) : undefined,
      status: body.status || 'DRAFT',
      // App grouping (Mock / PYQ / Practice) — Tests.type self-healed column.
      type: body.type || undefined,
      category: body.category || undefined,
    });
    return NextResponse.json({ success: true, data: { test } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to create test');
  }
}

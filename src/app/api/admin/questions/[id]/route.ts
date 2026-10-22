import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { getQuestionById, updateQuestion, deleteQuestion } from '@/services/test.service';
import { findChapterByIdDb, findSubjectByIdDb } from '@/lib/db';

function fail(error: any, fallback: string) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
  }
  console.error('Admin /api/admin/questions/[id] Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || fallback } }, { status: 400 });
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const question = await getQuestionById(params.id);
    return NextResponse.json({ success: true, data: { question } }, { status: 200 });
  } catch (error: any) {
    return fail(error, 'Failed to load question');
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();

    // Re-linking targets must exist (chapter/subject carry the question
    // into the right course's tests and Practice tabs).
    if (body.chapterId && !(await findChapterByIdDb(body.chapterId))) {
      return NextResponse.json({ success: false, error: { message: 'Chapter not found' } }, { status: 404 });
    }
    if (body.subjectId && !(await findSubjectByIdDb(body.subjectId))) {
      return NextResponse.json({ success: false, error: { message: 'Subject not found' } }, { status: 404 });
    }

    const updates: any = {};
    for (const k of ['chapterId', 'subjectId', 'type', 'explanation', 'difficulty']) {
      if (body[k] !== undefined) updates[k] = body[k];
    }
    if (body.title !== undefined || body.questionText !== undefined) {
      updates.title = body.title ?? body.questionText;
    }
    if (body.options !== undefined) updates.options = body.options;
    if (body.correctAnswer != null) updates.correctAnswer = String(body.correctAnswer);
    for (const k of ['marks', 'negativeMarks']) {
      if (body[k] != null) updates[k] = Number(body[k]);
    }
    const question = await updateQuestion(params.id, updates);
    return NextResponse.json({ success: true, data: { question } }, { status: 200 });
  } catch (error: any) {
    return fail(error, 'Failed to update question');
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireRole(req, UserRole.ADMIN);
    await deleteQuestion(params.id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    return fail(error, 'Failed to delete question');
  }
}

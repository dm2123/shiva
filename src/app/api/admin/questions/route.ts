import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createQuestion, listQuestions } from '@/services/test.service';
import { listQuestionsByChapterDb, findChapterByIdDb, findSubjectByIdDb } from '@/lib/db';

function fail(error: any, fallback: string) {
  if (error.name === 'AuthError') {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: error.statusCode });
  }
  if (typeof error?.message === 'string' && error.message.startsWith('NOT_FOUND')) {
    return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
  }
  console.error('Admin /api/admin/questions Error:', error);
  return NextResponse.json({ success: false, error: { message: error.message || fallback } }, { status: 400 });
}

/**
 * Question Bank management for the CMS. A question becomes part of a
 * course's tests (and the Learn screen's Practice tab) purely through
 * its chapter/subject link: Tests -> Course -> Subjects -> Chapters ->
 * Questions. There is deliberately no separate test<->question table.
 */
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const chapterId = req.nextUrl.searchParams.get('chapterId');
    const subjectId = req.nextUrl.searchParams.get('subjectId');
    let questions: any[];
    if (chapterId) {
      questions = await listQuestionsByChapterDb(chapterId);
    } else {
      questions = await listQuestions();
      if (subjectId) questions = questions.filter((q: any) => q.subjectId === subjectId);
    }
    return NextResponse.json({ success: true, data: { questions } }, { status: 200 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to load questions');
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, UserRole.ADMIN);
    const body = await req.json();

    if (!body.chapterId && !body.subjectId) {
      return NextResponse.json(
        { success: false, error: { message: 'Questions must be mapped to at least a subject or chapter' } },
        { status: 400 }
      );
    }
    if (body.chapterId && !(await findChapterByIdDb(body.chapterId))) {
      return NextResponse.json({ success: false, error: { message: 'Chapter not found' } }, { status: 404 });
    }
    if (body.subjectId && !(await findSubjectByIdDb(body.subjectId))) {
      return NextResponse.json({ success: false, error: { message: 'Subject not found' } }, { status: 404 });
    }

    const question = await createQuestion({
      title: body.title ?? body.questionText,
      type: body.type || 'MCQ',
      chapterId: body.chapterId || undefined,
      subjectId: body.subjectId || undefined,
      options: body.options,
      // Stored verbatim (index / letter / text all resolvable by the
      // scoring + analysis code), numbers normalised to strings.
      correctAnswer:
        body.correctAnswer == null ? undefined : String(body.correctAnswer),
      explanation: body.explanation,
      difficulty: body.difficulty || 'MEDIUM',
      marks: body.marks != null ? Number(body.marks) : 4,
      negativeMarks: body.negativeMarks != null ? Number(body.negativeMarks) : 1,
    });
    return NextResponse.json({ success: true, data: { question } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ error: error.message }, { status: error.statusCode || 401 });
    return fail(error, 'Failed to create question');
  }
}

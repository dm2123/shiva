import { NextRequest, NextResponse } from 'next/server';
import { requireRole } from '@/lib/rbac';
import { UserRole } from '@/types/auth';
import { createQuestionDb, listQuestionsByChapterDb, findChapterByIdDb, findSubjectByIdDb } from '@/lib/db';
import { verifyTeacherCourseAuthorization } from '@/services/academic.service';
import { randomUUID } from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const session = await requireRole(req, UserRole.TEACHER);
    const body = await req.json();

    // Verify object-level authorization for the teacher
    if (body.chapterId) {
      const chapter = await findChapterByIdDb(body.chapterId);
      if (!chapter) throw new Error('NOT_FOUND: Chapter not found');
      const subject = await findSubjectByIdDb(chapter.subjectId);
      if (!subject) throw new Error('NOT_FOUND: Subject not found');
      await verifyTeacherCourseAuthorization(session.userId, subject.courseId);
    } else if (body.subjectId) {
       const subject = await findSubjectByIdDb(body.subjectId);
       if (!subject) throw new Error('NOT_FOUND: Subject not found');
       await verifyTeacherCourseAuthorization(session.userId, subject.courseId);
    } else {
       throw new Error('VALIDATION_ERROR: Questions must be mapped to at least a subject or chapter');
    }

    const questionData = {
      id: randomUUID(),
      title: body.title,
      chapterId: body.chapterId,
      subjectId: body.subjectId,
      type: body.type,
      options: body.options,
      correctAnswer: body.correctAnswer,
      explanation: body.explanation,
      difficulty: body.difficulty || 'MEDIUM',
      marks: body.marks || 4,
      negativeMarks: body.negativeMarks || 1
    };

    const question = await createQuestionDb(questionData);
    
    return NextResponse.json({ success: true, data: { question } }, { status: 201 });
  } catch (error: any) {
    if (error.name === 'AuthError') return NextResponse.json({ success: false, error: { message: error.message } }, { status: 401 });
    if (error.message.includes('NOT_FOUND')) return NextResponse.json({ success: false, error: { message: error.message } }, { status: 404 });
    if (error.message.includes('FORBIDDEN')) return NextResponse.json({ success: false, error: { message: error.message } }, { status: 403 });
    
    return NextResponse.json({ success: false, error: { message: error.message || 'Failed to create question' } }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
     await requireRole(req, UserRole.TEACHER);
     const url = new URL(req.url);
     const chapterId = url.searchParams.get('chapterId');

     let questions: any[] = [];
     if (chapterId) {
        questions = await listQuestionsByChapterDb(chapterId);
     }
     // Optional: Add listing by subject if not filtered by chapter

     return NextResponse.json({ success: true, data: { questions } });
  } catch (error: any) {
     return NextResponse.json({ success: false, error: { message: error.message } }, { status: 500 });
  }
}

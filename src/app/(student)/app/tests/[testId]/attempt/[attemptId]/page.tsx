import { headers } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import {
  findTestByIdDb, findAssessmentAttemptDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb,
} from '@/lib/db';
import StudentExamRunner, { ExamQuestion } from '@/components/student/StudentExamRunner';

export const revalidate = 0;

function normalizeOptions(raw: any): { id: string; text: string }[] {
  if (!raw) return [];
  let parsed = raw;
  if (typeof raw === 'string') {
    try { parsed = JSON.parse(raw); } catch { return []; }
  }
  if (Array.isArray(parsed)) return parsed;
  if (parsed && Array.isArray(parsed.options)) return parsed.options;
  return [];
}

export default async function AttemptSessionPage({
  params,
}: {
  params: { testId: string; attemptId: string };
}) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const test = await findTestByIdDb(params.testId);
  if (!test) notFound();

  const attempt = await findAssessmentAttemptDb(params.attemptId);
  if (!attempt || attempt.studentId !== session.userId) notFound();

  if (attempt.status !== 'STARTED') {
    redirect(`/app/results/${attempt.id}`);
  }

  const subjects = await listSubjectsByCourseDb(test.courseId);
  const questionRows = (
    await Promise.all(
      subjects.map(async (subject: any) => {
        const chapters = await listChaptersBySubjectDb(subject.id);
        return (await Promise.all(chapters.map((chapter: any) => listQuestionsByChapterDb(chapter.id)))).flat();
      })
    )
  ).flat();

  const questions: ExamQuestion[] = (questionRows as any[]).map((q: any) => ({
    id: q.id,
    title: q.title,
    type: q.type,
    options: normalizeOptions(q.options),
  }));

  return (
    <div className="w-full">
      <StudentExamRunner
        attemptId={attempt.id}
        testTitle={test.title}
        durationMinutes={Number(test.durationMinutes || 60)}
        questions={questions}
      />
    </div>
  );
}
import { redirect } from 'next/navigation';
import { getAuthUser } from '@/lib/auth';
import { findTestByIdDb, createAssessmentAttemptDb } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export default async function Page({ params }: { params: { testId: string } }) {
  const user = await getAuthUser();
  if (!user || user.role !== 'STUDENT') redirect('/login');

  const test = await findTestByIdDb(params.testId);
  if (!test) redirect('/app/tests');

  const attempt = await createAssessmentAttemptDb({
    id: uuidv4(),
    assessmentId: test.id,
    studentId: user.id,
    score: 0,
    status: 'STARTED',
    startedAt: new Date().toISOString(),
  });

  redirect(`/app/tests/${params.testId}/attempt/${attempt.id}`);
}

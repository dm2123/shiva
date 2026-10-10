import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { findAssessmentAttemptDb, findTestByIdDb, listAssessmentResponsesByAttemptDb, listSubjectsByCourseDb, listChaptersBySubjectDb, listQuestionsByChapterDb } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import { IconArrowLeft, IconCheckCircle, IconX, IconTrendingUp } from '@/components/student/StudentIcons';

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

export default async function ResultDetailPage({ params }: { params: { attemptId: string } }) {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const attempt = await findAssessmentAttemptDb(params.attemptId);
  if (!attempt || attempt.studentId !== session.userId) {
    notFound();
  }

  const test = await findTestByIdDb(attempt.assessmentId);
  if (!test) notFound();

  const responses = (await listAssessmentResponsesByAttemptDb(attempt.id)) || [];

  const subjects = await listSubjectsByCourseDb(test.courseId);
  const questionRows = (
    await Promise.all(
      subjects.map(async (subject: any) => {
        const chapters = await listChaptersBySubjectDb(subject.id);
        return (await Promise.all(chapters.map((chapter: any) => listQuestionsByChapterDb(chapter.id)))).flat();
      })
    )
  ).flat();

  const questionMap = new Map((questionRows as any[]).map((q: any) => [q.id, q]));

  const score = Math.max(0, Number(attempt.score || 0));
  const max = Number(test.totalMarks || 0);
  const pct = max > 0 ? Math.round((score / max) * 100) : 0;
  const passed = test.passingMarks != null ? score >= Number(test.passingMarks) : pct >= 35;

  const rows = (responses as any[]).map((r: any) => {
    const q = questionMap.get(r.questionId);
    return {
      response: r,
      question: q || null,
      options: q ? normalizeOptions(q.options) : [],
    };
  });

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Test Results"
        description={test.title}
      />

      <div className="student-card p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-black text-white relative"
              style={{
                background: `conic-gradient(var(--student-primary) ${pct * 3.6}deg, var(--student-surface-hover) 0deg)`,
                boxShadow: 'inset 0 0 0 10px var(--student-surface)',
              }}
            >
              <span>{pct}%</span>
            </div>
            <div>
              <p className={`text-2xl font-black ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                {score}<span className="text-sm text-[var(--student-text-faint)] font-semibold">/{max}</span>
              </p>
              <p className={`text-xs font-bold uppercase tracking-wider mt-1 ${passed ? 'text-emerald-600' : 'text-red-500'}`}>
                {passed ? 'Passed' : 'Needs Improvement'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <Link
              href="/app/results"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border-light)] text-sm font-semibold text-[var(--student-text-secondary)] hover:bg-[var(--student-surface-hover)] transition-colors"
            >
              <IconArrowLeft size={14} />
              All Results
            </Link>
            <Link
              href="/app/tests"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
            >
              <IconTrendingUp size={14} />
              Attempt Again
            </Link>
          </div>
        </div>
      </div>

      <div className="space-y-4" id="review">
        <h2 className="text-lg font-bold text-[var(--student-text)]">Answer Review</h2>
        {rows.length === 0 ? (
          <div className="student-card p-8 text-center text-sm text-[var(--student-text-muted)]">
            No detailed answer data is available for this attempt.
          </div>
        ) : (
          rows.map(({ response, question, options }, index) => {
            if (!question) return null;
            const isCorrect = !!response.isCorrect;
            const chosen = response.selectedOptionId;
            return (
              <div key={response.id} className="student-card p-6">
                <div className="flex items-start justify-between gap-4">
                  <p className="text-sm font-semibold text-[var(--student-text)] leading-relaxed">
                    <span className="text-[var(--student-text-faint)] font-mono mr-2">Q{index + 1}.</span>
                    {question.title}
                  </p>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider flex-shrink-0 ${isCorrect ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>
                    {isCorrect ? <IconCheckCircle size={11} /> : <IconX size={11} />}
                    {Number(response.marksObtained || 0) > 0 ? `+${response.marksObtained}` : response.marksObtained}
                  </span>
                </div>

                <div className="mt-4 space-y-1.5">
                  {options.map((opt: any) => {
                    const isChosen = chosen === opt.id;
                    const isAnswer = opt.id === question.correctAnswer;
                    const state = isAnswer
                      ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                      : isChosen
                        ? 'border-red-300 bg-red-50 text-red-700'
                        : 'border-[var(--student-border-light)] text-[var(--student-text-muted)]';
                    return (
                      <div key={opt.id} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] ${state}`}>
                        <span className="font-mono font-bold">{opt.id.toUpperCase()}.</span>
                        <span className="font-medium">{opt.text}</span>
                        {isAnswer && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Correct</span>}
                        {isChosen && !isAnswer && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                {question.explanation && (
                  <p className="mt-3 text-xs text-[var(--student-text-muted)] leading-relaxed">
                    <b className="text-[var(--student-text-secondary)]">Explanation:</b> {question.explanation}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
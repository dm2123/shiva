import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { IconX, IconCheckCircle } from '@/components/student/StudentIcons';

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

export default async function StudentMistakeBookPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT DISTINCT r.questionId, r.selectedOptionId, r.isCorrect, r.attemptId, r.updatedAt,
            q.title, q.options, q.correctAnswer, q.explanation,
            s.name AS subjectName, t.title AS testTitle
       FROM AssessmentResponses r
       JOIN AssessmentAttempts att ON r.attemptId = att.id
       JOIN Questions q ON r.questionId = q.id
       JOIN Chapters ch ON q.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN Tests t ON att.assessmentId = t.id
      WHERE att.studentId = ? AND r.isCorrect = 0
      ORDER BY r.updatedAt DESC`,
    [session.userId]
  );

  const mistakes = (rows || []) as any[];
  const byTest = new Map<string, any[]>();
  for (const m of mistakes) {
    const list = byTest.get(m.testTitle) || [];
    list.push(m);
    byTest.set(m.testTitle, list);
  }
  let index = 0;

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Mistake Book"
        description="Review your past incorrect responses and revisit concepts to improve accuracy."
      />

      {mistakes.length === 0 ? (
        <StudentEmptyState
          icon={<IconX size={24} />}
          title="No Mistakes Logged Yet"
          description="Attempt tests and practice sets first. Incorrect responses will be automatically logged here for revision."
        />
      ) : (
        <div className="space-y-8">
          {Array.from(byTest.entries()).map(([testTitle, items]) => (
            <section key={testTitle} className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-[var(--student-text)]">{testTitle}</h2>
                <span className="text-[11px] font-bold text-red-500 uppercase tracking-widest">{items.length} mistakes</span>
              </div>

              {items.map((m) => {
                index += 1;
                const options = normalizeOptions(m.options);
                return (
                  <div key={`${m.attemptId}-${m.questionId}`} className="student-card p-6">
                    <p className="text-sm font-semibold text-[var(--student-text)] leading-relaxed">
                      <span className="text-[var(--student-text-faint)] font-mono mr-2">Q.</span>
                      {m.title}
                    </p>

                    <div className="mt-4 space-y-1.5">
                      {options.map((opt: any) => {
                        const isChosen = m.selectedOptionId === opt.id;
                        const isAnswer = opt.id === m.correctAnswer;
                        const state = isAnswer
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800'
                          : isChosen
                            ? 'border-red-300 bg-red-50 text-red-700'
                            : 'border-[var(--student-border-light)] text-[var(--student-text-muted)]';
                        return (
                          <div key={opt.id} className={`flex items-center gap-2 px-3.5 py-2.5 rounded-lg border text-[13px] ${state}`}>
                            <span className="font-mono font-bold">{opt.id.toUpperCase()}.</span>
                            <span className="font-medium">{opt.text}</span>
                            {isAnswer && <span className="ml-auto flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"><IconCheckCircle size={11} /> Correct</span>}
                            {isChosen && !isAnswer && <span className="ml-auto text-[10px] font-bold uppercase tracking-wider">Your Answer</span>}
                          </div>
                        );
                      })}
                    </div>

                    {m.explanation && (
                      <p className="mt-3 text-xs text-[var(--student-text-muted)] leading-relaxed">
                        <b className="text-[var(--student-text-secondary)]">Explanation:</b> {m.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
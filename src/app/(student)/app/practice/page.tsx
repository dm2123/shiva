import { headers } from 'next/headers';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader } from '@/components/student/StudentShared';
import PracticePlayer, { PracticeQuestion } from '@/components/student/PracticePlayer';

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

export default async function PracticePage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT q.id, q.title, q.type, q.options, q.correctAnswer, q.explanation, q.difficulty,
            s.name AS subjectName
       FROM Questions q
       JOIN Chapters ch ON q.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN StudentEnrollments e ON e.courseId = s.courseId AND e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY s.name, q.createdAt`,
    [session.userId]
  );

  const bySubject = new Map<string, PracticeQuestion[]>();
  for (const row of rows || []) {
    const options = normalizeOptions(row.options);
    if (options.length === 0) continue;
    const item: PracticeQuestion = {
      id: row.id,
      title: row.title,
      type: row.type,
      correctAnswer: row.correctAnswer,
      explanation: row.explanation,
      options,
    };
    const list = bySubject.get(row.subjectName) || [];
    list.push(item);
    bySubject.set(row.subjectName, list);
  }

  const groups = Array.from(bySubject.entries());

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Practice Zone"
        description="Sharpen your fundamentals with chapter-wise practice questions. Answers are revealed instantly."
      />

      {groups.length === 0 ? (
        <div className="student-card p-12 text-center">
          <p className="text-sm text-[var(--student-text-muted)]">
            No practice questions are available for your enrolled courses yet.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map(([subject, questions]) => (
            <section key={subject} className="space-y-4">
              <div className="flex items-end justify-between">
                <div>
                  <h2 className="text-lg font-bold text-[var(--student-text)]">{subject}</h2>
                  <p className="text-[11px] text-[var(--student-text-faint)] uppercase tracking-widest mt-0.5">
                    {questions.length} {questions.length === 1 ? 'question' : 'questions'}
                  </p>
                </div>
              </div>
              <PracticePlayer questions={questions} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentStatCard, StudentSection } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import PracticePlayer, { PracticeQuestion } from '@/components/student/PracticePlayer';
import { IconPencil, IconArrowRight, IconBook, IconCheckCircle, IconZap } from '@/components/student/StudentIcons';

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

const DIFFICULTY_META: Record<string, { label: string; classes: string }> = {
  EASY: { label: 'Easy', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  MEDIUM: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  HARD: { label: 'Hard', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  VERY_HARD: { label: 'Very Hard', classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
};

export default async function PracticePage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const [rows]: any = await mysqlPool.query(
    `SELECT q.id, q.title, q.type, q.options, q.correctAnswer, q.explanation, q.difficulty,
            s.name AS subjectName, ch.title AS chapterTitle
       FROM Questions q
       JOIN Chapters ch ON q.chapterId = ch.id
       JOIN Subjects s ON ch.subjectId = s.id
       JOIN StudentEnrollments e ON e.courseId = s.courseId AND e.studentId = ? AND e.status = 'ACTIVE'
      ORDER BY s.name, ch.sortOrder, q.createdAt`,
    [session.userId]
  );

  const bySubject = new Map<string, { questions: PracticeQuestion[]; chapters: Set<string>; difficulties: Record<string, number> }>();
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
    const entry = bySubject.get(row.subjectName) || { questions: [], chapters: new Set<string>(), difficulties: {} as Record<string, number> };
    entry.questions.push(item);
    if (row.chapterTitle) entry.chapters.add(row.chapterTitle);
    const d = String(row.difficulty || 'MEDIUM').toUpperCase();
    entry.difficulties[d] = (entry.difficulties[d] || 0) + 1;
    bySubject.set(row.subjectName, entry);
  }

  const groups = Array.from(bySubject.entries());
  const totalQuestions = groups.reduce((s, [, g]) => s + g.questions.length, 0);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Practice Zone"
        description="Chapter-wise practice questions with instant answers. Roz thoda practice = exam me bada confidence."
      />

      {groups.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
          <StudentStatCard
            label="Practice Questions"
            value={totalQuestions}
            icon={<IconPencil size={18} />}
          />
          <StudentStatCard
            label="Subjects"
            value={groups.length}
            icon={<IconBook size={18} />}
          />
          <div className="col-span-2 md:col-span-1">
            <StudentStatCard
              label="Chapters Covered"
              value={groups.reduce((s, [, g]) => s + g.chapters.size, 0)}
              icon={<IconCheckCircle size={18} />}
            />
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="space-y-6">
          <StudentEmptyState
            icon={<IconPencil size={28} />}
            title="Practice questions jald aa rahe hain"
            description="Hum tumhare enrolled courses ke liye chapter-wise practice questions bana rahe hain. Tab tak course lectures complete karo — practice usi par based hogi."
            variant="large"
          />
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center flex-shrink-0">
                <IconZap size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">Practice ka sahi tarika</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Pehle chapter ka lecture dekho, phir usi chapter ke questions solve karo.
                  Galat hue questions ko dobara karo — wahi asli learning hai.
                </p>
              </div>
              <Link
                href="/app/my-courses"
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity flex-shrink-0"
              >
                My Courses
                <IconArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {groups.map(([subject, data], idx) => (
            <StudentSection
              key={subject}
              title={subject}
              subtitle={`${data.questions.length} questions · ${data.chapters.size} chapters`}
            >
              {/* Difficulty breakdown pills */}
              <div className="flex flex-wrap gap-2">
                {Object.entries(data.difficulties).map(([d, count]) => {
                  const meta = DIFFICULTY_META[d] || DIFFICULTY_META.MEDIUM;
                  return (
                    <span key={d} className={`text-[11px] font-bold px-3 py-1.5 rounded-full ${meta.classes}`}>
                      {meta.label} · {count}
                    </span>
                  );
                })}
              </div>

              <div className="student-card p-4 md:p-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-indigo-500 to-violet-600" />
                <PracticePlayer questions={data.questions} />
              </div>

              {idx < groups.length - 1 && <div className="border-t border-[var(--student-border-light)]" />}
            </StudentSection>
          ))}
        </div>
      )}
    </div>
  );
}

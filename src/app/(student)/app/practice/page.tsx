import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { StudentPageHeader, StudentStatCard, StudentSection } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import PracticePlayer, { PracticeQuestion } from '@/components/student/PracticePlayer';
import { IconPencil, IconArrowRight, IconBook, IconCheckCircle, IconZap, IconClipboard } from '@/components/student/StudentIcons';

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

interface ChapterGroup {
  questions: PracticeQuestion[];
  difficulties: Record<string, number>;
}

interface SubjectGroup {
  chapters: Map<string, ChapterGroup>;
  total: number;
  difficulties: Record<string, number>;
}

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

  // Subject -> Chapter -> Questions (asal chapter data par grouping)
  const bySubject = new Map<string, SubjectGroup>();
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
    const subject = bySubject.get(row.subjectName) || {
      chapters: new Map<string, ChapterGroup>(),
      total: 0,
      difficulties: {} as Record<string, number>,
    };
    const chapterName = row.chapterTitle || 'General';
    const chapter = subject.chapters.get(chapterName) || { questions: [], difficulties: {} as Record<string, number> };
    chapter.questions.push(item);
    const d = String(row.difficulty || 'MEDIUM').toUpperCase();
    chapter.difficulties[d] = (chapter.difficulties[d] || 0) + 1;
    subject.difficulties[d] = (subject.difficulties[d] || 0) + 1;
    subject.chapters.set(chapterName, chapter);
    subject.total += 1;
    bySubject.set(row.subjectName, subject);
  }

  const groups = Array.from(bySubject.entries());
  const totalQuestions = groups.reduce((s, [, g]) => s + g.total, 0);
  const totalChapters = groups.reduce((s, [, g]) => s + g.chapters.size, 0);

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Practice Zone"
        description="Subject aur chapter-wise practice questions with instant answers. Roz thoda practice = exam me bada confidence."
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
              value={totalChapters}
              icon={<IconCheckCircle size={18} />}
            />
          </div>
        </div>
      )}

      {groups.length === 0 ? (
        <div className="space-y-6">
          <StudentEmptyState
            icon={<IconPencil size={22} />}
            title="Practice questions jald aa rahe hain"
            description="Hum tumhare enrolled courses ke liye chapter-wise practice questions bana rahe hain. Tab tak course lectures complete karo — practice usi par based hogi."
            actionText="My Courses"
            actionHref="/app/my-courses"
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
              subtitle={`${data.total} questions · ${data.chapters.size} chapters`}
            >
              {/* Subject-level difficulty breakdown */}
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

              {/* Chapter-wise practice sets */}
              <div className="space-y-6">
                {Array.from(data.chapters.entries()).map(([chapterName, chapter]) => (
                  <div key={chapterName} className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h3 className="text-sm font-bold text-[var(--student-text)]">{chapterName}</h3>
                      <span className="text-[11px] font-semibold text-[var(--student-text-faint)]">
                        {chapter.questions.length} questions
                      </span>
                      {Object.entries(chapter.difficulties).map(([d, count]) => {
                        const meta = DIFFICULTY_META[d] || DIFFICULTY_META.MEDIUM;
                        return (
                          <span key={d} className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${meta.classes}`}>
                            {meta.label} · {count}
                          </span>
                        );
                      })}
                    </div>
                    <div className="student-card p-4 md:p-6 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-[#6d28d9] to-[#2a1650]" />
                      <PracticePlayer questions={chapter.questions} />
                    </div>
                  </div>
                ))}
              </div>

              {idx < groups.length - 1 && <div className="border-t border-[var(--student-border-light)]" />}
            </StudentSection>
          ))}

          {/* Timed practice ke liye test series ki taraf */}
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center flex-shrink-0">
                <IconClipboard size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">Ab timer ke saath try karo</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Chapter practice ho gayi? Ab Mock Tests aur DPP se asal exam pressure me
                  apni speed aur accuracy check karo.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/app/tests"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6d28d9] to-[#2a1650] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Test Series
                  <IconArrowRight size={14} />
                </Link>
                <Link
                  href="/app/dpp"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] text-sm font-semibold hover:bg-[var(--student-surface-hover)] transition-colors"
                >
                  Daily DPP
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

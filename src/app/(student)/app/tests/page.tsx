import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';
import { StudentPageHeader, StudentStatCard } from '@/components/student/StudentShared';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconClipboard, IconArrowRight, IconClock, IconTarget,
  IconCheckCircle, IconZap, IconAward, IconPlay, IconTrendingUp,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

const DIFFICULTY_STYLES: Record<string, { label: string; classes: string }> = {
  EASY: { label: 'Easy', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  MEDIUM: { label: 'Medium', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  HARD: { label: 'Hard', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
};

/**
 * Category sections (test-series structure, THE SHIVA content).
 * Bucket asal `Tests.type` se banta hai ('mock' | 'pyq' | 'practice',
 * backend enum), fallback asal `Tests.category` text par. Dono khaali
 * hon to test 'General Tests' me jata hai — category invent nahi hoti.
 */
interface SectionDef {
  key: string;
  title: string;
  blurb: string;
}

const KNOWN_SECTIONS: Record<string, SectionDef> = {
  mock: {
    key: 'mock',
    title: 'Mock Tests',
    blurb: 'Full exam-pattern tests — asli exam jaisa mahaul, timer ke saath.',
  },
  pyq: {
    key: 'pyq',
    title: 'Previous Year Questions',
    blurb: 'Pichhle saalon ke asal paper-pattern wale tests — trend samjho, taiyaari pakki karo.',
  },
  practice: {
    key: 'practice',
    title: 'Practice Tests',
    blurb: 'Topic aur chapter level ki practice — kamzor hisse strong banao.',
  },
};

function bucketOf(test: any): SectionDef {
  const raw = String(test.type || test.category || '').trim().toLowerCase();
  if (raw) {
    if (raw.includes('pyq') || raw.includes('previous')) return KNOWN_SECTIONS.pyq;
    if (raw.includes('practice') || raw.includes('dpp')) return KNOWN_SECTIONS.practice;
    if (raw.includes('mock')) return KNOWN_SECTIONS.mock;
    const label = String(test.category || test.type).trim();
    return { key: `cat-${label.toLowerCase().replace(/\s+/g, '-')}`, title: label, blurb: 'Is category ke saare tests.' };
  }
  return { key: 'general', title: 'General Tests', blurb: 'Tumhare enrolled courses ke saare tests.' };
}

const SECTION_ORDER = ['mock', 'pyq', 'practice'];

type AttemptState =
  | { kind: 'not-attempted' }
  | { kind: 'in-progress'; attemptId: string }
  | { kind: 'completed'; bestScore: number; attemptCount: number; lastAttemptId: string };

export default async function TestsListPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  // Self-heal Tests.type/category (never throws) taaki grouping asal
  // backend data par ho — API route bhi yahi karta hai.
  await hasTestTypeColumns();

  // Sirf wahi columns select karo jo DB me asal me hain (type/category/
  // difficulty optional migrations se aate hain).
  let optionalCols = '';
  try {
    const [colRows]: any = await mysqlPool.query(
      `SELECT COLUMN_NAME AS name FROM information_schema.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'Tests'`
    );
    const cols = new Set<string>((colRows || []).map((r: any) => String(r.name)));
    for (const c of ['type', 'category', 'difficulty']) {
      if (cols.has(c)) optionalCols += `, t.\`${c}\``;
    }
  } catch { /* optional columns best-effort */ }

  const [rows]: any = await mysqlPool.query(
    `SELECT t.id, t.title, t.description, t.durationMinutes, t.totalMarks, t.passingMarks, t.status${optionalCols},
            c.title AS courseTitle,
            (SELECT COUNT(*) FROM Questions q
               JOIN Chapters ch ON q.chapterId = ch.id
               JOIN Subjects s ON ch.subjectId = s.id
             WHERE s.courseId = t.courseId) AS questionCount
       FROM Tests t
       JOIN Courses c ON t.courseId = c.id
       JOIN StudentEnrollments e ON e.courseId = t.courseId AND e.studentId = ? AND e.status = 'ACTIVE'
      WHERE t.status = 'PUBLISHED'
      ORDER BY t.createdAt DESC`,
    [session.userId]
  );

  const tests = rows || [];

  // Is student ke asal attempts — per-test state (Not Attempted /
  // In Progress / Completed + best score) sirf isi data se banta hai.
  const stateByTest = new Map<string, AttemptState>();
  try {
    const [attemptRows]: any = await mysqlPool.query(
      `SELECT id, assessmentId, status, score, startedAt
         FROM AssessmentAttempts
        WHERE studentId = ?
        ORDER BY startedAt DESC`,
      [session.userId]
    );
    const byTest = new Map<string, any[]>();
    for (const a of attemptRows || []) {
      const list = byTest.get(a.assessmentId) || [];
      list.push(a);
      byTest.set(a.assessmentId, list);
    }
    for (const [testId, list] of byTest) {
      const inProgress = list.find((a: any) => a.status === 'STARTED');
      const completed = list.filter((a: any) => a.status === 'EVALUATED' || a.status === 'COMPLETED');
      if (completed.length > 0) {
        stateByTest.set(testId, {
          kind: 'completed',
          bestScore: Math.max(...completed.map((a: any) => Number(a.score || 0))),
          attemptCount: completed.length,
          lastAttemptId: completed[0].id,
        });
      } else if (inProgress) {
        stateByTest.set(testId, { kind: 'in-progress', attemptId: inProgress.id });
      }
    }
  } catch { /* attempt state best-effort — list bina state ke bhi chalegi */ }

  // Category sections me group karo
  const sectionMap = new Map<string, { def: SectionDef; tests: any[] }>();
  for (const t of tests) {
    const def = bucketOf(t);
    const entry = sectionMap.get(def.key) || { def, tests: [] };
    entry.tests.push(t);
    sectionMap.set(def.key, entry);
  }
  const sections = Array.from(sectionMap.values()).sort((a, b) => {
    const ia = SECTION_ORDER.indexOf(a.def.key);
    const ib = SECTION_ORDER.indexOf(b.def.key);
    return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
  });

  const totalQuestions = tests.reduce((sum: number, t: any) => sum + Number(t.questionCount || 0), 0);
  const completedCount = tests.filter((t: any) => stateByTest.get(t.id)?.kind === 'completed').length;
  const inProgressCount = tests.filter((t: any) => stateByTest.get(t.id)?.kind === 'in-progress').length;

  return (
    <div className="space-y-8">
      <StudentPageHeader
        title="Test Series"
        description="Mock Tests, PYQ aur Practice — category-wise test series. Attempt karne se pehle syllabus complete karo — har test tumhari taiyaari ka asli aaina hai."
      />

      {tests.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-5">
          <StudentStatCard
            label="Available Tests"
            value={tests.length}
            icon={<IconClipboard size={18} />}
          />
          <StudentStatCard
            label="Completed"
            value={completedCount}
            icon={<IconCheckCircle size={18} />}
          />
          <StudentStatCard
            label="In Progress"
            value={inProgressCount}
            icon={<IconClock size={18} />}
          />
          <StudentStatCard
            label="Total Questions"
            value={totalQuestions}
            icon={<IconTarget size={18} />}
          />
        </div>
      )}

      {tests.length === 0 ? (
        <div className="space-y-6">
          <StudentEmptyState
            icon={<IconClipboard size={22} />}
            title="Abhi koi test nahi hai"
            description="Hum exam-pattern tests taiyaar kar rahe hain. Jaise hi publish honge, yahan category-wise dikhenge — tab tak Practice Zone me apne fundamentals strong karo."
            actionText="Practice Zone"
            actionHref="/app/practice"
            variant="large"
          />
          <div className="student-card p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-center gap-5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center flex-shrink-0">
                <IconZap size={22} className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-[var(--student-text)]">Tab tak kya karo?</h3>
                <p className="text-sm text-[var(--student-text-muted)] mt-1 leading-relaxed">
                  Practice Zone me chapter-wise questions solve karo aur DPP se roz ki
                  practice pakki karo. Strong basics = high mock scores.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 flex-shrink-0">
                <Link
                  href="/app/practice"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--student-primary)] text-white text-sm font-bold hover:opacity-90 transition-opacity"
                >
                  Practice Zone
                  <IconArrowRight size={14} />
                </Link>
                <Link
                  href="/app/dpp"
                  className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--student-border)] text-[var(--student-text)] text-sm font-semibold hover:bg-[var(--student-surface-hover)] transition-colors"
                >
                  DPP Dekho
                </Link>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {/* Category tabs (anchor navigation) */}
          {sections.length > 1 && (
            <nav className="flex flex-wrap gap-2" aria-label="Test categories">
              {sections.map(({ def, tests: list }) => (
                <a
                  key={def.key}
                  href={`#tests-${def.key}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--student-border)] bg-[var(--student-surface)] text-sm font-semibold text-[var(--student-text-secondary)] hover:border-[#6d28d9] hover:text-[#6d28d9] transition-colors"
                >
                  {def.title}
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-[#6d28d9]/10 text-[#6d28d9]">
                    {list.length}
                  </span>
                </a>
              ))}
            </nav>
          )}

          {sections.map(({ def, tests: list }) => (
            <section key={def.key} id={`tests-${def.key}`} className="space-y-5 scroll-mt-24">
              <div>
                <h2 className="text-xl font-bold text-[var(--student-text)] tracking-tight">{def.title}</h2>
                <p className="text-xs text-[var(--student-text-faint)] mt-1 font-medium">
                  {def.blurb} · {list.length} test{list.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {list.map((test: any) => {
                  const diff = test.difficulty ? DIFFICULTY_STYLES[String(test.difficulty).toUpperCase()] : undefined;
                  const state: AttemptState = stateByTest.get(test.id) || { kind: 'not-attempted' };
                  return (
                    <div
                      key={test.id}
                      className="student-card overflow-hidden flex flex-col hover:border-[#6d28d9] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group"
                    >
                      {/* Card top accent */}
                      <div className="h-1.5 bg-gradient-to-r from-[#2a1650] via-[#6d28d9] to-[#f5b942]" />

                      <div className="p-5 md:p-6 flex flex-col gap-4 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-[#6d28d9] to-[#2a1650] flex items-center justify-center flex-shrink-0 shadow-md shadow-[#6d28d9]/20">
                            <IconTarget size={18} className="text-white" />
                          </div>
                          <div className="flex flex-col items-end gap-1.5">
                            {state.kind === 'completed' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                                <IconCheckCircle size={11} />
                                Completed · Best {state.bestScore}
                              </span>
                            )}
                            {state.kind === 'in-progress' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                                <IconClock size={11} />
                                In Progress
                              </span>
                            )}
                            {state.kind === 'not-attempted' && (
                              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider bg-[var(--student-surface-hover)] text-[var(--student-text-muted)]">
                                Not Attempted
                              </span>
                            )}
                            {diff && (
                              <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${diff.classes}`}>
                                {diff.label}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex-1">
                          <Link href={`/app/tests/${test.id}`} className="block">
                            <h3 className="font-bold text-[var(--student-text)] leading-snug group-hover:text-[#6d28d9] transition-colors">
                              {test.title}
                            </h3>
                          </Link>
                          <p className="text-[11px] text-[var(--student-text-faint)] mt-1 uppercase tracking-wider font-medium">
                            {test.courseTitle}
                          </p>
                          {test.description && (
                            <p className="text-xs text-[var(--student-text-muted)] mt-2 line-clamp-2 leading-relaxed">
                              {test.description}
                            </p>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-center">
                          <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                            <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                              <IconClock size={12} />
                            </div>
                            <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.durationMinutes}m</p>
                            <p className="text-[10px] text-[var(--student-text-faint)]">Duration</p>
                          </div>
                          <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                            <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                              <IconCheckCircle size={12} />
                            </div>
                            <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.questionCount}</p>
                            <p className="text-[10px] text-[var(--student-text-faint)]">Questions</p>
                          </div>
                          <div className="rounded-xl bg-[var(--student-surface)] border border-[var(--student-border-light)] py-2.5 px-1">
                            <div className="flex items-center justify-center gap-1 text-[var(--student-text-muted)]">
                              <IconAward size={12} />
                            </div>
                            <p className="text-xs font-bold text-[var(--student-text)] mt-1">{test.totalMarks}</p>
                            <p className="text-[10px] text-[var(--student-text-faint)]">Marks</p>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 pt-1">
                          <span className="text-[11px] text-[var(--student-text-faint)]">
                            {state.kind === 'completed'
                              ? `${state.attemptCount} attempt${state.attemptCount !== 1 ? 's' : ''} · Passing: ${test.passingMarks ?? '—'}`
                              : test.passingMarks ? `Passing: ${test.passingMarks} marks` : 'Full syllabus test'}
                          </span>
                          {state.kind === 'in-progress' ? (
                            <Link
                              href={`/app/tests/${test.id}/attempt/${state.attemptId}`}
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-amber-600 hover:text-amber-700"
                            >
                              <IconPlay size={14} />
                              Resume
                            </Link>
                          ) : state.kind === 'completed' ? (
                            <span className="inline-flex items-center gap-3">
                              <Link
                                href={`/app/results/${state.lastAttemptId}`}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 hover:text-emerald-700"
                              >
                                <IconTrendingUp size={14} />
                                Result
                              </Link>
                              <Link
                                href={`/app/tests/${test.id}`}
                                className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6d28d9]"
                              >
                                Re-attempt
                                <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                              </Link>
                            </span>
                          ) : (
                            <Link
                              href={`/app/tests/${test.id}`}
                              className="inline-flex items-center gap-1.5 text-sm font-bold text-[#6d28d9]"
                            >
                              Start Test
                              <IconArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

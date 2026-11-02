import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import {
  IconClipboard, IconArrowRight, IconClock, IconTarget,
  IconCheckCircle, IconPlay, IconTrendingUp,
  IconBook, IconRefresh, IconShield, IconPlus,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

/* ------------------------------------------------------------------ */
/* THE SHIVA — Tests list (student)                                    */
/* PW test-row anatomy: bold title → meta line (questions • marks •    */
/* duration • attempts, jo asal ho wahi) → 'View Syllabus' link        */
/* (detail page par asal syllabus breakup hai) → violet gol start      */
/* button. Compact rows — bade khaali cards nahi. Style dashboard v2   */
/* wale tokens: safed cards, radius 12px, patli border, violet         */
/* #6d28d9 accent. Data/queries neeche bilkul pehle jaise hain.        */
/* ------------------------------------------------------------------ */

const CARD =
  'rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
const SECTION_TITLE = 'text-[17px] font-bold leading-snug text-gray-900';

const DIFFICULTY_STYLES: Record<string, { label: string; classes: string }> = {
  EASY: { label: 'Easy', classes: 'bg-emerald-100 text-emerald-700' },
  MEDIUM: { label: 'Medium', classes: 'bg-amber-100 text-amber-700' },
  HARD: { label: 'Hard', classes: 'bg-red-100 text-red-700' },
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

  const stats = [
    { label: 'Available Tests', value: tests.length, icon: <IconClipboard size={17} /> },
    { label: 'Completed', value: completedCount, icon: <IconCheckCircle size={17} /> },
    { label: 'In Progress', value: inProgressCount, icon: <IconClock size={17} /> },
    { label: 'Total Questions', value: totalQuestions, icon: <IconTarget size={17} /> },
  ];

  return (
    <div className="space-y-7">
      {/* Header */}
      <div>
        <h1 className="text-[22px] font-extrabold tracking-tight text-gray-900 md:text-2xl">
          Test Series
        </h1>
        <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-500">
          Mock Tests, PYQ aur Practice — category-wise. Har test tumhari taiyaari ka asli
          aaina hai.
        </p>
      </div>

      {/* Stats — ek compact strip (asal ginti hi) */}
      {tests.length > 0 && (
        <div className={`${CARD} grid grid-cols-2 gap-x-4 gap-y-4 p-4 lg:grid-cols-4`}>
          {stats.map((s) => (
            <div key={s.label} className="flex items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#6d28d9]/10 text-[#6d28d9]">
                {s.icon}
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-extrabold leading-tight text-gray-900">{s.value}</span>
                <span className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  {s.label}
                </span>
              </span>
            </div>
          ))}
        </div>
      )}

      {tests.length === 0 ? (
        <StudentEmptyState
          icon={<IconClipboard size={22} />}
          title="Abhi koi test nahi hai"
          description="Hum exam-pattern tests taiyaar kar rahe hain — publish hote hi yahan category-wise dikhenge. Tab tak Practice Zone me chapter-wise questions solve karo aur DPP se roz ki practice pakki karo: strong basics = high mock scores."
          actionText="Practice Zone"
          actionHref="/app/practice"
          secondaryActionText="DPP Dekho"
          secondaryActionHref="/app/dpp"
          variant="compact"
        />
      ) : (
        <div className="space-y-8">
          {/* Category chips (anchor navigation) */}
          {sections.length > 1 && (
            <nav className="flex flex-wrap gap-2" aria-label="Test categories">
              {sections.map(({ def, tests: list }) => (
                <a
                  key={def.key}
                  href={`#tests-${def.key}`}
                  className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-[13px] font-semibold text-gray-600 transition hover:border-[#6d28d9] hover:text-[#6d28d9]"
                >
                  {def.title}
                  <span className="rounded-full bg-[#6d28d9]/10 px-1.5 py-0.5 text-[11px] font-bold text-[#6d28d9]">
                    {list.length}
                  </span>
                </a>
              ))}
            </nav>
          )}

          {sections.map(({ def, tests: list }) => (
            <section key={def.key} id={`tests-${def.key}`} className="scroll-mt-24 space-y-3">
              <div>
                <h2 className={SECTION_TITLE}>{def.title}</h2>
                <p className="mt-0.5 text-xs font-medium text-gray-500">
                  {def.blurb} · {list.length} test{list.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="space-y-3">
                {list.map((test: any) => {
                  const diff = test.difficulty ? DIFFICULTY_STYLES[String(test.difficulty).toUpperCase()] : undefined;
                  const state: AttemptState = stateByTest.get(test.id) || { kind: 'not-attempted' };
                  const meta: string[] = [
                    `${test.questionCount} Questions`,
                    `${test.totalMarks} Marks`,
                    `${test.durationMinutes} min`,
                  ];
                  if (state.kind === 'completed') {
                    meta.push(`${state.attemptCount} attempt${state.attemptCount !== 1 ? 's' : ''}`);
                    meta.push(`Best ${state.bestScore}`);
                  } else if (state.kind === 'in-progress') {
                    meta.push('Attempt chal raha hai');
                  }
                  const actionHref =
                    state.kind === 'in-progress'
                      ? `/app/tests/${test.id}/attempt/${state.attemptId}`
                      : `/app/tests/${test.id}`;
                  const actionLabel =
                    state.kind === 'in-progress' ? 'Resume' : state.kind === 'completed' ? 'Details' : 'Start';
                  return (
                    <div key={test.id} className={`${CARD} flex items-start gap-3 p-4 transition hover:border-[#6d28d9]/40 hover:shadow-md sm:gap-4`}>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[#6d28d9]/10 text-[#6d28d9]">
                        <IconTarget size={18} />
                      </span>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                          <Link
                            href={`/app/tests/${test.id}`}
                            className="text-[15px] font-bold leading-snug text-gray-900 transition-colors hover:text-[#6d28d9]"
                          >
                            {test.title}
                          </Link>
                          {state.kind === 'completed' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                              <IconCheckCircle size={10} />
                              Completed
                            </span>
                          )}
                          {state.kind === 'in-progress' && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                              <IconClock size={10} />
                              In Progress
                            </span>
                          )}
                          {state.kind === 'not-attempted' && (
                            <span className="rounded-full bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                              Not Attempted
                            </span>
                          )}
                          {diff && (
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${diff.classes}`}>
                              {diff.label}
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs font-medium text-gray-500">
                          {meta.join(' • ')}
                        </p>
                        <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                          {test.courseTitle}
                        </p>
                        {test.description && (
                          <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-gray-500">
                            {test.description}
                          </p>
                        )}

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                          <Link
                            href={`/app/tests/${test.id}`}
                            className="text-xs font-bold text-[#6d28d9] hover:underline"
                          >
                            View Syllabus
                          </Link>
                          {test.passingMarks ? (
                            <span className="text-[11px] text-gray-400">Passing: {test.passingMarks} marks</span>
                          ) : null}
                          {state.kind === 'completed' && (
                            <Link
                              href={`/app/results/${state.lastAttemptId}`}
                              className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                            >
                              <IconTrendingUp size={12} />
                              Result Dekho
                            </Link>
                          )}
                        </div>
                      </div>

                      {/* PW-style gol action button */}
                      <div className="flex shrink-0 flex-col items-center gap-1">
                        <Link
                          href={actionHref}
                          aria-label={`${test.title} — ${actionLabel}`}
                          className="flex h-10 w-10 items-center justify-center rounded-full bg-[#6d28d9] text-white shadow-sm transition hover:bg-[#5b21b6]"
                        >
                          {state.kind === 'not-attempted' ? <IconPlay size={15} /> : <IconArrowRight size={15} />}
                        </Link>
                        <span className="text-[10px] font-bold text-gray-500">{actionLabel}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>
      )}

      {/* ── Common Benefits (asal platform features — test detail/attempt flow se verified) ── */}
      <section className="space-y-3">
        <div>
          <h2 className={SECTION_TITLE}>Har Test Ke Saath</h2>
          <p className="mt-0.5 text-xs font-medium text-gray-500">
            Ye features THE SHIVA ke har published test par lagu hote hain.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <IconClock size={18} />,
              title: 'Real Exam Timer',
              text: 'Timer test khulte hi shuru hota hai aur samay khatam hone par test apne aap submit ho jata hai — bilkul asli exam jaisa.',
            },
            {
              icon: <IconTrendingUp size={18} />,
              title: 'Detailed Analysis',
              text: 'Submit ke baad score, accuracy aur topic-wise strong/weak areas ke saath poora analysis milta hai.',
            },
            {
              icon: <IconBook size={18} />,
              title: 'Syllabus Coverage',
              text: 'Har test ke detail page par subject aur chapter-wise question breakup pehle se dikhta hai.',
            },
            {
              icon: <IconRefresh size={18} />,
              title: 'Re-attempt Anytime',
              text: 'Ek hi test dobara attempt karo — tumhara best score track hota hai, progress kabhi nahi kho ti.',
            },
          ].map((b) => (
            <div key={b.title} className={`${CARD} p-4`}>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#6d28d9]/10 text-[#6d28d9]">
                {b.icon}
              </span>
              <h3 className="mt-2.5 text-[13.5px] font-bold text-gray-900">{b.title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-gray-500">{b.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ (honest — sirf asal test behaviour par) ── */}
      <section className="space-y-3">
        <div>
          <h2 className={SECTION_TITLE}>Aksar Poochhe Jaane Wale Sawal</h2>
          <p className="mt-0.5 text-xs font-medium text-gray-500">Test dene se pehle ye jaan lo.</p>
        </div>
        <div className="space-y-2.5">
          {[
            {
              q: 'Test ka timer kaise kaam karta hai?',
              a: 'Jaise hi tum test kholte ho, timer shuru ho jata hai. Samay khatam hone par test apne aap submit ho jata hai, isliye time management asli exam ki tarah hi rakho.',
            },
            {
              q: 'Kya negative marking hoti hai?',
              a: 'Har test ki apni configured marking hoti hai — galat jawab par negative marks usi hisaab se lagte hain jo test me set hai. Har test ke detail page par total marks aur passing marks pehle se dikhte hain.',
            },
            {
              q: 'Result aur analysis kahan milega?',
              a: 'Submit karte hi tumhe score ke saath detailed analysis milta hai. Purane attempts ke results is page par Completed test ke "Result Dekho" link se, ya Results section se, kabhi bhi dekhe ja sakte hain.',
            },
            {
              q: 'Kya main ek hi test dobara de sakta hoon?',
              a: 'Haan. Completed test par dobara attempt ka option detail page par milta hai. Tumhare saare attempts save rehte hain aur best score alag se track hota hai.',
            },
            {
              q: 'Beech me internet chala jaye to kya hoga?',
              a: 'Tumhara attempt "In Progress" state me rehta hai. Wapas aakar is page se ya test ke detail page se "Resume" karke wahi se aage badh sakte ho.',
            },
          ].map((item) => (
            <details key={item.q} className={`${CARD} group`}>
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
                <span className="text-[13.5px] font-bold text-gray-900">{item.q}</span>
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#6d28d9]/10 text-[#6d28d9] transition-transform group-open:rotate-45">
                  <IconPlus size={12} />
                </span>
              </summary>
              <p className="px-4 pb-4 text-[13px] leading-relaxed text-gray-500">{item.a}</p>
            </details>
          ))}
        </div>
        <p className="flex items-center gap-1.5 text-[11px] text-gray-400">
          <IconShield size={13} className="shrink-0 text-[#f5b942]" />
          Sawaal bacha hai? Test ke detail page par instructions padho, ya Doubts section me apna sawaal poochho.
        </p>
      </section>
    </div>
  );
}

import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import { hasTestTypeColumns } from '@/lib/ensure-test-schema';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import { deriveExamCategory, type ExamCategory } from '@/lib/exam-category';
import {
  IconClipboard, IconArrowRight, IconClock, IconTarget,
  IconCheckCircle, IconPlay, IconTrendingUp, IconPieChart,
  IconBook, IconRefresh, IconShield, IconPlus,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

/* ------------------------------------------------------------------ */
/* THE SHIVA — Tests list (student)                                    */
/* Upar PW tarz ka dark banner (T1): heading student ke asal goal      */
/* (StudentProfiles.targetExam) se — "Test Series for <Exam> Exams";    */
/* goal na ho to sirf "Test Series". Subtitle imaandaar hai (tests      */
/* enrolled courses ke saath shamil hain — koi pass product nahi hai,   */
/* isliye pass wala daava NAHI). PW par stats strip nahi hai — hatayi.  */
/* Banner ke neeche exam chips (T2): asal tests ke courses se           */
/* deriveExamCategory() se bane exams hi; selected = kaala pill,        */
/* click par ?exam= se asal filter. Category sections neeche bane hain. */
/* PW Test Series card anatomy (bade cards): pastel thumbnail tile     */
/* (upar-left chhota type badge) → bold title → meta line              */
/* `N Mins • N Marks • N Questions` (asal fields hi) → buttons row:    */
/* kaala Start/Resume/Details pill + outline 'View Syllabus' pill      */
/* (detail page par asal syllabus breakup hai). Neeche PW 'Common      */
/* Benefits' pattern ke center icon cards. Style wave-A/B tokens:      */
/* safed cards, radius 16px, patli border, violet #6d28d9 accent.      */
/* Data/queries neeche bilkul pehle jaise hain.                        */
/* ------------------------------------------------------------------ */

const CARD =
  'rounded-2xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]';
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

/* PW card ke pastel thumbnail tile ke liye test ka prakar — asal
   Tests.type/category se hi (bucketOf wali hi soch, tile ke liye). */
type TestKindKey = 'mock' | 'pyq' | 'practice' | 'general';

function kindOf(test: any): TestKindKey {
  const raw = String(test.type || test.category || '').trim().toLowerCase();
  if (raw.includes('pyq') || raw.includes('previous')) return 'pyq';
  if (raw.includes('practice') || raw.includes('dpp')) return 'practice';
  if (raw.includes('mock')) return 'mock';
  return 'general';
}

const KIND_BADGE: Record<TestKindKey, string> = {
  mock: 'Mock',
  pyq: 'PYQ',
  practice: 'Practice',
  general: 'Test',
};

/* Pastel tile ke rang — PW Test Series palette ke paas (pink/sky/mint/lavender) */
const TILE_STYLES: Record<TestKindKey, { tile: string; icon: string }> = {
  mock: { tile: 'bg-[#ffe3ee]', icon: 'text-rose-500' },
  pyq: { tile: 'bg-[#e0f2fe]', icon: 'text-sky-600' },
  practice: { tile: 'bg-[#dcf5e3]', icon: 'text-emerald-600' },
  general: { tile: 'bg-[#ece7ff]', icon: 'text-[#6d28d9]' },
};

type AttemptState =
  | { kind: 'not-attempted' }
  | { kind: 'in-progress'; attemptId: string }
  | { kind: 'completed'; bestScore: number; attemptCount: number; lastAttemptId: string };

export default async function TestsListPage({
  searchParams,
}: {
  searchParams?: { exam?: string | string[] };
}) {
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
            c.title AS courseTitle, c.slug AS courseSlug,
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

  // Banner heading (T1) — student ke asal goal (StudentProfiles.
  // targetExam, free-text) se. deriveExamCategory se saaf exam-naam
  // nikalo ("SSC CGL 2026" → "SSC"); match na mile to asal text hi.
  let targetExam = '';
  try {
    const [profileRows]: any = await mysqlPool.query(
      'SELECT targetExam FROM StudentProfiles WHERE userId = ? LIMIT 1',
      [session.userId]
    );
    targetExam = String(profileRows?.[0]?.targetExam || '').trim();
  } catch { /* goal best-effort — banner aam roop me banega */ }
  const goalExam = targetExam ? deriveExamCategory({ title: targetExam }) : null;
  const bannerTitle = targetExam
    ? `Test Series for ${goalExam?.label || targetExam} Exams`
    : 'Test Series';

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

  // ── Exam chips (T2) — asal tests ke courses se derived categories.
  // Sirf woh exams chip bante hain jinke asal tests is student ke paas
  // hain; jiska course koi category na de, woh test sirf "All" me
  // dikhta hai (chip invent nahi hoti).
  const examByTestId = new Map<string, ExamCategory>();
  const examMap = new Map<string, { cat: ExamCategory; count: number; first: number }>();
  tests.forEach((t: any, i: number) => {
    const cat = deriveExamCategory({ title: t.courseTitle, slug: t.courseSlug });
    if (!cat) return;
    examByTestId.set(t.id, cat);
    const entry = examMap.get(cat.id);
    if (entry) entry.count += 1;
    else examMap.set(cat.id, { cat, count: 1, first: i });
  });
  const examChips = Array.from(examMap.values()).sort(
    (a, b) => b.count - a.count || a.first - b.first
  );
  const examParam = Array.isArray(searchParams?.exam) ? searchParams.exam[0] : searchParams?.exam;
  const selectedExam =
    examParam && examMap.has(examParam) ? examMap.get(examParam)!.cat : null;
  const visibleTests = selectedExam
    ? tests.filter((t: any) => examByTestId.get(t.id)?.id === selectedExam.id)
    : tests;

  // Category sections me group karo (filter ke baad bachi list par)
  const sectionMap = new Map<string, { def: SectionDef; tests: any[] }>();
  for (const t of visibleTests) {
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

  return (
    <div className="space-y-7">
      {/* ── Dark banner (T1, PW tarz) — heading asal goal se, subtitle
             imaandaar: tests enrolled courses ke saath shamil hain,
             koi pass product nahi hai isliye pass ka daava nahi. ── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#150b2e] via-[#241145] to-[#3a1470] px-5 py-6 text-white sm:px-7 sm:py-8">
        <div
          className="pointer-events-none absolute -right-10 -top-14 h-44 w-44 rounded-full bg-white/5"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute -bottom-16 right-24 h-36 w-36 rounded-full bg-[#6d28d9]/25"
          aria-hidden="true"
        />
        <div className="relative flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h1 className="text-[24px] font-extrabold leading-tight tracking-tight md:text-[30px]">
              {bannerTitle}
            </h1>
            <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/75">
              Mock Tests, PYQ aur Practice — ye saare tests tumhare enrolled courses ke
              saath shamil hain, alag se kuch kharidna nahi hai.
            </p>
          </div>
          <span className="hidden h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-white sm:flex" aria-hidden="true">
            <IconClipboard size={24} />
          </span>
        </div>
      </div>

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
          {/* Exam chips (T2) — asal filter (?exam=), selected = kaala
              pill + safed text; chips sirf un exams ke jinke asal
              tests hain. Category grouping neeche sections me hai. */}
          {examChips.length > 0 && (
            <nav className="flex flex-wrap gap-2" aria-label="Exam filter">
              <Link
                href="/app/tests"
                aria-current={!selectedExam ? 'page' : undefined}
                className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                  !selectedExam
                    ? 'border-gray-900 bg-gray-900 text-white'
                    : 'border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                }`}
              >
                All Tests
              </Link>
              {examChips.map(({ cat }) => {
                const active = selectedExam?.id === cat.id;
                return (
                  <Link
                    key={cat.id}
                    href={`/app/tests?exam=${cat.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center rounded-full border px-4 py-2 text-[13px] font-semibold transition ${
                      active
                        ? 'border-gray-900 bg-gray-900 text-white'
                        : 'border-gray-200 bg-white text-gray-600 hover:border-gray-900 hover:text-gray-900'
                    }`}
                  >
                    {cat.label}
                  </Link>
                );
              })}
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
                  /* PW meta line — asal fields hi, PW ke kram me:
                     samay (Mins) • kul marks • sawal */
                  const meta: string[] = [
                    `${test.durationMinutes} Mins`,
                    `${test.totalMarks} Marks`,
                    `${test.questionCount} Questions`,
                  ];
                  if (state.kind === 'completed') {
                    meta.push(`${state.attemptCount} attempt${state.attemptCount !== 1 ? 's' : ''}`);
                    meta.push(`Best ${state.bestScore}`);
                  } else if (state.kind === 'in-progress') {
                    meta.push('Attempt chal raha hai');
                  }
                  const kind = kindOf(test);
                  const tile = TILE_STYLES[kind];
                  const actionHref =
                    state.kind === 'in-progress'
                      ? `/app/tests/${test.id}/attempt/${state.attemptId}`
                      : `/app/tests/${test.id}`;
                  const actionLabel =
                    state.kind === 'in-progress' ? 'Resume' : state.kind === 'completed' ? 'Details' : 'Start';
                  return (
                    <div key={test.id} className={`${CARD} p-5 transition hover:border-[#6d28d9]/40 hover:shadow-md`}>
                      <div className="flex items-start gap-4">
                        {/* Pastel thumbnail tile — upar-left type badge (PW anatomy) */}
                        <div
                          className={`relative flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl sm:h-28 sm:w-28 ${tile.tile}`}
                          aria-hidden="true"
                        >
                          <span className="absolute left-2 top-2 rounded-md bg-[#e11d48] px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white">
                            {KIND_BADGE[kind]}
                          </span>
                          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/85 shadow-sm">
                            <span className={tile.icon}>
                              <IconClipboard size={24} />
                            </span>
                          </span>
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <Link
                              href={`/app/tests/${test.id}`}
                              className="text-[16px] font-bold leading-snug text-gray-900 transition-colors hover:text-[#6d28d9]"
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

                          <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">
                            {test.courseTitle}
                          </p>
                          <p className="mt-1.5 text-[13px] font-semibold text-gray-600">
                            {meta.join(' • ')}
                          </p>
                          {test.description && (
                            <p className="mt-1 line-clamp-1 text-xs leading-relaxed text-gray-500">
                              {test.description}
                            </p>
                          )}

                          {/* Buttons — kaala primary pill + outline Syllabus pill (PW) */}
                          <div className="mt-3.5 flex flex-wrap items-center gap-2.5">
                            <Link
                              href={actionHref}
                              aria-label={`${test.title} — ${actionLabel}`}
                              className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-black"
                            >
                              {state.kind === 'not-attempted' ? <IconPlay size={13} /> : <IconArrowRight size={13} />}
                              {actionLabel}
                            </Link>
                            <Link
                              href={`/app/tests/${test.id}`}
                              className="inline-flex items-center rounded-full border border-gray-300 bg-white px-4 py-2.5 text-[13px] font-bold text-gray-700 transition hover:border-[#6d28d9] hover:text-[#6d28d9]"
                            >
                              View Syllabus
                            </Link>
                            {state.kind === 'completed' && (
                              <Link
                                href={`/app/results/${state.lastAttemptId}`}
                                className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 hover:underline"
                              >
                                <IconTrendingUp size={12} />
                                Result Dekho
                              </Link>
                            )}
                            {test.passingMarks ? (
                              <span className="text-[11px] text-gray-400">Passing: {test.passingMarks} marks</span>
                            ) : null}
                          </div>
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

      {/* ── Common Benefits — PW pattern: center heading + bade center
             icon cards. Saare features asal hain (attempt flow, results
             analysis aur Questions.explanation se verified). ── */}
      <section className="space-y-4">
        <div className="text-center">
          <h2 className="text-[19px] font-extrabold leading-snug text-gray-900">Common Benefits</h2>
          <p className="mt-1 text-xs font-medium text-gray-500">
            Ye features THE SHIVA ke har published test par lagu hote hain.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: <IconTarget size={22} />,
              tile: 'bg-[#ffe3ee] text-rose-500',
              title: 'Real Exam Pattern',
              text: 'Timer test khulte hi shuru hota hai aur samay khatam hone par test apne aap submit ho jata hai — bilkul asli exam jaisa mahaul.',
            },
            {
              icon: <IconPieChart size={22} />,
              tile: 'bg-[#e0f2fe] text-sky-600',
              title: 'Detailed Analysis',
              text: 'Submit ke baad score, accuracy aur topic-wise strong/weak areas ke saath poora analysis milta hai.',
            },
            {
              icon: <IconBook size={22} />,
              tile: 'bg-[#dcf5e3] text-emerald-600',
              title: 'Har Sawal ka Hal',
              text: 'Har sawal ke saath uski vyakhya (explanation) milti hai — galti sirf ginai nahi jaati, samjhai bhi jaati hai.',
            },
            {
              icon: <IconRefresh size={22} />,
              tile: 'bg-[#ece7ff] text-[#6d28d9]',
              title: 'Re-attempt Anytime',
              text: 'Ek hi test dobara attempt karo — saare attempts save rehte hain aur tumhara best score track hota hai.',
            },
          ].map((b) => (
            <div key={b.title} className={`${CARD} p-5 text-center`}>
              <span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${b.tile}`}>
                {b.icon}
              </span>
              <h3 className="mt-3 text-[14px] font-bold text-gray-900">{b.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-gray-500">{b.text}</p>
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

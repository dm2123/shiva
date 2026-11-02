import { headers } from 'next/headers';
import Link from 'next/link';
import { getSessionFromHeaders } from '@/lib/rbac-server';
import { mysqlPool } from '@/lib/db';
import StudentEmptyState from '@/components/student/StudentEmptyState';
import CourseBanner from '@/components/student/CourseBanner';
import {
  IconBook, IconPlay, IconArrowRight,
  IconClock, IconCheckCircle, IconAward,
} from '@/components/student/StudentIcons';

export const revalidate = 0;

/* v2 (PW grammar, light) tokens — dashboard wale hi */
const SECTION_TITLE = 'text-[17px] font-bold leading-snug text-gray-900';
const CARD =
  'rounded-xl border border-gray-200 bg-white shadow-[0_1px_2px_rgba(16,24,40,0.05)]';

function fmtDate(d: any): string {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch {
    return '';
  }
}

/** Progress ring — sirf asal % par (total > 0 ho tabhi caller lagata hai).
 *  Banner ke upar rehta hai, isliye halka track + gold progress. */
function ProgressRing({ pct, size = 46 }: { pct: number; size?: number }) {
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }} role="img" aria-label={`${clamped}% complete`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="rgba(255,255,255,0.35)" strokeWidth={stroke} fill="rgba(10,6,24,0.38)" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          stroke="#f5b942" strokeWidth={stroke} fill="none" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * clamped) / 100}
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-black text-white">{clamped}%</span>
    </div>
  );
}

/** Ek course ki resume/next lecture (asal LectureProgress se; na mile to null) */
async function lecturePointers(studentId: string, courseId: string) {
  let resumeLecture: { id: string; title: string } | null = null;
  let nextLecture: { id: string; title: string } | null = null;
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM LectureProgress lp
         JOIN Lectures l ON l.id = lp.lectureId
         JOIN Chapters ch ON ch.id = l.chapterId
         JOIN Subjects s ON s.id = ch.subjectId
        WHERE lp.studentId = ? AND s.courseId = ?
          AND lp.positionSeconds > 0
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY lp.lastWatchedAt DESC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) resumeLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* pointer nahi — plain learn link chalega */ }
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT l.id, l.title FROM Subjects s
         JOIN Chapters ch ON ch.subjectId = s.id
         JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = ?
        WHERE s.courseId = ?
          AND (lp.isCompleted IS NULL OR lp.isCompleted = 0)
        ORDER BY s.sortOrder ASC, ch.sortOrder ASC, l.sortOrder ASC LIMIT 1`,
      [studentId, courseId]
    );
    if (rows?.[0]) nextLecture = { id: String(rows[0].id), title: rows[0].title };
  } catch { /* ignore */ }
  return { resumeLecture, nextLecture };
}

export default async function MyCoursesPage() {
  const session = await getSessionFromHeaders(headers());
  if (!session) return null;

  const studentId = (session as any).userId as string;

  // Enrolled courses + asal lecture progress (ek aggregate query, N+1 nahi).
  // Aakhri dekhi gayi activity sabse upar — "jahan chhoda tha" wala order.
  let myCourses: any[] = [];
  try {
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.slug, c.description, c.thumbnailUrl, c.price, c.status,
              e.enrolledAt,
              COUNT(DISTINCT l.id) AS totalLectures,
              COUNT(DISTINCT CASE WHEN lp.isCompleted = 1 THEN l.id END) AS completedLectures,
              MAX(lp.lastWatchedAt) AS lastActivityAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
         LEFT JOIN Subjects s ON s.courseId = c.id
         LEFT JOIN Chapters ch ON ch.subjectId = s.id
         LEFT JOIN Lectures l ON l.chapterId = ch.id
         LEFT JOIN LectureProgress lp ON lp.lectureId = l.id AND lp.studentId = e.studentId
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        GROUP BY c.id, c.title, c.slug, c.description, c.price, c.status, e.enrolledAt
        ORDER BY (lastActivityAt IS NULL), lastActivityAt DESC, e.enrolledAt DESC`,
      [studentId]
    );
    myCourses = rows || [];
  } catch {
    // Fallback: bina progress wali purani query — course list to dikhe
    const [rows]: any = await mysqlPool.query(
      `SELECT c.id, c.title, c.slug, c.description, c.thumbnailUrl, c.price, c.status, e.enrolledAt
         FROM StudentEnrollments e
         JOIN Courses c ON e.courseId = c.id
        WHERE e.studentId = ? AND e.status = 'ACTIVE'
        ORDER BY e.enrolledAt DESC`,
      [studentId]
    );
    myCourses = (rows || []).map((c: any) => ({ ...c, totalLectures: 0, completedLectures: 0 }));
  }

  // Resume/next pointers har enrolled course ke liye (parallel, best-effort)
  myCourses = await Promise.all(
    myCourses.map(async (c) => ({ ...c, ...(await lecturePointers(studentId, String(c.id))) }))
  );

  const totalCompleted = myCourses.reduce((s, c) => s + (Number(c.completedLectures) || 0), 0);
  const totalLecturesAll = myCourses.reduce((s, c) => s + (Number(c.totalLectures) || 0), 0);
  const overallPct = totalLecturesAll === 0 ? 0 : Math.round((totalCompleted / totalLecturesAll) * 100);

  // Real published courses the student has NOT enrolled in (explore section)
  const enrolledIds = myCourses.map((c) => c.id);
  let exploreCourses: any[] = [];
  try {
    const [allRows]: any = await mysqlPool.query(
      `SELECT id, title, slug, description, thumbnailUrl, price FROM Courses WHERE status = 'PUBLISHED' ORDER BY createdAt DESC LIMIT 6`
    );
    exploreCourses = (allRows || []).filter((c: any) => !enrolledIds.includes(c.id));
  } catch {
    exploreCourses = [];
  }

  return (
    <main className="mx-auto w-full max-w-[72rem] space-y-5 px-4 py-5 pb-10">
      {/* ── Page header ──────────────────────────────────── */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-[22px] font-extrabold leading-tight text-gray-900">My Courses</h1>
          <p className="mt-1 max-w-xl text-[13px] leading-relaxed text-gray-500">
            Jahan chhoda tha, wahin se jaari rakho — tumhare saare enrolled courses aur unki asal
            progress yahan hai.
          </p>
        </div>
        {myCourses.length > 0 && (
          <Link
            href="/app/courses"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-300 bg-white px-4 py-2 text-[12.5px] font-bold text-gray-700 transition hover:border-violet-300 hover:text-[#6d28d9]"
          >
            Explore Courses
            <IconArrowRight size={13} />
          </Link>
        )}
      </div>

      {/* ── Asal progress summary — safed stat card (labels poore,
          koi truncation nahi; sirf lectures data ho tab) ──── */}
      {myCourses.length > 0 && totalLecturesAll > 0 && (
        <div className={`flex flex-wrap items-center gap-x-10 gap-y-4 px-5 py-4 ${CARD}`}>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Enrolled Courses</p>
            <p className="mt-0.5 text-[22px] font-extrabold leading-none text-gray-900">{myCourses.length}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Lectures Completed</p>
            <p className="mt-0.5 text-[22px] font-extrabold leading-none text-gray-900">
              {totalCompleted}
              <span className="text-sm font-bold text-gray-400"> / {totalLecturesAll}</span>
            </p>
          </div>
          <div className="min-w-[180px] flex-1">
            <div className="mb-1.5 flex items-center justify-between gap-3">
              <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Kul Progress</span>
              <span className="text-[13px] font-extrabold text-[#6d28d9]">{overallPct}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-gray-100">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942] transition-all duration-700"
                style={{ width: `${overallPct}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Enrolled courses ───────────────────────────────── */}
      <section aria-label="Continue Learning">
        <div className="mb-3 flex flex-wrap items-center gap-2.5">
          <h2 className={SECTION_TITLE}>Continue Learning</h2>
          <span className="rounded-full bg-violet-50 px-2.5 py-0.5 text-[11.5px] font-bold text-[#6d28d9]">
            {myCourses.length} enrolled
          </span>
        </div>
        {myCourses.length === 0 ? (
          <StudentEmptyState
            icon={<IconBook size={22} />}
            title="Abhi koi course nahi liya hai"
            description="Tumne abhi tak kisi course me enroll nahi kiya. Courses dekho, apne goal ke hisaab se course chuno aur padhai aaj se shuru karo."
            actionText="Courses dekhein"
            actionHref="/app/courses"
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {myCourses.map((course) => {
              const total = Number(course.totalLectures) || 0;
              const completed = Number(course.completedLectures) || 0;
              const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
              const done = total > 0 && completed >= total;
              const resume = course.resumeLecture ?? course.nextLecture;
              const continueHref = resume
                ? `/app/learn/${course.id}?lecture=${resume.id}`
                : `/app/learn/${course.id}`;
              // Chip sirf asal progress/enrollment se — koi nakli status nahi
              const stateChip = done
                ? { label: 'Completed', cls: 'bg-emerald-500 text-white' }
                : completed > 0
                  ? { label: 'In Progress', cls: 'bg-[#f5b942] text-[#2a1650]' }
                  : { label: 'Enrolled', cls: 'bg-[#2a1650]/70 text-white backdrop-blur-sm' };
              return (
                <article key={course.id} className={`group flex flex-col overflow-hidden ${CARD} transition hover:shadow-md`}>
                  {/* Banner — asal thumbnail ya designed gradient tile (CourseBanner) */}
                  <CourseBanner
                    src={course.thumbnailUrl}
                    title={course.title}
                    seed={String(course.slug || course.id)}
                  >
                    <span className={`absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-wider shadow ${stateChip.cls}`}>
                      <IconCheckCircle size={11} /> {stateChip.label}
                    </span>
                    {total > 0 && (
                      <span className="absolute bottom-3 right-3">
                        <ProgressRing pct={pct} />
                      </span>
                    )}
                  </CourseBanner>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="line-clamp-2 text-[15px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">
                      {course.title}
                    </h3>
                    {course.description && (
                      <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-relaxed text-gray-500">
                        {course.description}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11.5px] text-gray-400">
                      <span className={`font-bold ${Number(course.price) > 0 ? 'text-gray-900' : 'text-emerald-600'}`}>
                        {Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                      </span>
                      {course.enrolledAt && (
                        <span className="flex items-center gap-1">
                          <IconClock size={12} /> Enrolled {fmtDate(course.enrolledAt)}
                        </span>
                      )}
                    </div>

                    {/* Asal progress */}
                    {total > 0 ? (
                      <div className="mt-4">
                        <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                          <span className="text-gray-500">{completed} / {total} lectures</span>
                          <span className="font-bold text-[#6d28d9]">{pct}% Complete</span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#6d28d9] to-[#f5b942] transition-all duration-700"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        {done ? (
                          <p className="mt-2 text-[11.5px] font-semibold text-emerald-600">🎉 Course poora ho gaya — badhai ho!</p>
                        ) : course.resumeLecture ? (
                          <p className="mt-2 line-clamp-1 text-[11.5px] text-gray-500">
                            <span className="font-semibold text-gray-800">Wahin se jaari rakho:</span> {course.resumeLecture.title}
                          </p>
                        ) : course.nextLecture ? (
                          <p className="mt-2 line-clamp-1 text-[11.5px] text-gray-500">
                            <span className="font-semibold text-gray-800">Up next:</span> {course.nextLecture.title}
                          </p>
                        ) : null}
                      </div>
                    ) : (
                      <p className="mt-4 text-[11.5px] text-gray-400">
                        Is course ki lectures jald aa rahi hain.
                      </p>
                    )}

                    <div className="mt-auto pt-4">
                      <Link
                        href={continueHref}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-5 py-2.5 text-[13px] font-bold text-white transition-colors hover:bg-[#5b21b6]"
                      >
                        {done ? <IconCheckCircle size={14} /> : <IconPlay size={14} />}
                        {done ? 'Dobara dekho' : 'Continue'}
                      </Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>

      {/* ── Explore more (real published courses only) ──────── */}
      {exploreCourses.length > 0 && (
        <section aria-label="Explore More">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className={SECTION_TITLE}>Explore More</h2>
              <span className="text-[12.5px] text-gray-400">Available courses</span>
            </div>
            <Link href="/app/courses" className="text-[13px] font-bold text-[#6d28d9] hover:text-[#5b21b6]">
              View all →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exploreCourses.slice(0, 3).map((course) => (
              <Link
                key={course.id}
                href={`/app/courses/${course.id}`}
                className={`group flex flex-col overflow-hidden ${CARD} transition hover:shadow-md`}
              >
                <CourseBanner
                  src={course.thumbnailUrl}
                  title={course.title}
                  seed={String(course.slug || course.id)}
                >
                  <span className="absolute right-3 top-3 rounded-full bg-white px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#6d28d9] shadow">
                    {Number(course.price) > 0 ? `₹${Number(course.price).toLocaleString('en-IN')}` : 'Free'}
                  </span>
                </CourseBanner>
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-4 line-clamp-2 text-[14px] font-bold leading-snug text-gray-900 transition-colors group-hover:text-[#6d28d9]">
                    {course.title}
                  </h3>
                  <span className="mt-auto inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#6d28d9] px-4 py-2.5 text-center text-[13px] font-bold text-[#6d28d9] transition-colors group-hover:bg-violet-50">
                    View details <IconArrowRight size={13} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ── Motivation strip (honest, no fake stats) ─────── */}
      {myCourses.length > 0 && (
        <div className="flex items-center gap-4 rounded-xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
            <IconAward size={24} />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900">Keep the streak going</p>
            <p className="mt-0.5 text-[12.5px] leading-relaxed text-gray-500">
              Upar wale course se aaj ki agli lecture poori karo — chhoti jeet roz badi taiyaari banati hai.
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
